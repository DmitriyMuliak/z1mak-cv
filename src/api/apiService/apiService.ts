import { devLogger } from '@/lib/devLogger';
import { InterceptorManager } from './interceptorManager';
import { ApiError } from './apiError';
import type {
  ApiRequestOptions,
  MockHandler,
  ParamsType,
  ResponseParseType,
  RelativePath,
} from './types';
import type { IApiService } from './apiServiceType';
import { envType } from '@/utils/envType';

interface ApiServiceOptions {
  baseUrl: string;
  headers?: HeadersInit;
}

export class ApiService implements IApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private mockHandlers: Map<string | RegExp, MockHandler> = new Map();

  public interceptors = {
    request: new InterceptorManager<ApiRequestOptions>(),
    response: new InterceptorManager<Response>(),
  };

  constructor(options: ApiServiceOptions) {
    validateBaseUrl(options.baseUrl);
    // Remove trailing slash safely
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = options.headers || {};
  }

  public addMockHandler<P>(pattern: string | RegExp, handler: MockHandler<P>): void {
    this.mockHandlers.set(pattern, handler as MockHandler);
  }

  // --- Main Request Method ---

  private async request<R>(
    endpoint: RelativePath,
    options: ApiRequestOptions = {},
    body?: unknown,
  ): Promise<R> {
    // 1. Prepare Initial Config
    let config = this.prepareRequestConfig(options, body);

    // 2. Run Request Interceptors
    const requestHandlers = this.interceptors.request.getActiveHandlers();
    let configPromise = Promise.resolve(config);

    for (const handler of requestHandlers) {
      configPromise = configPromise.then(
        (conf) => handler.fulfilled(conf),
        handler.rejected ? (error) => handler.rejected!(error) : undefined,
      );
    }
    config = await configPromise;

    // 3. Prepare Final URL
    const { params, responseAs, ...fetchInit } = config;
    const finalUrl = this.buildUrl(this.baseUrl, endpoint, params);

    // 4. Check Mocks
    const mockResponse = await this.tryMockRequest(finalUrl, config);
    if (mockResponse) {
      return this.handleResponseChain<R>(mockResponse, config, finalUrl);
    }

    // 5. Execution
    let response: Response;
    try {
      response = await fetch(finalUrl, fetchInit);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown Request Error';
      const apiError = new ApiError(errorMessage, {
        cause: error,
        config,
        url: finalUrl,
        status: 0,
      });

      return this.handleResponseChain<R>(Promise.reject(apiError), config, finalUrl);
    }

    // 6. Handle Response Chain
    return this.handleResponseChain<R>(response, config, finalUrl);
  }

  // --- Helpers for Request Preparation ---

  private prepareRequestConfig(options: ApiRequestOptions, body: unknown): ApiRequestOptions {
    const config: ApiRequestOptions = { ...options };

    const headers = new Headers(this.defaultHeaders);
    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    config.headers = headers;

    if (body === undefined || body === null) {
      return config;
    }

    if (isNativeBody(body)) {
      config.body = body;

      if (body instanceof FormData) {
        headers.delete('Content-Type');
      }

      return config;
    }

    if (typeof body === 'string') {
      config.body = body;
      return config;
    }

    config.body = JSON.stringify(body);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return config;
  }

  private buildUrl(baseUrl: string, endpoint: RelativePath, params?: ParamsType): string {
    const url = new URL(`${baseUrl}${endpoint}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
        else url.searchParams.set(key, String(value));
      }
    }

    return url.href;
  }

  // --- Response Pipeline ---

  private async handleResponseChain<R>(
    initialResponseOrError: Response | Promise<Response>,
    config: ApiRequestOptions,
    requestUrl: string,
  ): Promise<R> {
    let promiseChain = Promise.resolve(initialResponseOrError);

    promiseChain = promiseChain.then(async (response) => {
      if (!response.ok) {
        const errorData = await this.safeParseError(response);
        throw new ApiError(response.statusText || 'API Error', {
          status: response.status,
          body: errorData,
          response,
          config,
          url: requestUrl,
        });
      }
      return response;
    });

    const responseHandlers = this.interceptors.response.getActiveHandlers();
    for (const handler of responseHandlers) {
      promiseChain = promiseChain.then(handler.fulfilled, handler.rejected);
    }

    return promiseChain
      .then((response) =>
        this.parseResponseData<R>(response, config.responseAs, requestUrl, config),
      )
      .catch((error) => {
        const isAbort = error instanceof DOMException && error.name === 'AbortError';
        if (!isAbort) {
          if (error instanceof ApiError) {
            devLogger.error(`[ApiService] ${error.status} ${error.message}`, error.body);
          } else {
            devLogger.error('[ApiService] Unexpected error', error);
          }
        }
        throw error;
      });
  }

  private async parseResponseData<R>(
    response: Response,
    parseType: ResponseParseType = 'json',
    requestUrl: string,
    config: ApiRequestOptions,
  ): Promise<R> {
    if (parseType === 'response') return response as unknown as R;

    // Handle empty bodies safely (204 No Content)
    if (response.status === 204) return undefined as R;

    try {
      switch (parseType) {
        case 'json': {
          // If server sends 200 OK with empty body but no Content-Length, .json() fails.
          // Safest generic approach:
          const text = await response.text();
          if (!text) return undefined as R; // Empty string -> undefined
          try {
            return JSON.parse(text);
          } catch {
            throw new Error('[ApiService]: Invalid JSON');
          }
        }
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
      // Clone the response because the request body stream can only be read once.
      // This prevents locking the stream for other consumers (e.g., interceptors).
      const text = await response.clone().text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch {
      return 'Could not read error body';
    }
  }

  // --- Mocks ---

  private async tryMockRequest(url: string, options: ApiRequestOptions): Promise<Response | null> {
    for (const [pattern, handler] of this.mockHandlers) {
      let isMatch = false;
      if (typeof pattern === 'string') {
        isMatch = url.includes(pattern);
      } else {
        // Reset lastIndex to avoid glitches with global flag /g
        pattern.lastIndex = 0;
        isMatch = pattern.test(url);
      }

      if (isMatch) {
        devLogger.info(`[Mock] Handling request: ${url}`);
        const { data, status = 200, headers } = await handler(url, options.params, options);

        let body: BodyInit | null = null;
        let defaultContentType = 'application/json';

        if (isNativeBody(data)) {
          body = data;
          defaultContentType = ''; // Browser handles headers
        } else if (typeof data === 'string') {
          body = data;
          defaultContentType = 'text/plain';
        } else {
          body = JSON.stringify(data);
        }

        const responseHeaders = new Headers(headers);
        if (defaultContentType && !responseHeaders.has('Content-Type')) {
          responseHeaders.set('Content-Type', defaultContentType);
        }

        return new Response(body, {
          status,
          statusText: status === 200 ? 'OK' : 'Mock Error',
          headers: responseHeaders,
        });
      }
    }
    return null;
  }

  // --- Public HTTP Methods ---

  public get<R, P extends ParamsType = ParamsType>(
    endpoint: RelativePath,
    params?: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'GET', params });
  }

  public post<R, P = unknown>(
    endpoint: RelativePath,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'POST' }, body);
  }

  public put<R, P = unknown>(
    endpoint: RelativePath,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'PUT' }, body);
  }

  public patch<R, P = unknown>(
    endpoint: RelativePath,
    body: P,
    options?: ApiRequestOptions,
  ): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'PATCH' }, body);
  }

  public delete<R = undefined>(endpoint: RelativePath, options?: ApiRequestOptions): Promise<R> {
    return this.request<R>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Helper: Check if body is native. Host (Browser/Node) handles it.
const isNativeBody = (data: unknown): data is BodyInit => {
  return (
    data instanceof FormData ||
    data instanceof URLSearchParams ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data)
  );
};

const validateBaseUrl = (baseUrl: string): void => {
  let url: URL;

  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error(`[ApiService]: baseUrl must be a valid absolute URL. Got: ${baseUrl}`);
  }

  if (url.search) {
    throw new Error(`[ApiService]: baseUrl can't contain query parameters. Got: ${baseUrl}`);
  }

  if (url.hash) {
    throw new Error(`[ApiService]: baseUrl can't contain hash. Got: ${baseUrl}`);
  }

  const allowedProtocols = envType.isDev ? ['https:', 'wss:', 'http:', 'ws:'] : ['https:', 'wss:'];

  if (!allowedProtocols.includes(url.protocol)) {
    throw new Error(
      `[ApiService]: baseUrl must use ${allowedProtocols.join(', ')}. Got: ${baseUrl}`,
    );
  }
};
