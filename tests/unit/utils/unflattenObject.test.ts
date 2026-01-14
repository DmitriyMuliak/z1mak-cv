import { describe, expect, it } from 'vitest';
import { unflattenObject } from '@/utils/unflattenObject';

describe('unflattenObject', () => {
  it('reconstructs nested objects and arrays from flat pairs', () => {
    const flatArray = [
      { key: 'name', value: 'someValue' },
      { key: 'arrValue', value: 1 },
      { key: 'arrValue', value: 2 },
      { key: 'arrValue', value: 'some' },
      { key: 'innerObj.prop', value: 'some1' },
      { key: 'innerObj.prop', value: 'some2' },
    ];

    const expected = {
      name: 'someValue',
      arrValue: [1, 2, 'some'],
      innerObj: { prop: ['some1', 'some2'] },
    };

    expect(unflattenObject<typeof expected>(flatArray)).toEqual(expected);
  });
});
