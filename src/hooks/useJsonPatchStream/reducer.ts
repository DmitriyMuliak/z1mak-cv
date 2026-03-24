import type { StreamState, StreamAction } from './types';

export function createReducer<TData>() {
  return function reducer(
    state: StreamState<TData>,
    action: StreamAction<TData>,
  ): StreamState<TData> {
    switch (action.type) {
      case 'RESET':
        return { data: {} as Partial<TData>, status: 'loading', error: null };
      case 'SNAPSHOT':
        return { data: (action.data ?? {}) as Partial<TData>, status: action.status, error: null };
      case 'PATCH':
        return { ...state, data: action.data };
      case 'DONE':
        return { ...state, status: action.status };
      case 'SET_STATUS':
        return { ...state, status: action.status };
      case 'ERROR':
        return {
          ...state,
          status: 'failed',
          error: { code: action.code, message: action.message },
        };
      default:
        return state;
    }
  };
}
