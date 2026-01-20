import { unflattenObject } from '@/utils/react-hook-form-utils/rhf-unflattenObject';
import { describe, expect, it } from 'vitest';

describe('unflattenObject', () => {
  it('reconstructs nested objects and arrays from RHF dot-notation keys', () => {
    const flatArray = [
      { key: 'name', value: 'someValue' },
      { key: 'arrValue.0', value: 1 },
      { key: 'arrValue.1', value: 2 },
      { key: 'arrValue.2', value: 'some' },
      { key: 'innerObj.prop.0', value: 'some1' },
      { key: 'innerObj.prop.1', value: 'some2' },
    ];

    const expected = {
      name: 'someValue',
      arrValue: [1, 2, 'some'],
      innerObj: { prop: ['some1', 'some2'] },
    };

    expect(unflattenObject<typeof expected>(flatArray)).toEqual(expected);
  });
});
