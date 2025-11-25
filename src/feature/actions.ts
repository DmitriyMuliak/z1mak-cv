'use server';
import { getLocale, getTranslations } from 'next-intl/server';
import { ToAnalyzeSchemaBE } from './schema/form/toAnalyzeSchemaBE';
import { createFormAction } from '@/actions/utils';

// import { privatePrEnv } from '@/utils/processEnv/private';

export const sendToAnalyzeAction = createFormAction(
  ToAnalyzeSchemaBE,
  async (data): SendToAnalyzeActionReturn => {
    const locale = await getLocale();
    const _t = await getTranslations({ namespace: 'validator', locale });

    console.log('SERVER ACTION DATA: ', data);

    // Normalize files into an array of File
    // const files: File[] = Array.isArray(data.files) ? data.files : data.files ? [data.files] : [];
  },
);

function _generateUniqueKey(originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${rand}-${safeName}`;
}

type SendToAnalyzeActionReturn = Promise<{
  success: boolean;
  errors: { someErrorField: [string] };
} | void>;
