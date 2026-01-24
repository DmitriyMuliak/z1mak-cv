import { publicPrEnv } from './processEnv/public';

export const envType = {
  isDev: publicPrEnv.NODE_ENV === 'development',
  isTest: publicPrEnv.NODE_ENV === 'test',
  isProd: publicPrEnv.NODE_ENV === 'production',
};
