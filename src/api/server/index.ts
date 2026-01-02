import { ApiService } from '../apiService';
import { ApiRoutes } from './apiRoutes';

export const apiService = new ApiService({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
});

export const apiGoogleCaptcha = new ApiService({
  baseUrl: ApiRoutes.RECAPTCHA_VERIFY.baseUrl,
});

export const apiCvAnalyser = new ApiService({
  baseUrl: ApiRoutes.CV_ANALYSER.baseUrl,
});
