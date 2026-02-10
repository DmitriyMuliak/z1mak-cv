import { vi } from 'vitest';
import { ReactNode, ComponentPropsWithoutRef } from 'react';

// Example of speed up test - you can mock huge parts/components

interface DropzoneProps {
  children: (args: {
    getRootProps: () => ComponentPropsWithoutRef<'div'>;
    getInputProps: () => ComponentPropsWithoutRef<'input'>;
    isDragActive: boolean;
    open: () => void;
  }) => ReactNode;
}

vi.mock('react-dropzone', () => ({
  __esModule: true,
  default: ({ children }: DropzoneProps) =>
    children({
      getRootProps: () => ({ role: 'button' }),
      getInputProps: () => ({}),
      isDragActive: false,
      open: vi.fn(),
    }),
}));
