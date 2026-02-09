import { HTML } from '@interactors/html';

export const BaseInteractor = HTML.extend('component').filters({
  hasElement: (element: Element, selector: string): boolean => {
    return element.querySelector(selector) !== null;
  },

  hasVisibleElement: (baseElement: Element, selector?: string): boolean => {
    const element = selector ? (baseElement.querySelector(selector) as HTMLElement) : baseElement;
    if (selector && !element) return false;

    // E2E
    if ('checkVisibility' in element) {
      return element.checkVisibility();
    }

    // Fallback JSDOM (inline styles)
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  },
});
