import { ValidatorKeys } from '@/types/translations';
import { ruleDivider } from './consts';

export const parseCustomKey = (tempKey: string) =>
  tempKey.split(ruleDivider) as [string, ValidatorKeys];
