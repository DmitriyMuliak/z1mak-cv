import { HTML } from '@interactors/html';

export const HtmlInteractor = HTML.extend<HTMLElement>('test-id')
  .selector('[data-testid]')
  .locator((element) => element.getAttribute('data-testid') || '')

  .filters({
    value: (element) => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        return element.value;
      }
      return element.getAttribute('value') || '';
    },

    placeholder: (element) => element.getAttribute('placeholder'),

    disabled: (element) => (element as HTMLButtonElement | HTMLInputElement).disabled,

    checked: (element) => (element as HTMLInputElement).checked,

    href: (element) => element.getAttribute('href'),
  })

  // --- Missing actions ---
  .actions({
    fill: ({ perform }, value: string) =>
      perform((element) => {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          // React Hack for correct state update
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          )?.set;

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(element, value);
          } else {
            element.value = value;
          }

          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          throw new Error(
            `Cannot fill element with data-testid="${element.getAttribute('data-testid')}"`,
          );
        }
      }),

    // Checkbox
    check: ({ perform }) =>
      perform((element) => {
        if (
          element instanceof HTMLInputElement &&
          (element.type === 'checkbox' || element.type === 'radio')
        ) {
          if (!element.checked) element.click();
        }
      }),

    uncheck: ({ perform }) =>
      perform((element) => {
        if (element instanceof HTMLInputElement && element.type === 'checkbox') {
          if (element.checked) element.click();
        }
      }),

    // Select
    select: ({ perform }, optionText: string) =>
      perform((element) => {
        if (element instanceof HTMLSelectElement) {
          const option = Array.from(element.options).find((opt) => opt.text === optionText);
          if (option) {
            element.value = option.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            throw new Error(`Option "${optionText}" not found in select`);
          }
        }
      }),
  });

// interactors/LoginPage.ts

// import { createInteractor } from '@interactors/html';
// import { HtmlInteractor } from './htmlInteractor';

// export const LoginPage = createInteractor('login-page')
//   .selector('[data-testid="login-page-root"]')

//   .actions({
//     fillForm: async (interactor, email: string, pass: string) => {
//       await interactor.find(HtmlInteractor('email-input')).fill(email);
//       await interactor.find(HtmlInteractor('password-input')).fill(pass);
//     },
//     submit: async (interactor) => {
//       await interactor.find(HtmlInteractor('submit-btn')).click();
//     }
//   });

// Filters
// await TestId('save-btn', { disabled: true }).exists();
// await TestId('email-input').has({ placeholder: 'Enter your email' });

// TESTS EXAMPLES:

// Playwright (E2E)
// e2e/login.spec.ts
// import { test } from '@playwright/test';
// import { LoginPage } from './interactors/LoginPage';

// test('E2E: User can login', async ({ page }) => {
//   // 1. SETUP:
//   await page.goto('/login');

//   // 2. ACTION:
//   await LoginPage().fillForm('user@test.com', '12345');
//   await LoginPage().submit();

//   // 3. ASSERT:
//   await expect(page).toHaveURL('/dashboard');
// });

// React Testing Library (Unit / Integration)
// src/features/auth/Login.test.tsx
// import { render } from '@testing-library/react';
// import { Login } from './Login'; // Твій React компонент
// import { LoginPage } from '../../interactors/LoginPage';

// test('Unit: User can login', async () => {
// // 1. SETUP:
// render(<Login />);

// // 2. ACTION:
// await LoginPage().fillForm('user@test.com', '12345');
// await LoginPage().submit();

// // 3. ASSERT
// await LoginPage().hasSuccessMessage();
// });
