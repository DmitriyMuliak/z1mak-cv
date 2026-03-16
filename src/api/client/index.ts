import { publicPrEnv } from '@/utils/processEnv/public';
import { ApiService } from '../apiService';

export const apiService = new ApiService({
  baseUrl: publicPrEnv.NEXT_PUBLIC_API_URL,
});
