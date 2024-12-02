import {useEffect, useState} from 'react';
import type {WorldStateItem, WebsocketConnectionState, SocketInit, SocketUpdate} from '../types';

export default function useWebSocket(port = 8020) {
  const [connected, setConnected] = useState<WebsocketConnectionState>('disconnected');
  const [states, setStates] = useState<WorldStateItem[]>([]);
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${port}`);
    setConnected('connecting');

    socket.addEventListener('open', (event) => {
      setConnected('connected');
      console.log('useWebSocket.open', event);
    });
    socket.addEventListener('message', (event) => {
      try {
        const payload: SocketUpdate | SocketInit = JSON.parse(event.data);
        switch (payload.type) {
          case 'init':
            setStates(payload.data);
            break;
          case 'update':
            setStates((previousStates) => {
              const states = [...previousStates];
              states.push(payload.data);
              if (states.length > 20) {
                states.shift();
              }
              return states;
            });
            break;
        }
      } catch (e) {
        console.error(e);
      }
    });
    socket.addEventListener('error', (event) => {
      console.log('useWebSocket.error', event);
    });
    socket.addEventListener('close', (event) => {
      setConnected('disconnected');
      console.log('useWebSocket.close', event);
    });
    return () => {
      socket.close();
    };
  }, [port]);
  return {connected, states};
}
