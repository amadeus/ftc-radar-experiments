import {create} from 'zustand';
import type {SocketUpdate, SocketInit, WorldStateItem, Path, SquadronId} from '../types';
import {MAX_WORLD_STATES, SocketActions} from '../constants';
import {Vector3} from 'three';
import {parseId} from '../utils';

type SocketPayload = SocketUpdate | SocketInit;

type StoreDispatch = (payload: SocketPayload) => void;

interface StoreState {
  worldState: WorldStateItem[];
  paths: Map<SquadronId, Path>;
  dispatch: StoreDispatch;
}

export default create<StoreState>()((set) => {
  return {
    worldState: [],
    paths: new Map(),
    dispatch(payload: SocketPayload) {
      // NOTE(amadeus): Test whether we need a batch update or not...
      set((state) => {
        switch (payload.type) {
          case SocketActions.INITIALIZE: {
            const {data: worldState} = payload;
            while (worldState.length > MAX_WORLD_STATES) {
              worldState.shift();
            }
            let paths = new Map();
            for (const state of worldState) {
              const newPaths = processAircraft(state);
              paths = muxPaths(newPaths, paths);
            }
            return {worldState, paths};
          }
          case SocketActions.UPDATE: {
            const worldState = [...state.worldState];
            worldState.push(payload.data);
            while (worldState.length > MAX_WORLD_STATES) {
              worldState.shift();
            }
            const newPaths = processAircraft(payload.data);
            const paths = muxPaths(newPaths, state.paths);
            return {worldState, paths};
          }
          default:
            return state;
        }
      });
    },
  };
});

interface AggregatePoint {
  squadronId: SquadronId;
  vector: Vector3;
  unitId: number;
}

interface AggregateState {
  squadronId: SquadronId;
  lowestUnitId: number;
  army: number;
  points: AggregatePoint[];
}

function processAircraft(state: WorldStateItem) {
  const aggregateState = new Map<string, AggregateState>();

  // Aggregate all the aircraft into groups based on squadron id
  for (const aircraft of state.aircrafts) {
    const {unitId, squadronId} = parseId(aircraft.id);
    const squadronState: AggregateState = aggregateState.get(squadronId) ?? {
      squadronId,
      points: [],
      lowestUnitId: Infinity,
      army: -1,
    };
    squadronState.army = aircraft.army;
    squadronState.lowestUnitId = Math.min(squadronState.lowestUnitId, unitId);
    // TODO(amadeus): Once we have something in place to understand radar
    // coverage, we probably should determine whether to drop this point or not
    squadronState.points.push({
      squadronId,
      unitId,
      vector: new Vector3(aircraft.x, aircraft.y, aircraft.z),
    });
    aggregateState.set(squadronId, squadronState);
  }

  const squadronPoints: Path[] = [];
  for (const [, squadronState] of aggregateState) {
    const sum = new Vector3();
    for (const point of squadronState.points) {
      sum.add(point.vector);
      // Add some extra emphasis if the squadron leader
      if (point.unitId === squadronState.lowestUnitId) {
        sum.add(point.vector);
        sum.add(point.vector);
      }
    }
    sum.divideScalar(squadronState.points.length + 2);
    squadronPoints.push({
      id: squadronState.squadronId,
      units: squadronState.points.length,
      army: squadronState.army,
      points: [
        {
          mission_time: state.mission_time,
          x: sum.x,
          y: sum.y,
          z: sum.z,
        },
      ],
    });
  }
  return squadronPoints;
}

// Take newly generated paths from a state update and mix them into existing
// paths if they exist, otherwise add them to map data structure
function muxPaths(newPaths: Path[], paths: Map<SquadronId, Path>): Map<SquadronId, Path> {
  if (newPaths.length === 0) {
    return paths;
  }
  paths = new Map(paths);
  for (const path of newPaths) {
    let oldPath = paths.get(path.id);
    if (oldPath == null) {
      paths.set(path.id, path);
    } else {
      oldPath = {...oldPath, points: [...oldPath.points, path.points[0]]};
      // TODO(amadeus): We should also drop points based on mission time/color
      // coding rules
      while (oldPath.points.length > MAX_WORLD_STATES) {
        oldPath.points.shift();
      }
      paths.set(oldPath.id, oldPath);
    }
  }
  // TODO(amadeus): We also need to iterate over any other points we haven't
  // already processed from newPaths and begin removing old points that have.
  // This could include aircraft/squadrons that have been destroyed or left
  // radar coverage
  return paths;
}
