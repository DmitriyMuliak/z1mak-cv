'use server';

import * as v from 'valibot';
import { flatten } from 'valibot';
import { ContactSchemaBE } from '@/schema/contactSchema/contactSchemaBE';

export type FormState = {
  message: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  } | null;
  success: boolean;
};

export async function sendContactServerAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const result = v.safeParse(ContactSchemaBE, raw);

  if (!result.success) {
    const issues = flatten(result.issues).nested;

    return {
      message: 'Validation failed. Please check your entries.',
      errors: issues,
      success: false,
    };
  }

  try {
    // ---
    // await sendEmail(result.output);
    // ---
    console.log('Valid data:', result.output);
    return {
      message: 'Thank you! Your message has been sent.',
      errors: null,
      success: true,
    };
  } catch (_e: unknown) {
    return {
      message: 'An error occurred while sending the message. Please try again.',
      errors: null,
      success: false,
    };
  }
}
