import { Button } from '@interactors/html';

export const SubmitActionButton = Button.extend('loading button').filters({
  isLoading: (el) => !!el.querySelector('[data-testid="submit-button-success-icon"]'),
});
