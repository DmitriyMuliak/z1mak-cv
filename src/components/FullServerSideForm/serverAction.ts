'use server';

import * as v from 'valibot';
import { ContactSchemaFE } from '@/schema/contactSchema';

export async function sendContactServerAction(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const result = v.safeParse(ContactSchemaFE, raw);

  if (!result.success) {
    throw new Error(JSON.stringify(result.issues));
  }
}
