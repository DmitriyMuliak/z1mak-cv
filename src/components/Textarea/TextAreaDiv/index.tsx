'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TextAreaDivProps = React.HTMLAttributes<HTMLDivElement>;

export const TextAreaDiv = forwardRef<HTMLDivElement, TextAreaDivProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        contentEditable="true"
        className={cn('min-h-[64px] max-h-[200px] w-[300px] p-[10px]', className)}
        {...props}
      />
    );
  },
);

TextAreaDiv.displayName = 'TextAreaDiv';
