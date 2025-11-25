'use client';

import React, { forwardRef, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useMergeRefs } from '@/hooks/useMergeRefs';

type TextAreaJsProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaJs: React.FC<TextAreaJsProps> = forwardRef<
  HTMLTextAreaElement,
  TextAreaJsProps
>(({ className, ...props }, externalRef) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const setRefs = useMergeRefs(internalRef, externalRef);
  const autoResize = () => {
    if (!internalRef.current) return;
    internalRef.current.style.height = 'auto'; // reset height
    internalRef.current.style.height = internalRef.current.scrollHeight + 'px'; // set new one
  };

  return (
    <textarea
      ref={setRefs}
      onChange={autoResize}
      className={cn(
        'resize-none overflow-y-hidden min-h-[64px] max-h-[200px] w-[300px] p-[10px]',
        className,
      )}
      {...props}
    ></textarea>
  );
});

TextAreaJs.displayName = 'TextAreaJs';
