// utils/BaseDriver.ts
import { Locator, Page, expect } from '@playwright/test';

export class BaseDriver {
  readonly root: Locator;
  readonly page: Page;

  constructor(root: Locator) {
    this.root = root;
    this.page = root.page();
  }

  async shouldBeVisible() {
    await expect(this.root).toBeVisible();
  }
}
