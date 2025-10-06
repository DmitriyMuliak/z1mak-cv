'use client';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';

export function SubmitButton() {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <Button type="submit" disabled={isSubmitting} className="mt-2">
      {isSubmitting ? 'Sending...' : 'Send'}
    </Button>
  );
}
