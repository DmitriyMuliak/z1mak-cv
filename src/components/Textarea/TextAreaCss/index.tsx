'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TextAreaCssProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaCss = forwardRef<HTMLTextAreaElement, TextAreaCssProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'field-sizing-content resize-none min-h-[64px] max-h-[200px] w-[300px] p-[10px]',
          className,
        )}
        {...props}
      />
    );
  },
);

TextAreaCss.displayName = 'TextAreaCss';
