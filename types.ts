import type {SocketActions} from './constants';

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
  map_name: string;
  mission_time: MissionTime;
}

export type WebsocketConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface SocketUpdate {
  type: SocketActions.UPDATE;
  data: WorldStateItem;
}

export interface SocketInit {
  type: SocketActions.INITIALIZE;
  data: WorldStateItem[];
}

export type Tuple = [number, number];

export type STruple = [string, string, string];

export type SquadronId = `${number}.${string}`;

export interface PathPoint {
  missionTime: MissionTime;
  x: number;
  y: number;
  z: number;
}

export interface PathContext {
  id: SquadronId;
  units: number;
  army: number;
  displayId: string;
}

export interface Path extends PathContext {
  currentPosition: PathPoint;
  points: PathPoint[];
}

export type MissionTime = `${number}:${number}:${number}`;
