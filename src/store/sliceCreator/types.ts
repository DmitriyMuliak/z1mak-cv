import { StateCreator } from 'zustand';
import { RootStore } from '../types';

// middleware pipeline: immer → devtools
type Middlewares = [['zustand/immer', never], ['zustand/devtools', never]];

export type SliceCreator<Parent, Slice> = StateCreator<Parent, Middlewares, [], Slice>;

export type RootSlice<Slice> = StateCreator<RootStore, Middlewares, [], Slice>;
