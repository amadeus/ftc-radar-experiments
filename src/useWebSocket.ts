import {useEffect, useState} from 'react';
import type {WorldStateItem, WebsocketConnectionState, SocketInit, SocketUpdate} from '../types';
import {MAX_WORLD_STATES, SocketActions} from '../constants';

export default function useWebSocket() {
  const [connected, setConnected] = useState<WebsocketConnectionState>('disconnected');
  const [states, setStates] = useState<WorldStateItem[]>([]);
  useEffect(() => {
    const socket = new WebSocket('/ws');
    setConnected('connecting');

    socket.addEventListener('open', (event) => {
      setConnected('connected');
      console.log('useWebSocket.open', event);
    });
    socket.addEventListener('message', (event) => {
      try {
        const payload: SocketUpdate | SocketInit = JSON.parse(event.data);
        switch (payload.type) {
          case SocketActions.INITIALIZE:
            setStates(payload.data);
            break;
          case SocketActions.UPDATE:
            setStates((previousStates) => {
              const states = [...previousStates];
              states.push(payload.data);
              if (states.length > MAX_WORLD_STATES) {
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
  }, []);
  return {connected, states};
}
