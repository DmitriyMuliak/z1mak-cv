'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, RefreshCw } from 'lucide-react';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { useFormContext } from 'react-hook-form';

interface SubmitActionButtonPropsBase {
  isSubmitting?: boolean;
  isSubmitSuccessful?: boolean;
  isFormInvalid?: boolean;
  loaderDelay?: number;
  onSuccessTitle?: string;
  title?: string;
}

type ButtonProps = React.ComponentProps<typeof Button>;
type SubmitActionButtonProps = SubmitActionButtonPropsBase & ButtonProps;

export const SubmitActionButton: React.FC<SubmitActionButtonProps> = ({
  isSubmitting: isSubmittingProp,
  isSubmitSuccessful: isSubmitSuccessfulProp,
  isFormInvalid: isFormInvalidProp,
  loaderDelay,
  onSuccessTitle,
  title,
  ...rest
}) => {
  const formContext = useFormContext();
  const isSubmitting = isSubmittingProp ?? formContext?.formState?.isSubmitting ?? false;
  const isSubmitSuccessful =
    isSubmitSuccessfulProp ?? formContext?.formState?.isSubmitSuccessful ?? false;
  const isFormInvalid =
    isFormInvalidProp ??
    (formContext ? Object.keys(formContext.formState?.errors ?? {}).length > 0 : undefined);

  const { delayedIsLoading } = useDelayedSubmitting({
    isSubmitting,
    delayMs: loaderDelay,
  });

  const isSuccess = !isSubmitting && isSubmitSuccessful;
  const showSuccessState = delayedIsLoading && isSuccess;

  return (
    <Button
      disabled={isSubmitting || isFormInvalid}
      type="submit"
      className={`!mt-0 w-full transition-colors duration-300 ${showSuccessState ? 'bg-green-500 hover:bg-green-500' : ''}`}
      {...rest}
    >
      {showSuccessState ? onSuccessTitle : title}
      {showSuccessState ? <CheckIcon className="w-5 h-5 mr-2" /> : null}
      {isSubmitting ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
    </Button>
  );
};
