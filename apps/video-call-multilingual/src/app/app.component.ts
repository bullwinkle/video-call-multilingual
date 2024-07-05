import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {VideoCallComponent} from "./video-calls/video-call.component";

@Component({
  standalone: true,
  imports: [RouterModule, VideoCallComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'video-call-multilingual';
}
