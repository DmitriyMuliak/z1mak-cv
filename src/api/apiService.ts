import { devLogger } from '@/lib/devLogger';

type RequestInterceptor<P> = (
  url: string,
  params?: P,
  options?: ApiRequestOptions,
) => Promise<{ data?: unknown }>;

type RequestBody = object | string | FormData | undefined;

interface ApiServiceOptions {
  baseUrl: string;
  headers?: Record<string, string>;
}

type ResponseParseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'response';

export interface ApiRequestOptions extends RequestInit {
  responseAs?: ResponseParseType;
}

export class ApiService {
  private baseUrl: string;
  private headers: Record<string, string>;
  private interceptors: Map<string | RegExp, RequestInterceptor<unknown>> = new Map();

  constructor(options: ApiServiceOptions) {
    this.baseUrl = options.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  public addInterceptor<P>(urlPattern: string | RegExp, interceptor: RequestInterceptor<P>): void {
    this.interceptors.set(urlPattern, interceptor as RequestInterceptor<unknown>);
  }

  private getCorrectHeaders(body: RequestBody, options?: ApiRequestOptions) {
    const finalHeaders = { ...this.headers, ...options?.headers } as Record<string, string>;

    if (body instanceof FormData) {
      if (finalHeaders['Content-Type']) {
        delete finalHeaders['Content-Type'];
      }
    }

    if (body instanceof URLSearchParams) {
      if (finalHeaders['Content-Type']) {
        delete finalHeaders['Content-Type'];
      }
    }

    return finalHeaders;
  }

  private getParsedBody(body: RequestBody) {
    return body instanceof FormData || typeof body === 'string' || body instanceof URLSearchParams
      ? body
      : JSON.stringify(body);
  }

  private async request<R, P = unknown>(
    endpoint: string,
    options: ApiRequestOptions,
    body?: P,
  ): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;

    const { responseAs = 'json', ...fetchOptions } = options;

    if (this.getIsHaveInterceptors()) {
      const interceptorResult = await this._applyInterceptors(url, options, body);
      if (interceptorResult.handled) {
        return interceptorResult.data as R;
      }
    }

    try {
      const parsedBody = body ? this.getParsedBody(body) : undefined;

      const headers = this.getCorrectHeaders(body as RequestBody, fetchOptions);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        ...(parsedBody && { body: parsedBody }),
      });

      if (!response.ok) {
        let errorData: Partial<Record<string, string>> = {};

        try {
          errorData = await response.json();
        } catch (_parseError) {
          errorData.message = response.statusText;
        }

        const errorMessage = errorData?.message || `${response.status}`;

        devLogger.error('API Error Data:', errorData);
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        devLogger.info('API request done with: response.status === 204, return undefined');
        // No Content
        return undefined as R;
      }

      switch (responseAs) {
        case 'json':
          return (await response.json()) as R;
        case 'text':
          return (await response.text()) as R;
        case 'blob':
          return (await response.blob()) as R;
        case 'arrayBuffer':
          return (await response.arrayBuffer()) as R;
        case 'formData':
          return (await response.formData()) as R;
        case 'response':
          return response as R;
        default:
          return (await response.json()) as R;
      }
    } catch (error) {
      devLogger.error('API request failed:', error);
      throw error;
    }
  }

  public get<R, P extends Record<string, unknown> = never>(
    endpoint: string,
    params?: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    const urlWithParams = params
      ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}`
      : endpoint;

    const fetchOptions: ApiRequestOptions = {
      ...options,
      method: 'GET',
    };

    return this.request<R, P>(urlWithParams, fetchOptions);
  }

  public post<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    const fetchOptions: ApiRequestOptions = {
      ...options,
      method: 'POST',
    };

    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public put<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    const fetchOptions: ApiRequestOptions = {
      ...options,
      method: 'PUT',
    };
    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public patch<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    const fetchOptions: ApiRequestOptions = {
      ...options,
      method: 'PATCH',
    };
    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public delete<R = undefined>(endpoint: string, options?: ApiRequestOptions): Promise<R> {
    const fetchOptions: ApiRequestOptions = {
      ...options,
      method: 'DELETE',
    };
    return this.request<R, undefined>(endpoint, fetchOptions);
  }

  private getIsHaveInterceptors(): boolean {
    return this.interceptors.size > 0;
  }

  private async _applyInterceptors<P>(url: string, options: ApiRequestOptions, params?: P) {
    if (!this.getIsHaveInterceptors()) {
      return { handled: false };
    }

    for (const [pattern, interceptor] of this.interceptors.entries()) {
      const match =
        (typeof pattern === 'string' && url.includes(pattern)) ||
        (pattern instanceof RegExp && pattern.test(url));

      if (match) {
        const result = await interceptor(url, params, options);
        return { handled: true, data: result.data };
      }
    }
    return { handled: false };
  }
}
