import type { ApiRequestOptions, ParamsType } from './types';

// For having auto typing in case of setting { responseAs: <value> } - need add types directly in class
export interface IApiService {
  // --- GET Overloads ---
  get(
    endpoint: string,
    params?: ParamsType,
    options?: { responseAs: 'blob' } & ApiRequestOptions,
  ): Promise<Blob>;
  get(
    endpoint: string,
    params?: ParamsType,
    options?: { responseAs: 'text' } & ApiRequestOptions,
  ): Promise<string>;
  get(
    endpoint: string,
    params?: ParamsType,
    options?: { responseAs: 'arrayBuffer' } & ApiRequestOptions,
  ): Promise<ArrayBuffer>;
  get(
    endpoint: string,
    params?: ParamsType,
    options?: { responseAs: 'formData' } & ApiRequestOptions,
  ): Promise<FormData>;
  get(
    endpoint: string,
    params?: ParamsType,
    options?: { responseAs: 'response' } & ApiRequestOptions,
  ): Promise<Response>;
  // (Generic / Default JSON) - MUST BE LAST
  get<R>(endpoint: string, params?: ParamsType, options?: ApiRequestOptions): Promise<R>;

  // --- DELETE Overloads ---
  delete(endpoint: string, options?: { responseAs: 'blob' } & ApiRequestOptions): Promise<Blob>;
  delete(endpoint: string, options?: { responseAs: 'text' } & ApiRequestOptions): Promise<string>;
  delete(
    endpoint: string,
    options?: { responseAs: 'arrayBuffer' } & ApiRequestOptions,
  ): Promise<ArrayBuffer>;
  delete(
    endpoint: string,
    options?: { responseAs: 'formData' } & ApiRequestOptions,
  ): Promise<FormData>;
  delete(
    endpoint: string,
    options?: { responseAs: 'response' } & ApiRequestOptions,
  ): Promise<Response>;
  delete<R = undefined>(endpoint: string, options?: ApiRequestOptions): Promise<R>;

  // --- POST Overloads ---
  post<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'blob' } & ApiRequestOptions,
  ): Promise<Blob>;
  post<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'text' } & ApiRequestOptions,
  ): Promise<string>;
  post<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'arrayBuffer' } & ApiRequestOptions,
  ): Promise<ArrayBuffer>;
  post<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'formData' } & ApiRequestOptions,
  ): Promise<FormData>;
  post<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'response' } & ApiRequestOptions,
  ): Promise<Response>;
  // (Generic / Default JSON)
  post<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R>;

  // --- PUT Overloads ---
  put<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'blob' } & ApiRequestOptions,
  ): Promise<Blob>;
  put<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'text' } & ApiRequestOptions,
  ): Promise<string>;
  put<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'arrayBuffer' } & ApiRequestOptions,
  ): Promise<ArrayBuffer>;
  put<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'formData' } & ApiRequestOptions,
  ): Promise<FormData>;
  put<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'response' } & ApiRequestOptions,
  ): Promise<Response>;
  put<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R>;

  // --- PATCH Overloads ---
  patch<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'blob' } & ApiRequestOptions,
  ): Promise<Blob>;
  patch<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'text' } & ApiRequestOptions,
  ): Promise<string>;
  patch<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'arrayBuffer' } & ApiRequestOptions,
  ): Promise<ArrayBuffer>;
  patch<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'formData' } & ApiRequestOptions,
  ): Promise<FormData>;
  patch<P>(
    endpoint: string,
    body: P,
    options?: { responseAs: 'response' } & ApiRequestOptions,
  ): Promise<Response>;
  patch<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R>;
}
