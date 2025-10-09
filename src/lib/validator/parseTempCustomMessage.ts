import { ruleDivider, rulesDivider, valueDivider, valuesDivider } from './consts';
import { parseCustomKey } from './parseCustomKey';

export const parseTempCustomMessage = (tempMessage: string) => {
  const [customKey, customOptions] = tempMessage.split(rulesDivider);
  const [_keyPrefix, keyName] = parseCustomKey(customKey);
  const [_optionsPrefix, optionsWithBrackets] = customOptions.split(ruleDivider);
  const options = optionsWithBrackets
    .replace(/\[/g, '') // replace start bracket
    .replace(/\]/g, '') // replace closed bracket
    .split(valuesDivider);
  const placeholders = options.reduce(
    (acc, val) => {
      const [key, value] = val.split(valueDivider);
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  return { keyName, placeholders };
};
