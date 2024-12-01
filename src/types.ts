export interface Aircraft {
  army: number;
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface Army {
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
    sector_size: number;
  };
  map_Name: string;
  // FIXME: Can this annotation be improved?
  mission_time: string;
}

export type WebsocketConnectionState = 'disconnected' | 'connecting' | 'connected';
