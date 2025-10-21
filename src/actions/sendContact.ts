'use server';

import { ContactSchemaBE } from '@/schema/contactSchema';
import { createFormAction } from './createFormAction';

const contactAction = createFormAction(ContactSchemaBE, async (data) => {
  // await new Promise((r) => setTimeout(r, 2000));
  // return { errors: { name: ["Something bad"] } }
  console.log('data on submit server action', data);
});

export const sendContactAction = async (formData: FormData) => contactAction(formData);
