import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Example of use __mock__ folder by Vite
// vi.mock('@/api/apiService/readLimitedBody');

// Radix Select uses scrollIntoView; jsdom doesn't implement it by default
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
});
