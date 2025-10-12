import { ValidatorKeys } from '@/types/translations';
import { ruleDivider, CustomKeyPrefixName } from './consts';

export const parseCustomKey = (tempKey: string) =>
  tempKey.split(ruleDivider) as [typeof CustomKeyPrefixName, ValidatorKeys];
