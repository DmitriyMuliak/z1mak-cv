import { createInteractor, TextField, Button } from '@interactors/html';

export const LoginPage = createInteractor('login-page')
  .selector('form[aria-label="Login Form"]')

  .actions({
    fillAndSubmit: async (interactor, email: string, pass: string) => {
      await interactor.find(TextField('Email Address')).fillIn(email);
      await interactor.find(TextField('Password')).fillIn(pass);
      await interactor.find(Button('Sign In')).click();
    },
  });

// Setup: Playwright (E2E)
// import { test, expect } from '@playwright/test';
// import { LoginPage, Heading } from '../../interactors/LoginPage';

// test('E2E: Semantic Login', async ({ page }) => {
//   // 1. SETUP
//   await page.goto('/login');

//   // 2. ACTION (Читається як інструкція для людини)
//   await LoginPage().fillAndSubmit('user@example.com', 'secret123');

//   // 3. ASSERTION
//   // Перевіряємо, що ми перейшли на нову сторінку
//   // (Наприклад, з'явився заголовок Dashboard)
//   await Heading('Dashboard').exists();
// });

// Setup: React Testing Library (Unit)
// import { render } from '@testing-library/react';
// import { LoginPage } from '../../interactors/LoginPage';
// import { LoginForm } from './LoginForm';

// test('Unit: Semantic Login interaction', async () => {
//   // 1. SETUP
//   render(<LoginForm />);

//   // 2. ACTION (Той самий код!)
//   // Interactors.js знайде input за label, навіть якщо id зміняться
//   await LoginPage().fillAndSubmit('user@example.com', 'secret123');

//   // 3. ASSERTION
//   // Перевірка, наприклад, чи викликався мок-функція сабміту,
//   // або чи кнопка стала disabled (залежить від логіки)
//   await LoginPage().find(Button('Sign In')).has({ disabled: false }); // приклад
// });
