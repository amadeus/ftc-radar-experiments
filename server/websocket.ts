import {WebSocketServer, type WebSocket} from 'ws';
// @ts-expect-error bun doesn't care about this, lol
import updates from './updates.json';

const PORT = 8020;

const server = new WebSocketServer({port: PORT});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

server.on('connection', (socket: WebSocket) => {
  console.log('WebSocket: Client Connected');

  let index = 0;
  const interval = setInterval(() => {
    if (index >= updates.length) {
      index = 0;
    }
    const update = updates[index];
    socket.send(JSON.stringify(update));
    index++;
  }, 200);

  socket.on('close', () => {
    console.log('WebSocket: Client Disconnected');
    clearInterval(interval);
  });
});
