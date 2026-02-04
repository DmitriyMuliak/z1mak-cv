'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, RefreshCw } from 'lucide-react';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { useFormContext, useFormState } from 'react-hook-form';

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
  const { control } = useFormContext();

  const {
    isSubmitting: formIsSubmitting,
    isSubmitSuccessful: formIsSubmitSuccessful,
    errors,
  } = useFormState({ control });

  const isSubmitting = isSubmittingProp ?? formIsSubmitting ?? false;
  const isSubmitSuccessful = isSubmitSuccessfulProp ?? formIsSubmitSuccessful ?? false;

  const hasErrors = errors ? Object.keys(errors).length > 0 : false;
  const _isFormInvalid = isFormInvalidProp ?? hasErrors;

  const { delayedIsLoading } = useDelayedSubmitting({
    isSubmitting,
    delayMs: loaderDelay,
  });

  const isSuccess = !isSubmitting && isSubmitSuccessful;
  const showSuccessState = delayedIsLoading && isSuccess;

  return (
    <Button
      disabled={isSubmitting}
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
