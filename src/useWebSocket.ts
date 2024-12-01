import {useEffect, useState} from 'react';
import type {WorldStateItem, WebsocketConnectionState} from './types';

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
        const state: WorldStateItem = JSON.parse(event.data);
        setStates((previousStates) => {
          const states = [...previousStates];
          states.push(state);
          if (states.length > 20) {
            states.shift();
          }
          return states;
        });
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
