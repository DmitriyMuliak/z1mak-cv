import { SliceCreator } from '../sliceCreator/types';
import { RootStore } from '../types';

export interface ListSlice<T> {
  arr: T[];
  push: (value: T) => void;
}

interface CreateListSliceOptions<T> {
  defaultValue?: T[];
}

type SliceTypedParams<State, K extends keyof State> = {
  // actually slice: Draft<State> but for simplify ts we use pure <State> type
  set: (fn: (slice: State) => void) => void;
  get: () => State;
  api: Parameters<SliceCreator<RootStore, RootStore>>[2];
  return: Record<K, State[K]>;
};

export const createListSlice = <T, State extends Record<K, ListSlice<T>>, K extends keyof State>(
  entityKey: K,
  options: CreateListSliceOptions<T>,
) => {
  console.log(options);

  type P = SliceTypedParams<State, K>;

  return (set: P['set'], _get: P['get'], _api: P['api']) => {
    return {
      list: {
        arr: options.defaultValue || [],
        push(value: T) {
          set((state) => {
            state[entityKey].arr.push(value);
          });
        },
      } as unknown as State[K],
    };
  };
};
