import {create} from 'zustand';
import type {SocketUpdate, SocketInit, WorldStateItem, Path, SquadronId} from '../types';
import {MAX_WORLD_STATES, SocketActions} from '../constants';
import {Vector3, Vector2} from 'three';
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
              paths = muxPaths(newPaths, paths, state.mission_time);
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
            const paths = muxPaths(newPaths, state.paths, payload.data.mission_time);
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
    const currentPosition = {
      mission_time: state.mission_time,
      x: sum.x,
      y: sum.y,
      z: sum.z,
    };
    squadronPoints.push({
      id: squadronState.squadronId,
      units: squadronState.points.length,
      army: squadronState.army,
      currentPosition,
      points: [currentPosition],
    });
  }
  return squadronPoints;
}

// NOTE(amadeus): This is horrible AI code lol.. probably revisit it for proper
// type safety...
function timeToMilliseconds(timeStr: string) {
  const [hours, minutes, seconds] = timeStr.split(':');
  const [secs, millis] = seconds.split('.');
  return parseInt(hours) * 3600000 + parseInt(minutes) * 60000 + parseInt(secs) * 1000 + parseInt(millis);
}

// NOTE(amadeus): This is horrible AI code lol.. probably revisit it for proper
// type safety...
function checkTimeDifference(time1: string, time2: string) {
  const time1Ms = timeToMilliseconds(time1);
  const time2Ms = timeToMilliseconds(time2);
  const diff = Math.abs(time1Ms - time2Ms);
  const tenMinutesInMs = 10 * 60 * 1000;
  return diff > tenMinutesInMs;
}

// Take newly generated paths from a state update and mix them into existing
// paths if they exist, otherwise add them to map data structure
function muxPaths(newPaths: Path[], paths: Map<SquadronId, Path>, missionTime: string): Map<SquadronId, Path> {
  if (newPaths.length === 0 && paths.size === 0) {
    return paths;
  }
  const fixedPaths: Map<SquadronId, Path> = new Map();
  for (const path of newPaths) {
    let oldPath = paths.get(path.id);
    if (oldPath == null) {
      fixedPaths.set(path.id, path);
    } else {
      oldPath = {...oldPath, currentPosition: path.currentPosition};
      const lastPoint = oldPath.points[oldPath.points.length - 1];
      const {currentPosition} = path;
      const oldPointVector = new Vector2(lastPoint.x, lastPoint.y);
      const newPointVector = new Vector2(currentPosition.x, currentPosition.y);
      const distance = Math.abs(oldPointVector.distanceTo(newPointVector));
      let modifiedPoints = false;
      // If we've travelled far enough to warrant another arrow, lets add it
      if (distance > 3000) {
        modifiedPoints = true;
        oldPath.points = [...oldPath.points, currentPosition];
      }
      while (
        oldPath.points.length > 1 &&
        checkTimeDifference(currentPosition.mission_time, oldPath.points[0].mission_time)
      ) {
        if (!modifiedPoints) {
          oldPath.points = [...oldPath.points];
          modifiedPoints = true;
        }
        oldPath.points.shift();
      }
      fixedPaths.set(oldPath.id, oldPath);
      paths.delete(oldPath.id);
    }
  }

  // Prune out older paths if needed
  for (let [, ghostPath] of paths) {
    let modifiedPoints = false;
    while (ghostPath.points[0] != null && checkTimeDifference(missionTime, ghostPath.points[0].mission_time)) {
      if (!modifiedPoints) {
        ghostPath = {...ghostPath, points: [...ghostPath.points]};
        modifiedPoints = true;
      }
      ghostPath.points.shift();
    }
    if (ghostPath.points.length > 0) {
      fixedPaths.set(ghostPath.id, ghostPath);
    }
    paths.delete(ghostPath.id);
  }
  return fixedPaths;
}
