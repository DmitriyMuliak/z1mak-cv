import type { ValidationKeys } from '@/types/translations';
import {
  CustomKeyPrefix,
  OptionsPrefix,
  rulesDivider,
  valueDivider,
  valuesDivider,
} from './consts';

export const createCustomKey = (key: ValidationKeys) => `${CustomKeyPrefix}${key}` as const;

// key - string which starts with "custom_key:" => custom_key:any_key"
// placeholders - object with keys like "max", "min", "customKey" and values
// Return string like - "custom_key:someKey;custom_options:[max#10;min#2;customKey#some string]"
export const createTempCustomMessage = (
  key: ValidationKeys,
  placeholders: Record<string, unknown>,
) => {
  const customKey = createCustomKey(key);

  const startOptions = OptionsPrefix + '[';
  const middleOptions = Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc + `${key}${valueDivider}${value}${valuesDivider}`;
  }, startOptions);
  const middleOptionsWithoutLastDivider = middleOptions.substring(0, middleOptions.length - 1);
  const endOptions = middleOptionsWithoutLastDivider + ']';

  const result = customKey + rulesDivider + endOptions;
  return result;
};
