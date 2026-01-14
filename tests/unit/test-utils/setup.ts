import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Radix Select uses scrollIntoView; jsdom doesn't implement it by default
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
});
