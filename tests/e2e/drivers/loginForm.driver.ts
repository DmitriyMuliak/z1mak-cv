import { Page } from '@playwright/test';
import { BaseDriver } from '../utils/baseDriver';
import { SubmitActionButton } from './submitActionButton.driver';

export class LoginFormDriver extends BaseDriver {
  constructor(page: Page) {
    const formRoot = page.getByTestId('login-form');
    super(formRoot);
  }

  get emailInput() {
    return this.root.locator('input[name="email"]');
  }

  get passwordInput() {
    return this.root.locator('input[name="password"]');
  }

  get submitButton() {
    return new SubmitActionButton(this.root);
  }

  get googleButton() {
    return this.root.getByTestId('google-auth-button');
  }

  get forgotPasswordLink() {
    return this.root.getByTestId('forgot-password-link');
  }

  get signUpLink() {
    return this.root.getByTestId('sign-up-link');
  }

  get termsLink() {
    return this.root.getByTestId('terms-link');
  }

  get privacyPolicyLink() {
    return this.root.getByTestId('privacy-link');
  }

  async fillEmail(value: string) {
    await this.emailInput.fill(value);
  }

  async fillPassword(value: string) {
    await this.passwordInput.fill(value);
  }

  async loginAs({ email, password }: { email: string; password: string }) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitButton.root.click();
  }
}
