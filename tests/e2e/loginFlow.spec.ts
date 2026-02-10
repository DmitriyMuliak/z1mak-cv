import { test, expect } from '@playwright/test';
import { LoginFormDriver } from './drivers/loginForm.driver';

test.describe('Login flow', () => {
  test('Login by email and password', async ({ page }) => {
    await page.goto('/en/auth/login');

    const loginForm = new LoginFormDriver(page);

    await expect(loginForm.forgotPasswordLink).toBeVisible();

    await loginForm.loginAs({
      email: 'test@user.com',
      password: 'securePass123',
    });

    await loginForm.submitButton.assert.shouldBeLoading();
    // await expect.poll(() => new URL(page.url()).pathname).not.toBe('/en/auth/login');
    await expect(page).not.toHaveURL(/.*\/login(\?|$)/);
  });
});
