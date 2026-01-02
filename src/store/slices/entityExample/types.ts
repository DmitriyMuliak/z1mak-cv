import type { ListSlice } from '@/store/utils/list';
import type { InlineSetter, SetPatch, SetValue } from '@/store/utils/setValue';

export interface SomeObj {
  name: string;
}

export interface EntitySlice {
  topEntitySlice: {
    isBrandCool: boolean;
    userList: ListSlice<SomeObj>;
    someInnerObject: { name: string; age: number };

    setValue: <K extends keyof EntitySlice['topEntitySlice']>(
      key: K,
      value: EntitySlice['topEntitySlice'][K],
    ) => void;

    setter: InlineSetter<EntitySlice['topEntitySlice']>['setter'];

    setPatch: SetPatch<EntitySlice['topEntitySlice']>['setPatch'];

    memValue: SetValue<EntitySlice['topEntitySlice']>['setValue'];

    innerEntitySlice: {
      innerValue: boolean;
      setValue: <K extends keyof EntitySlice['topEntitySlice']['innerEntitySlice']>(
        key: K,
        value: EntitySlice['topEntitySlice']['innerEntitySlice'][K],
      ) => void;
    };
  };
}
