import { Link } from '@interactors/html';
import { BaseDriver } from './BaseDriver';

const MenuButton = BaseDriver.extend<HTMLButtonElement>('icon button')
  .selector('button')
  .locator((el) => el.getAttribute('aria-label') || '');

export const HeaderInteractor = BaseDriver.extend('header')
  .selector('header')
  .actions({
    openMenu: async (interactor, label: string = 'openMenu') => {
      await interactor.find(MenuButton(label)).click();
    },
    closeMenu: async (interactor, label: string = 'closeMenu') => {
      await interactor.find(MenuButton(label)).click();
    },
    clickNavLink: async (interactor, label: string) => {
      await interactor.find(Link(label)).click();
    },
  });

export const HeaderDriver = Object.assign(HeaderInteractor, {
  MenuButton,
  Link,
});
