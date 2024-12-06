import {WebSocketServer, type WebSocket} from 'ws';
import type {WorldStateItem, SocketUpdate, SocketInit} from '../types';
import {PORT, UPDATE_RATE} from './server_constants';
import {SocketActions} from '../constants';

const updates = (await Bun.file('./server/updates-gzip.txt').text()).split('\n');
const SERVER_TICK = 3;

function decodeUpdate(updateFromServer: string | null, index: number): [WorldStateItem | null, boolean] {
  if (updateFromServer == null || updateFromServer.trim() === '') {
    return [null, false];
  }
  let textContent: string | undefined;
  try {
    const binary = new Uint8Array(
      atob(updateFromServer)
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    textContent = new TextDecoder().decode(Bun.gunzipSync(binary));
    return [JSON.parse(textContent), false];
  } catch (e) {
    console.log(`DECODE FAILURE =======================================`);
    console.error(e);
    console.log(`======================================================`);
    console.log(`Crashed on line: ${index} with data: "${textContent ?? updateFromServer}"`);
    return [null, true];
  }
}

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
  let initialDataJSON: string | undefined;
  // Loop the upates... because
  if (index >= updates.length) {
    index = 0;
    worldState = [];
    initialDataJSON = JSON.stringify({type: SocketActions.INITIALIZE, data: []} as SocketInit);
  }
  const [update, error]: [WorldStateItem | null, boolean] = decodeUpdate(updates[index], index);
  if (update == null && !error) {
    index = 0;
    worldState = [];
    console.error('iterateOverSockets: Invalid update, restarting');
    return;
  } else if (!update) {
    index += 3;
    return;
  }
  worldState.push(update);
  while (worldState.length > 20) {
    worldState.shift();
  }

  const updateDataJSON = JSON.stringify({type: SocketActions.UPDATE, data: update} as SocketUpdate);
  for (const socket of connectedSockets) {
    if (initialDataJSON != null) {
      socket.send(initialDataJSON);
    }
    socket.send(updateDataJSON);
  }
  index += SERVER_TICK;
}

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

server.on('connection', (socket: WebSocket) => {
  connectedSockets.add(socket);
  console.log('WebSocket: Client Connected');

  socket.on('close', () => {
    connectedSockets.delete(socket);
    console.log('WebSocket: Client Disconnected');
  });

  socket.send(JSON.stringify({type: SocketActions.INITIALIZE, data: worldState} as SocketInit));
  if (intervalId == null) {
    console.log('WebSocket: Beginning update loop');
    intervalId = setInterval(iterateOverSockets, UPDATE_RATE);
  }
});
