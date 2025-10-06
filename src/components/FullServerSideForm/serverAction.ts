'use server';
import { ContactSchema } from '@/schema/contactSchema';

export async function sendContactServerAction(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const result = ContactSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(JSON.stringify(result.error.flatten().fieldErrors));
  }
}
