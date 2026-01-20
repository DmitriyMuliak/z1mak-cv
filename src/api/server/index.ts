import { ApiService } from '../apiService';
import { ApiRoutes } from './apiRoutes';

export const apiGoogleCaptcha = new ApiService({
  baseUrl: ApiRoutes.RECAPTCHA_VERIFY.baseUrl,
});

export const apiCvAnalyser = new ApiService({
  baseUrl: ApiRoutes.CV_ANALYSER.baseUrl,
});
