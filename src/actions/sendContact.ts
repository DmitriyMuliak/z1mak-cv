'use server';

import { ContactSchemaBE } from '@/schema/contactSchema';
import { createFormAction } from './utils';
// TODO: enable recaptcha verification
// import { verifyRecaptchaToken } from './verifyRecaptchaToken';
import { getLocale, getTranslations } from 'next-intl/server';

export const sendContactAction = createFormAction(ContactSchemaBE, async (data) => {
  const locale = await getLocale();
  const _t = await getTranslations({ namespace: 'validator', locale });

  return { success: true, data };

  // if(data.recaptchaToken){
  //   const result = await verifyRecaptchaToken(data.recaptchaToken);

  //   if(!result.success){
  //     return { success: false, errors: { recaptchaToken: [t('captchaInvalid')] } };
  //   }

  //   return { success: true, data: result };
  // }
});
