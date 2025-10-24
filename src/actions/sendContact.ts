'use server';

import { ContactSchemaBE } from '@/schema/contactSchema';
import { createFormAction } from './utils';
// TODO: enable recaptcha verification
// import { verifyRecaptchaToken } from './verifyRecaptchaToken';

export const sendContactAction = createFormAction(ContactSchemaBE, async (data) => {
  return { success: true, data };

  // if(data.recaptchaToken){
  //   const result = await verifyRecaptchaToken(data.recaptchaToken);

  //   if(!result.success){
  //     return { success: false, errors: { recaptchaToken: ['Invalid reCAPTCHA'] } };
  //   }

  //   return { success: true, data: result };
  // }
});
