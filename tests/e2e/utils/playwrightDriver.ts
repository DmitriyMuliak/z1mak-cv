import { type Locator, type Page, expect } from '@playwright/test';

// TODO: create utils for testing (examples below)

export abstract class BaseComponent {
  constructor(
    protected page: Page,
    protected root: Locator,
  ) {}

  protected locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  async shouldBeVisible() {
    await expect(this.root).toBeVisible();
  }

  async getText() {
    return await this.root.textContent();
  }
}

export class Header extends BaseComponent {
  private userMenu = this.locator('[data-testid="user-menu"]');
  private logoutBtn = this.locator('button:has-text("Logout")');

  async openUserMenu() {
    await this.userMenu.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutBtn.click();
  }
}

export class LoginForm extends BaseComponent {
  private emailInput = this.locator('input[name="email"]');
  private passwordInput = this.locator('input[name="password"]');
  private submitBtn = this.locator('button[type="submit"]');

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitBtn.click();
  }
}

export class LoginPage {
  readonly header: Header;
  readonly loginForm: LoginForm;

  constructor(private page: Page) {
    this.header = new Header(page, page.locator('header.main-header'));
    this.loginForm = new LoginForm(page, page.locator('.login-container'));
  }

  async goto(path: string = '/login') {
    await this.page.goto(path);
  }
}

// tests/auth.spec.ts
// import { test, expect } from '@playwright/test';
// import { LoginPage } from '../pom/pages/LoginPage';

// test('User can login via widget', async ({ page }) => {
//   const loginPage = new LoginPage(page);

//   await loginPage.goto();

//   await loginPage.loginForm.login('dmytro@test.com', 'secret');

//   await expect(loginPage.header.userMenu).toBeVisible();
// });
