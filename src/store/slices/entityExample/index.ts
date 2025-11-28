import { sliceCreator } from '@/store/sliceCreator';
import { RootStore } from '@/store/types';
import { EntitySlice, SomeObj } from './types';
import { createListSlice } from '@/store/utils/list';
import { createPatcher, createSetter, createInlineSetter } from '@/store/utils/setValue';

const createInnerEntitySlice = sliceCreator<EntitySlice['topEntitySlice'], 'innerEntitySlice'>(
  'innerEntitySlice',
  (set, _get, _api) => {
    return {
      innerEntitySlice: {
        innerValue: false,
        ...createSetter(set),
      },
    };
  },
);

export const createEntitySlice = sliceCreator<RootStore, 'topEntitySlice'>(
  'topEntitySlice',
  (set, get, api) => {
    return {
      topEntitySlice: {
        isBrandCool: false,
        someInnerObject: {
          name: '',
          age: 30,
        },

        userList: createListSlice<SomeObj, RootStore['topEntitySlice'], 'userList'>('userList', {
          // defaultValue: [{ name: 'hello' }],
        })(set, get, api).list,

        ...createInnerEntitySlice(set, get, api),

        ...createInlineSetter(set),

        ...createPatcher(set),

        setValue(key, value) {
          set((state) => {
            state[key] = value;
          });
        },

        memValue: createSetter(set).setValue,
      },
    };
  },
);
