import type { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';

export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, options);
}
