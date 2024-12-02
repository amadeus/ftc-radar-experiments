import {WebSocketServer, type WebSocket} from 'ws';
import updates from './updates.json';
import type {WorldStateItem, SocketUpdate, SocketInit} from '../types';

const PORT = 8020;
const UPDATE_RATE = 200;

const server = new WebSocketServer({port: PORT});

const connectedSockets: Set<WebSocket> = new Set();

let index = 0;
let intervalId: NodeJS.Timeout | null = null;
let worldState: WorldStateItem[] = [];

function iterateOverSockets() {
  if (connectedSockets.size === 0 && intervalId != null) {
    console.log('WebSocket: No more clients connected, disabling interval');
    clearInterval(intervalId);
    intervalId = null;
    return;
  }
  let initialData: SocketInit | undefined;
  if (index >= updates.length) {
    index = 0;
    worldState = [];
    initialData = {type: 'init', data: worldState};
  }
  const update: WorldStateItem = updates[index];
  if (update == null) throw new Error('iterateOverSockets: Invalid update');
  worldState.push(update);
  while (worldState.length > 20) {
    worldState.shift();
  }

  const updateDataJSON = JSON.stringify({type: 'update', data: update} as SocketUpdate);
  const initialDataJSON = initialData != null ? JSON.stringify(initialData) : undefined;
  for (const socket of connectedSockets) {
    if (initialDataJSON != null) {
      socket.send(initialDataJSON);
    }
    socket.send(updateDataJSON);
  }
  index++;
}

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

server.on('connection', (socket: WebSocket) => {
  connectedSockets.add(socket);
  console.log('WebSocket: Client Connected');

  socket.on('close', () => {
    connectedSockets.delete(socket);
    console.log('WebSocket: Client Disconnected');
  });

  socket.send(JSON.stringify({type: 'init', data: worldState}));
  if (intervalId == null) {
    console.log('WebSocket: Beginning update loop');
    intervalId = setInterval(iterateOverSockets, UPDATE_RATE);
  }
});
