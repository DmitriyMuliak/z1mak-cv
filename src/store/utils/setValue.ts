import type { StateCreator } from 'zustand';

type ImmerSet<State> = Parameters<StateCreator<State, [['zustand/immer', never]], []>>[0];

export interface SetValue<S extends object> {
  setValue: <K extends keyof S>(key: K, value: S[K]) => void;
}

export const createSetter = <T extends object>(set: ImmerSet<T>) => {
  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    set((state) => {
      (state as unknown as T)[key] = value;
    });
  };

  return { setValue };
};

export interface SetPatch<T extends object> {
  setPatch: (patch: Partial<T>) => void;
}

export const createPatcher = <T extends object>(set: ImmerSet<T>) => {
  const setPatch = (patch: Partial<T>) => {
    set((state) => {
      const draftState = state as unknown as T;
      for (const key in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, key)) {
          const stateKey = key as keyof T;
          const value = patch[stateKey] as T[typeof stateKey];
          draftState[stateKey] = value;
        }
      }
    });
  };

  return { setPatch };
};

type SetterCallback<T extends object> = (set: ImmerSet<T>) => void;

export interface InlineSetter<T extends object> {
  setter: (cb: SetterCallback<T>) => void;
}

export const createInlineSetter = <T extends object>(set: ImmerSet<T>) => {
  const setter = (cb: (set: ImmerSet<T>) => void) => {
    cb(set);
  };

  return { setter };
};
