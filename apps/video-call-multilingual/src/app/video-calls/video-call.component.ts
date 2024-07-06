import {Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {webSocket} from 'rxjs/webSocket';
import {CommonModule} from '@angular/common';
import {ICE_SERVER_LIST} from './stun-server-list';


@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './video-call.component.css',
  template: `
    <div class="videos">
      <video class="video video--local" #localVideo autoplay playsinline [muted]="'muted'"></video>
      <video class="video video--remote" #remoteVideo autoplay playsinline controls></video>
    </div>
    <div class="actions">
      <button class="action action--start-call" (click)="startCall()">Start Call</button>
    </div>
  `
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo', {static: true}) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', {static: true}) remoteVideo!: ElementRef<HTMLVideoElement>;

  isInitialized = signal(false);
  localStream!: MediaStream;
  remoteStream!: MediaStream;
  peerConnection!: RTCPeerConnection;
  signalingServer = webSocket({
    // url: `wss://${HOST}`,
    url: `wss://video-call-multilingual-be.onrender.com`,
  });

  ngOnInit() {
    this.initWebRTC();
  }

  async initWebRTC() {
    if (!navigator.mediaDevices || !window?.RTCPeerConnection) return;

    this.peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVER_LIST
    });

    this.localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.remoteStream = new MediaStream();

    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

    this.peerConnection.ontrack = (event) => {
      console.log('track', event);

      this.remoteStream.getTracks().forEach(track => this.remoteStream.removeTrack(track));

      const [stream] = event.streams;

      stream.getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });

      this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    };


    this.peerConnection.onicecandidate = (event) => {
      console.log('icecandidate', event);
      if (event.candidate) {
        this.signalingServer.next(JSON.stringify({candidate: event.candidate}));
      }
    };

    this.signalingServer.subscribe(async (message: any) => {
      console.log('message', message);
      const data = JSON.parse(message);
      console.log('message parsed', data);

      if (data.sdp) {
        const sessionDescription = new RTCSessionDescription(data.sdp);
        await this.peerConnection.setRemoteDescription(sessionDescription);
        console.log('this.peerConnection.remoteDescription?.type', this.peerConnection.remoteDescription?.type, this.peerConnection.remoteDescription);
        if (this.peerConnection.remoteDescription?.type === 'offer') {
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.signalingServer.next(JSON.stringify({sdp: this.peerConnection.localDescription?.toJSON()}));
        }
      } else if (data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate);
        await this.peerConnection.addIceCandidate(candidate);
      }
    });

    this.isInitialized.set(true);
  }

  async startCall() {
    const offer = await this.peerConnection.createOffer();
    console.log('createOffer', offer);
    await this.peerConnection.setLocalDescription(offer);
    console.log('localDescription', this.peerConnection.localDescription);

    const message = {sdp: this.peerConnection.localDescription?.toJSON()};
    console.log('message to send', message);

    this.signalingServer.next(JSON.stringify(message));
  }
}
