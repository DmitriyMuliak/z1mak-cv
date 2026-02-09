import { Locator, expect } from '@playwright/test';
import { BaseDriver } from '../utils/baseDriver';

export class SubmitActionButton extends BaseDriver {
  constructor(root: Locator, testId?: string) {
    const buttonLocator = root.getByTestId(testId || 'submit-button');
    super(buttonLocator);
  }

  get loadingIcon() {
    return this.root.locator('[data-testid="submit-button-loading-icon"]');
  }

  assert = {
    shouldBeLoading: async () => {
      await expect(this.loadingIcon).toBeVisible();
    },

    shouldNotBeLoading: async () => {
      await expect(this.loadingIcon).not.toBeVisible();
    },
  };
}
