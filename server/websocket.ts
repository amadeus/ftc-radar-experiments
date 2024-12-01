import {WebSocketServer, type WebSocket} from 'ws';

const PORT = 8020;

const server = new WebSocketServer({port: PORT});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

server.on('connection', (socket: WebSocket) => {
  console.log('WebSocket: Client Connected');

  socket.on('close', () => {
    console.log('WebSocket: Client Disconnected');
  });

  // Actually implement this
  socket.send('Hello!');
});
