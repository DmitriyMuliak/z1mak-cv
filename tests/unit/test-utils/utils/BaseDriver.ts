import { InteractorConstructor } from '@interactors/html';

export const createDriver = <
  // We accept any InteractorConstructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends InteractorConstructor<any, any, any, any>,
  R,
>(
  InteractorClass: C,
  config: {
    setCustomProperties: (instance: ReturnType<C>) => R;
    options?: ExtractFilters<C> | string;
  },
): ReturnType<C> & R => {
  const instance = InteractorClass(config.options) as ReturnType<C>;

  const childComponents = config.setCustomProperties(instance);

  return Object.assign(instance, childComponents);
};

export const extendsDriver = <P extends object, R extends object>(
  parentDriver: P,
  config: {
    setCustomProperties: (root: P) => R;
  },
): P & R => {
  const newProperties = config.setCustomProperties(parentDriver);
  return Object.assign({}, parentDriver, newProperties);
};

// Get second argument (FP - FilterParams) - by default it's not exported by library
// InteractorConstructor<Element, FP, FM, AM>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractFilters<T> = T extends InteractorConstructor<any, infer FP, any, any> ? FP : never;
