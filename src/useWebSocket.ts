import {useEffect, useState} from 'react';

interface Aircraft {
  army: number;
  id: string;
  x: number;
  y: number;
  z: number;
}

interface Army {
  id: number;
  countries: string;
  name: string;
}

export interface WorldStateItem {
  aircrafts: Aircraft[];
  armies: Army[];
  battle_area: {
    x: number;
    y: number;
    w: number;
    h: number;
    sectory_size: number;
  };
  map_Name: string;
  // FIXME: Can this annotation be improved?
  mission_time: string;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export default function useWebSocket(port = 8020) {
  const [connected, setConnected] = useState<ConnectionState>('disconnected');
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
