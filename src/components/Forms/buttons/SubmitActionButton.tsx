'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, RefreshCw } from 'lucide-react';

interface SubmitActionButtonPropsBase {
  isSubmitting?: boolean;
  isFormInvalid?: boolean;
  showSuccessLoader?: boolean;
  onSuccessTitle?: string;
  title?: string;
}

type ButtonProps = React.ComponentProps<typeof Button>;
type SubmitActionButtonProps = SubmitActionButtonPropsBase & ButtonProps;

export const SubmitActionButton: React.FC<SubmitActionButtonProps> = ({
  isSubmitting,
  isFormInvalid,
  showSuccessLoader,
  onSuccessTitle,
  title,
  ...rest
}) => {
  return (
    <Button
      disabled={isSubmitting || isFormInvalid}
      type="submit"
      className={`!mt-0 w-full transition-colors duration-300 ${showSuccessLoader ? 'bg-green-500 hover:bg-green-500' : ''}`}
      {...rest}
    >
      {showSuccessLoader ? onSuccessTitle : title}
      {showSuccessLoader ? <CheckIcon className="w-5 h-5 mr-2" /> : null}
      {isSubmitting ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
    </Button>
  );
};
