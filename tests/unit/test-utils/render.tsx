import type { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';

export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, options);
}

export const resizeWindow = (width: number) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};
