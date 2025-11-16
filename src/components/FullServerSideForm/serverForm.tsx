'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactServerAction } from './serverAction';
import { useFormStatus } from 'react-dom'; // use client for this

export function ServerForm() {
  const formStatus = useFormStatus();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Contact us</h1>

      <form action={sendContactServerAction} className="flex flex-col gap-4">
        <Input required name="name" placeholder="Your name" />
        <Input required type="email" name="email" placeholder="Your email" />
        <Textarea required name="message" placeholder="Your message" />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={formStatus.pending}
        >
          {formStatus.pending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
