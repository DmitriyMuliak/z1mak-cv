import { TextField, Button, Link } from '@interactors/html';
import { BaseInteractor } from '../utils/BaseInteractor';
import { createDriver } from '../utils/BaseDriver';
import { SubmitActionButton } from './submitActionButton';

const LoginFormInteractor = BaseInteractor.extend('login form')
  .selector('form[data-testid="login-form"]')
  .actions({
    fillEmail: async (interactor, value: string) => {
      await interactor.find(TextField('email.label')).fillIn(value);
    },
    fillPassword: async (interactor, value: string) => {
      await interactor.find(TextField('password.label')).fillIn(value);
    },
  });

export const LoginFormDriver = createDriver(LoginFormInteractor, {
  options: { visible: true },

  setCustomProperties: (root) => {
    const submitButton = root.find(SubmitActionButton('loginTitle'));

    return {
      submitButton,
      googleButton: root.find(Button('googleBtnTitle')),
      forgotPasswordLink: root.find(Link('forgotPasswordTitle')),
      signUpLink: root.find(Link('signUpTitle')),
      termsLink: root.find(Link('termsOfServiceTitle')),
      privacyPolicyLink: root.find(Link('privacyPolicyTitle')),

      loginAs: async (email: string, pass: string) => {
        await root.fillEmail(email);
        await root.fillPassword(pass);
        await submitButton.click();
      },
    };
  },
});
