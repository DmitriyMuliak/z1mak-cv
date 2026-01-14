import type { Page, Response } from '@playwright/test';

export class CvCheckerPage {
  constructor(private readonly page: Page) {}

  async goto(path = '/'): Promise<Response | null> {
    return this.page.goto(path);
  }

  body() {
    return this.page.locator('body');
  }
}
