import type { RootStore } from './types';
import { createAppStore } from './createStore';
import { createEntitySlice } from './slices/entityExample';

export const useAppStore = createAppStore<RootStore>((set, get, api) => ({
  ...createEntitySlice(set, get, api),
}));
