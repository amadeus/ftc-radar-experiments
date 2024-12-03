import {useEffect, useState} from 'react';
import type {WebsocketConnectionState, SocketInit, SocketUpdate} from '../types';
import Store from './Store';

export default function useWebSocket() {
  const [connected, setConnected] = useState<WebsocketConnectionState>('disconnected');
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
        Store.getState().dispatch(payload);
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
    return () => socket.close();
  }, []);
  return connected;
}
