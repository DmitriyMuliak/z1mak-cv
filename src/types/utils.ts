export type DeepKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${DeepKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];
