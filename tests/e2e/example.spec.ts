import { test, expect } from '@playwright/test';
import { CvCheckerPage } from './utils/cvCheckerPage';

test('home page loads', async ({ page }) => {
  const app = new CvCheckerPage(page);
  const response = await app.goto();

  expect(response?.ok()).toBeTruthy();
  await expect(app.body()).toBeVisible();
});
