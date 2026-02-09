import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { Header } from '@/components/Header';
import { HeaderDriver } from '../../drivers/header.driver';

describe('Header Component Driver', () => {
  it('should interact with menu buttons', async () => {
    render(<Header />);

    await HeaderDriver().openMenu();
    await HeaderDriver().closeMenu();
  });

  it('navigation links should exists', async () => {
    render(<Header />);

    await HeaderDriver().find(HeaderDriver.Link('aboutTitle')).exists();
    await HeaderDriver().find(HeaderDriver.Link('skillsTitle')).exists();
    await HeaderDriver().find(HeaderDriver.Link('contactTitle')).exists();
    await HeaderDriver().find(HeaderDriver.Link('cvCheckerTitle')).exists();
  });
});
