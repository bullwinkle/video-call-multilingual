import * as WebSocket from 'ws';
import {rawMessageToString} from "./utils";

const wss = new WebSocket.Server({port: 8080});

wss.on('connection', (ws) => {
  console.log('connection', ws);
  ws.on('message', (message: Buffer | ArrayBuffer | Buffer[], isBinary) => {

    const messageString = rawMessageToString(message);

    console.log('messageString', messageString);

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  });
});


console.log(`Signaling server is running`);
