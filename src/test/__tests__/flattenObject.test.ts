import { describe, expect, it } from 'vitest';
import { flattenObject } from '@/utils/flattenObject';

describe('flattenObject', () => {
  it('flattens nested objects and arrays into key/value pairs', () => {
    const input = {
      name: 'someValue',
      arrValue: [1, 2, 'some'],
      innerObj: { prop: ['some1', 'some2'] },
    };

    expect(flattenObject(input)).toEqual([
      { key: 'name', value: 'someValue' },
      { key: 'arrValue', value: 1 },
      { key: 'arrValue', value: 2 },
      { key: 'arrValue', value: 'some' },
      { key: 'innerObj.prop', value: 'some1' },
      { key: 'innerObj.prop', value: 'some2' },
    ]);
  });
});
