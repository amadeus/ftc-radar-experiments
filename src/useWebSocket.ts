import {useEffect, useState} from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export default function useWebSocket(port = 8020) {
  const [connected, setConnected] = useState<ConnectionState>('disconnected');
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${port}`);
    setConnected('connecting');

    socket.addEventListener('open', (event) => {
      setConnected('connected');
      console.log('useWebSocket.open', event);
    });
    socket.addEventListener('message', (event) => {
      console.log('useWebSocket.message', event);
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
  return {connected};
}
