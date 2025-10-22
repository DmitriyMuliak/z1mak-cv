'use server';

import { ContactSchemaBE } from '@/schema/contactSchema';
import { createFormAction } from './utils';

export const sendContactAction = createFormAction(ContactSchemaBE, async (data) => {
  await new Promise((r) => setTimeout(r, 5000));
  // return { errors: { name: ["Something bad"] } }
  console.log('data on submit server action', data);
});
