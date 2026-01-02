import { ApiService } from '../apiService';

export const apiService = new ApiService({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
});
