import { Link } from '@interactors/html';
import { BaseInteractor } from '../utils/BaseInteractor';

const MenuButton = BaseInteractor.extend<HTMLButtonElement>('icon button')
  .selector('button')
  .locator((el) => el.getAttribute('aria-label') || '');

export const HeaderInteractor = BaseInteractor.extend('header')
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
