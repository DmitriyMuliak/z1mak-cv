import { TranslationFn } from '@/types/translations';
import { CustomKeyPrefix, OptionsPrefix } from './consts';
import { parseCustomKey } from './parseCustomKey';
import { parseTempCustomMessage } from './parseTempCustomMessage';

export const resolveMessage = (message: string, t: TranslationFn) => {
  if (!message.startsWith(CustomKeyPrefix)) {
    return message;
  }
  if (!message.includes(OptionsPrefix)) {
    const [_keyPrefix, keyName] = parseCustomKey(message);
    return t(keyName);
  }

  const { keyName, placeholders } = parseTempCustomMessage(message);
  return t(keyName, placeholders);
};
