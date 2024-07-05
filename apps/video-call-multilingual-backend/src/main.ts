// server.js
import WebSocket from 'ws';
import fs from 'fs';
import https from 'https';

import {getLocalIpAddress, rawMessageToString} from "./utils";

const HOST = '0.0.0.0';
const PORT = 443;

// Загрузите сертификат и ключ
const privateKey = fs.readFileSync('localhost.key', 'utf8');
const certificate = fs.readFileSync('localhost.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

// Создайте HTTPS сервер
const httpsServer = https.createServer(credentials, (req, res) => {
  res.writeHead(200);
  res.end('Hello, HTTPS world!');
});

const wss = new WebSocket.Server({server: httpsServer});

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

const localIpAddress = getLocalIpAddress();

httpsServer.listen(PORT, HOST, () => {
  // console.log(`Signaling server is running on wss://${HOST}:${PORT}`);
  console.log(`Signaling server is running on:`);
  console.log(`
    ➜  Local:   https://${HOST}:${PORT}/
    ➜  Network: https://${localIpAddress}:${PORT}/
  `);
});
