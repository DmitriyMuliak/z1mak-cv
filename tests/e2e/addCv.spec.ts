import { test, expect } from '@playwright/test';

test.use({
  storageState: 'auth.json',
});

test.describe('Add CV flow', () => {
  test('Check base ui elements exist', async ({ page }) => {
    await page.goto('http://localhost:3000/uk/about');
    await page.getByTestId('nav-link-cv-checker').click();
    await page.getByTestId('history-button').click();

    const closeButton = page.locator('[data-testid$="-close-button"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(closeButton).not.toBeVisible();

    // Switch to text mode for CV
    const cvToggleText = page.getByTestId('toggle-text').first();
    await expect(cvToggleText).toBeVisible();
    await cvToggleText.click();

    // Change evaluation mode to comparative (byJob)
    await page.getByTestId('mode-select-evaluation').click();
    await page.getByTestId('mode-option-evaluation-byJob').click();

    // Wait for the Job section to become visible
    const jobToggleText = page.getByTestId('toggle-text').nth(1);
    await expect(jobToggleText).toBeVisible();
    await jobToggleText.click();

    // Fill CV text
    const cvTextArea = page.getByTestId('textarea-cvText');
    await expect(cvTextArea).toBeVisible();
    await cvTextArea.fill('asd');

    // Fill Job description text
    const jobTextArea = page.getByTestId('textarea-jobText');
    await expect(jobTextArea).toBeVisible();
    await jobTextArea.fill('asd');

    // error sonner popup with message "same description"
    await expect(page.getByTestId('error-toast')).not.toBeVisible();
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('error-toast')).toBeVisible();
  });
});
