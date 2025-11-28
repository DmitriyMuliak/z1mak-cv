import { envType } from '@/utils/envType';
import { create, StateCreator } from 'zustand';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 *
 * ⚠ Warning: middleware order matters:
 * If you want to see "clean" patches in DevTools — use immer → devtools
 * If you want to see the raw state (with Immer drafts) — use devtools → immer
 * We chose immer → devtools here, which is usually optimal.
 */
export const createAppStore = <T>(
  creator: StateCreator<T, [['zustand/immer', never], ['zustand/devtools', never]], []>,
) => create<T>()(immer(devtools(creator, devtoolsOptions)));

const devtoolsOptions: DevtoolsOptions = {
  enabled: envType.isDev,
  name: 'RootStore',
};
