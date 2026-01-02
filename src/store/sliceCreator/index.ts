import type { Draft } from 'immer';
import type { SliceCreator } from './types';
import type { RootStore } from '../types';

type SliceApiGlobal = Parameters<SliceCreator<RootStore, RootStore>>[2];

type SliceDefinition<State, K extends keyof State> = (
  set: (fn: (slice: Draft<State[K]>) => void) => void,
  get: () => State[K],
  api: SliceApiGlobal,
) => Record<K, State[K]>;

type SliceWrapperDefinition<State, K extends keyof State> = (
  set: Parameters<SliceCreator<State, Record<K, State[K]>>>[0],
  get: Parameters<SliceCreator<State, Record<K, State[K]>>>[1],
  api: SliceApiGlobal,
) => Record<K, State[K]>;

// Util for creating real slice of state, without access to root from (set/get) functions
export function sliceCreator<State, K extends keyof State>(
  key: K,
  def: SliceDefinition<State, K>,
): SliceWrapperDefinition<State, K> {
  return (set, get, api) => {
    const sliceSet = (fn: (slice: Draft<State[K]>) => void) => {
      set((state) => {
        // ===== THE WORKAROUND (local, explicit, minimal cast) =====
        // TS cannot index Draft<State> with generic K, so we assert that
        // state has the indexed property and that it is a Draft<State[K]>.
        // This cast is local and documents the invariant we rely on:
        const sub = (state as unknown as { [P in K]: Draft<State[P]> })[key];
        fn(sub);
      });
    };

    const sliceGet = () => get()[key];

    return def(sliceSet, sliceGet, api);
  };
}
