import { flattenObject } from '@/utils/react-hook-form-utils/rhf-flattenObject';
import { unflattenObject } from '@/utils/react-hook-form-utils/rhf-unflattenObject';
import { describe, expect, it } from 'vitest';

describe('flattenObject', () => {
  it('flattens nested objects and arrays into RHF-compatible dot-notation paths', () => {
    const input = {
      name: 'someValue',
      arrValue: [1, 2, 'some'],
      innerObj: { prop: ['some1', 'some2'] },
    };

    expect(flattenObject(input)).toEqual([
      { key: 'name', value: 'someValue' },
      { key: 'arrValue.0', value: 1 },
      { key: 'arrValue.1', value: 2 },
      { key: 'arrValue.2', value: 'some' },
      { key: 'innerObj.prop.0', value: 'some1' },
      { key: 'innerObj.prop.1', value: 'some2' },
    ]);
  });
});

describe('Round-trip stability', () => {
  it('should restore the original object exactly', () => {
    const original = {
      user: {
        hobbies: ['coding', 'gaming'],
        details: { age: 30 },
      },
    };

    const flat = flattenObject(original);
    const restored = unflattenObject(flat);

    expect(restored).toEqual(original);
  });
});
