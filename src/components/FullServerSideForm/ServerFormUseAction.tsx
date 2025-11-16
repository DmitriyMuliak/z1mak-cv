'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormState, sendContactServerAction } from './serverActionUseAction';
import { useActionState, useEffect, useRef } from 'react';

const initialState: FormState = {
  message: null,
  errors: null,
  success: false,
};

export function ServerFormUseAction() {
  const [state, formAction, isPending] = useActionState(sendContactServerAction, initialState);

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Contact us</h1>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div>
          <Input required name="name" placeholder="Your name" />
          {state.errors?.name && (
            <p className="text-sm text-red-500 mt-1">{state.errors.name.join(', ')}</p>
          )}
        </div>
        <div>
          {/* skip required for show validation process */}
          <Input type="email" name="email" placeholder="Your email" />
          {state.errors?.email && (
            <p className="text-sm text-red-500 mt-1">{state.errors.email.join(', ')}</p>
          )}
        </div>
        <div>
          <Textarea required name="message" placeholder="Your message" />
          {state.errors?.message && (
            <p className="text-sm text-red-500 mt-1">{state.errors.message.join(', ')}</p>
          )}
        </div>

        {state.message && (
          <p className={`text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
            {state.message}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
