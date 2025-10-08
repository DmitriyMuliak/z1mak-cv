'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/FormField';

import { FormClientProvider } from '@/components/FormClientProvider';
import { SubmitButton } from '@/components/SubmitButton';
import { z } from 'zod';

export const Schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.email('Invalid email'),
  message: z.string().min(5, 'Message is too short'),
});

export function BaseForm() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Contact us</h1>

      <FormClientProvider
        schema={Schema}
        action={(_formData) => {
          return Promise.resolve({ success: true });
        }}
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

// ShadCn, React-dropzone, RHF, and Zod in Next.js
// https://github.com/F-47/dynamic-inputs-blog/blob/main/app/page.tsx
// https://medium.com/@faresgalal09/crafting-dynamic-inputs-with-shadcn-ui-react-dropzone-rhf-and-zod-in-next-js-13-9ee13c856287
// Input file x ShadCn x Zod - https://medium.com/@damien_16960/input-file-x-shadcn-x-zod-88f0472c2b81
