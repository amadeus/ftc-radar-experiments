import {create} from 'zustand';
import type {SocketUpdate, SocketInit, WorldStateItem} from '../types';
import {MAX_WORLD_STATES, SocketActions} from '../constants';

type SocketPayload = SocketUpdate | SocketInit;

type StoreDispatch = (payload: SocketPayload) => void;

interface StoreState {
  worldState: WorldStateItem[];
  dispatch: StoreDispatch;
}

export default create<StoreState>()((set) => {
  return {
    worldState: [],
    dispatch(payload: SocketPayload) {
      // NOTE(amadeus): Test whether we need a batch update or not...
      set((state) => {
        switch (payload.type) {
          case SocketActions.INITIALIZE: {
            const {data: worldState} = payload;
            while (worldState.length > MAX_WORLD_STATES) {
              worldState.shift();
            }
            // FIXME: Handle squadron processing here
            return {worldState};
          }
          case SocketActions.UPDATE: {
            const worldState = [...state.worldState];
            worldState.push(payload.data);
            while (worldState.length > MAX_WORLD_STATES) {
              worldState.shift();
            }
            // FIXME: Handle squadron processing here
            return {worldState};
          }
          default:
            return state;
        }
      });
    },
  };
});
