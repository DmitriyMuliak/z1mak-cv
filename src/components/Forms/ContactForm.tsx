'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/FormField';

import { FormClientProvider } from '@/components/FormClientProvider';
import { SubmitButton } from '@/components/SubmitButton';
import { sendContactAction } from '@/actions/sendContact';
import { ContactSchema } from '@/schema/contactSchema';

export function ContactForm() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Contact us</h1>

      <FormClientProvider
        schema={ContactSchema}
        action={(formData) => sendContactAction(formData)}
        defaultValues={{ name: '', email: '', message: '' }}
      >
        <FormField name="name" placeholder="Your name">
          <Input />
        </FormField>

        <FormField name="email" placeholder="Your email">
          <Input type="email" />
        </FormField>

        <FormField name="message" placeholder="Your message">
          <Textarea />
        </FormField>

        <SubmitButton />
      </FormClientProvider>
    </div>
  );
}
