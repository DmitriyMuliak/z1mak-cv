type RequestInterceptor<P> = (
  url: string,
  params?: P,
  options?: RequestInit,
) => Promise<{ handled: boolean; data?: unknown }>;
type RequestBody = object | string | FormData | undefined; // string | FormData | ReadableStream<any> | Blob | ArrayBuffer | ArrayBufferView<ArrayBuffer> | URLSearchParams | null;

interface ApiServiceOptions {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class ApiService {
  private baseUrl: string;
  private headers: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private interceptors: Map<string | RegExp, RequestInterceptor<any>> = new Map();

  constructor(options: ApiServiceOptions) {
    this.baseUrl = options.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  public addInterceptor<P>(urlPattern: string | RegExp, interceptor: RequestInterceptor<P>): void {
    this.interceptors.set(urlPattern, interceptor);
  }

  private getCorrectHeaders(body: RequestBody, options?: RequestInit) {
    const finalHeaders = { ...this.headers, ...options?.headers } as Record<string, string>; // can be Headers || string[][]

    // Prevent setting default 'Content-Type': 'application/json'

    // Browser and NodeJs will auto set correct header for FormData with boundary
    if (body instanceof FormData) {
      if (finalHeaders['Content-Type']) {
        delete finalHeaders['Content-Type'];
      }
    }

    // Browser and NodeJs will auto set correct header for URLSearchParams
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
    options: RequestInit,
    body?: P,
  ): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;

    if (this.getIsHaveInterceptors()) {
      const interceptorResult = await this._applyInterceptors(url, options, body);
      if (interceptorResult.handled) {
        return interceptorResult.data as R;
      }
    }

    try {
      const parsedBody = body ? this.getParsedBody(body) : undefined;
      const headers = this.getCorrectHeaders(body as RequestBody, options);
      const response = await fetch(url, {
        ...options,
        headers,
        ...(parsedBody && { body: parsedBody }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (response.status === 204) {
        // No Content
        return undefined as R;
      }

      return (await response.json()) as R;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  public get<R, P extends Record<string, unknown> = never>(
    endpoint: string,
    params?: P,
    options?: RequestInit,
  ): Promise<R> {
    const urlWithParams = params
      ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}`
      : endpoint;

    const fetchOptions: RequestInit = {
      ...options,
      method: 'GET',
    };

    return this.request<R, P>(urlWithParams, fetchOptions);
  }

  public post<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: RequestInit,
  ): Promise<R> {
    const fetchOptions: RequestInit = {
      ...options,
      method: 'POST',
    };

    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public put<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: RequestInit,
  ): Promise<R> {
    const fetchOptions: RequestInit = {
      ...options,
      method: 'PUT',
    };
    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public patch<R, P extends RequestBody>(
    endpoint: string,
    body: P,
    options?: RequestInit,
  ): Promise<R> {
    const fetchOptions: RequestInit = {
      ...options,
      method: 'PATCH',
    };
    return this.request<R, P>(endpoint, fetchOptions, body);
  }

  public delete<R = undefined>(endpoint: string, options?: RequestInit): Promise<R> {
    const fetchOptions: RequestInit = {
      ...options,
      method: 'DELETE',
    };
    return this.request<R, undefined>(endpoint, fetchOptions);
  }

  private getIsHaveInterceptors(): boolean {
    return this.interceptors.size > 0;
  }

  private async _applyInterceptors<P>(url: string, options: RequestInit, params?: P) {
    if (!this.getIsHaveInterceptors()) {
      return { handled: false };
    }

    for (const [pattern, interceptor] of this.interceptors.entries()) {
      const match =
        (typeof pattern === 'string' && url.includes(pattern)) ||
        (pattern instanceof RegExp && pattern.test(url));

      if (match) {
        const result = await interceptor(url, params, options);
        if (result.handled) {
          return result;
        }
      }
    }
    return { handled: false };
  }
}
