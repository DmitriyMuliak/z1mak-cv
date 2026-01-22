import { devLogger } from '@/lib/devLogger';

type ResponseParseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'response';

export interface ApiRequestOptions extends RequestInit {
  responseAs?: ResponseParseType;
  params?: Record<string, unknown>;
}

interface ApiServiceOptions {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private mockHandlers: Map<string | RegExp, MockHandler> = new Map();

  public interceptors = {
    request: new InterceptorManager<ApiRequestOptions>(),
    response: new InterceptorManager<Response>(),
  };

  constructor(options: ApiServiceOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  public addMockHandler<P>(pattern: string | RegExp, handler: MockHandler<P>): void {
    this.mockHandlers.set(pattern, handler as MockHandler);
  }

  // --- Main Request Method ---

  private async request<R>(
    endpoint: string,
    options: ApiRequestOptions = {},
    body?: unknown,
  ): Promise<R> {
    const rawUrl = `${this.baseUrl}${endpoint}`;

    // 1. Prepare Initial Config
    let config: ApiRequestOptions = {
      ...options,
      headers: this.prepareHeaders(options.headers, body),
    };

    if (body !== undefined) {
      config.body = this.prepareBody(body);
    }

    // 2. Run Request Interceptors
    const requestHandlers = this.interceptors.request.getActiveHandlers();

    try {
      for (const handler of requestHandlers) {
        config = await handler.fulfilled(config);
      }
    } catch (error) {
      const rejectedHandler = requestHandlers.find((h) => h.rejected)?.rejected;
      if (rejectedHandler) {
        config = await rejectedHandler(error);
      } else {
        throw error;
      }
    }

    // 3. Prepare Final URL
    const { params, responseAs, ...fetchInit } = config;
    const finalUrl = this.appendParams(rawUrl, params);

    // 4. Check Mocks
    const mockResponse = await this.tryMockRequest(rawUrl, config);
    if (mockResponse) {
      return this.handleResponseChain<R>(mockResponse, config, finalUrl);
    }

    // 5. Execution (Fetch)
    let response: Response;
    try {
      response = await fetch(finalUrl, fetchInit);
    } catch (error) {
      return this.handleResponseChain<R>(Promise.reject(error), config, finalUrl);
    }

    // 6. Handle Response Chain
    return this.handleResponseChain<R>(response, config, finalUrl);
  }

  // --- Response Pipeline Logic ---

  private async handleResponseChain<R>(
    initialResponseOrError: Response | Promise<Response>,
    config: ApiRequestOptions,
    requestUrl: string,
  ): Promise<R> {
    let promiseChain = Promise.resolve(initialResponseOrError);

    // 1. Status Check
    promiseChain = promiseChain.then(async (response) => {
      if (!response.ok) {
        const errorData = await this.safeParseError(response);

        throw new ApiError(response.statusText || 'API Error', {
          status: response.status,
          body: errorData,
          response: response,
          config: config,
          url: requestUrl,
        });
      }
      return response;
    });

    // 2. Run Response Interceptors
    const responseHandlers = this.interceptors.response.getActiveHandlers();
    for (const handler of responseHandlers) {
      // 3. UPDATED: No more "as Promise<Response>".
      // TypeScript knows that fulfilled/rejected return Response based on generics.
      promiseChain = promiseChain.then(handler.fulfilled, handler.rejected);
    }

    // 3. Final Parsing
    return promiseChain
      .then((response) =>
        this.parseResponseData<R>(response, config.responseAs, requestUrl, config),
      )
      .catch((error) => {
        if (error instanceof ApiError) {
          devLogger.error(`[ApiService] ${error.status} ${error.message}`, error.body);
        } else {
          devLogger.error('[ApiService] Unexpected error', error);
        }
        throw error;
      });
  }

  // --- Helper Methods ---

  private prepareHeaders(
    customHeaders: HeadersInit | undefined,
    body: unknown,
  ): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...(customHeaders as Record<string, string>) };

    if (body instanceof FormData) {
      delete headers['Content-Type'];
    }

    if (body instanceof URLSearchParams) {
      delete headers['Content-Type'];
    }

    return headers;
  }

  private prepareBody(body: unknown): BodyInit | null {
    if (body === undefined || body === null) return null;

    if (
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      typeof body === 'string'
    ) {
      return body as BodyInit;
    }
    return JSON.stringify(body);
  }

  private appendParams(url: string, params?: Record<string, unknown>): string {
    if (!params) return url;
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
  }

  private async tryMockRequest(url: string, options: ApiRequestOptions): Promise<Response | null> {
    for (const [pattern, handler] of this.mockHandlers) {
      const isMatch = typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url);

      if (isMatch) {
        devLogger.info(`[Mock] Handling request: ${url}`);
        const { data, status = 200 } = await handler(url, options.params, options);

        return new Response(JSON.stringify(data), {
          status,
          statusText: status === 200 ? 'OK' : 'Mock Error',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return null;
  }

  private async parseResponseData<R>(
    response: Response,
    parseType: ResponseParseType = 'json',
    requestUrl: string,
    config: ApiRequestOptions,
  ): Promise<R> {
    if (parseType === 'response') return response as unknown as R;
    if (response.status === 204) return undefined as R;

    try {
      switch (parseType) {
        case 'json':
          return await response.json();
        case 'text':
          return (await response.text()) as R;
        case 'blob':
          return (await response.blob()) as R;
        case 'arrayBuffer':
          return (await response.arrayBuffer()) as R;
        case 'formData':
          return (await response.formData()) as R;
        default:
          return await response.json();
      }
    } catch (error) {
      throw new ApiError('Parsing Error', {
        status: response.status,
        cause: error,
        response,
        config,
        url: requestUrl,
      });
    }
  }

  private async safeParseError(response: Response): Promise<unknown> {
    try {
      return await response.clone().json();
    } catch {
      return response.text();
    }
  }

  // --- Public HTTP Methods ---

  public get<R, P extends Record<string, unknown> = Record<string, unknown>>(
    endpoint: string,
    params?: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'GET', params });
  }

  public post<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'POST' }, body);
  }

  public put<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'PUT' }, body);
  }

  public patch<R, P = unknown>(endpoint: string, body: P, options?: ApiRequestOptions): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'PATCH' }, body);
  }

  public delete<R = undefined>(endpoint: string, options?: ApiRequestOptions): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'DELETE' });
  }
}

type InterceptorHandler<V> = (value: V) => V | Promise<V>;
type InterceptorErrorHandler<V> = (error: unknown) => V | Promise<V>;

interface Interceptor<V> {
  fulfilled: InterceptorHandler<V>;
  rejected?: InterceptorErrorHandler<V>;
}

class InterceptorManager<V> {
  private handlers: (Interceptor<V> | null)[] = [];

  public use(fulfilled: InterceptorHandler<V>, rejected?: InterceptorErrorHandler<V>): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  public eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  public getActiveHandlers(): Interceptor<V>[] {
    return this.handlers.filter((h): h is Interceptor<V> => h !== null);
  }
}

export class ApiError<T = unknown> extends Error {
  public status: number;
  public body?: T;
  public response: Response;
  public config: ApiRequestOptions;
  public url: string;

  constructor(
    message: string,
    options: {
      status: number;
      body?: T;
      cause?: unknown;
      response: Response;
      config: ApiRequestOptions;
      url: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.body = options.body;
    this.response = options.response;
    this.config = options.config;
    this.url = options.url;

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

type MockHandler<P = unknown> = (
  url: string,
  params?: P,
  options?: ApiRequestOptions,
) => Promise<{ data?: unknown; status?: number }>;
