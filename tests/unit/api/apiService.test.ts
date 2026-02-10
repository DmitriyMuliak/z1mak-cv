import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  ApiService,
  ApiError,
  type ApiRequestOptions,
  type ApiInternalConfig,
} from '@/api/apiService';
import { devLogger } from '@/lib/devLogger';

vi.mock('@/lib/devLogger', () => ({
  devLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiService', () => {
  let apiService: ApiService;
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    apiService = new ApiService({ baseUrl: `${baseUrl}/` });
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should remove trailing slash from base URL', () => {
      expect(apiService['baseUrl']).toBe(baseUrl);
    });

    it('should NOT set default headers', () => {
      const serviceWithCustomHeaders = new ApiService({
        baseUrl,
        headers: { 'X-Custom': 'value' },
      });
      expect(serviceWithCustomHeaders['defaultHeaders']).toEqual({
        'X-Custom': 'value',
      });
    });

    describe('Validation', () => {
      it('should throw error if baseUrl is invalid', () => {
        expect(() => new ApiService({ baseUrl: 'invalid-url' })).toThrow(/valid absolute URL/);
      });

      it('should throw error if baseUrl contains query params', () => {
        expect(() => new ApiService({ baseUrl: 'https://api.com?v=1' })).toThrow(
          /query parameters/,
        );
      });

      it('should throw error if protocol is not allowed (e.g. ftp)', () => {
        expect(() => new ApiService({ baseUrl: 'ftp://api.com' })).toThrow(/must use https:/);
      });
    });
  });

  describe('Request Methods', () => {
    it('GET: should make a GET request and return JSON data', async () => {
      const responseData = { message: 'success' };
      mockFetch.mockResolvedValue(new Response(JSON.stringify(responseData)));

      const result = await apiService.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, expect.any(Object));
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
      expect(result).toEqual(responseData);
    });

    it('POST: should make a POST request with a JSON body', async () => {
      const body = { data: 'test' };
      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));

      await apiService.post('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });

    it('PUT: should make a PUT request', async () => {
      const body = { data: 'update' };
      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));
      await apiService.put('/test', body);

      expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
      expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify(body));
    });

    it('PATCH: should make a PATCH request', async () => {
      const body = { data: 'patch' };
      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));
      await apiService.patch('/test', body);

      expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
      expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify(body));
    });

    it('DELETE: should make a DELETE request', async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));
      await apiService.delete('/test');
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    });
  });

  describe('Params Handling', () => {
    it('should append params to the URL for GET requests', async () => {
      const params = { id: '123', sort: 'asc' };
      mockFetch.mockResolvedValue(new Response('{}'));
      await apiService.get('/items', params);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/items?id=123&sort=asc`,
        expect.any(Object),
      );
    });
    it('should serialize array parameters and ignore null/undefined', async () => {
      const params = {
        ids: [1, 2],
        filter: 'active',
        ignored: undefined,
        empty: null,
      };

      mockFetch.mockResolvedValue(new Response('{}'));

      await apiService.get('/search', params);

      const calledUrl = mockFetch.mock.calls[0][0];
      const urlObj = new URL(calledUrl);

      expect(urlObj.searchParams.getAll('ids')).toEqual(['1', '2']);

      expect(urlObj.searchParams.get('filter')).toBe('active');
      expect(urlObj.searchParams.has('ignored')).toBe(false);
      expect(urlObj.searchParams.has('empty')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      const errorBody = { message: 'Not Found' };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(errorBody), {
          status: 404,
          statusText: 'Not Found',
        }),
      );

      const error = (await apiService.get('/fail').catch((err) => err)) as unknown;

      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.status).toBe(404);
        expect(error.body).toEqual(expect.objectContaining({ invalidFormat: false }));
        expect(error.body).toEqual(expect.objectContaining(errorBody));
      }
    });

    it('should handle network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValue(networkError);

      await expect(apiService.get('/network-error')).rejects.toThrow(ApiError);

      try {
        await apiService.get('/network-error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);

        if (error instanceof ApiError) {
          expect(error.message).toBe('Failed to fetch');
          expect(error.status).toBe(0);
          expect(error.cause).toBe(networkError);
        }
      }

      expect(devLogger.error).toHaveBeenCalledWith(
        '[ApiService] 0 Failed to fetch',
        {}, // body is empty object for network errors
      );
    });

    it('should throw ApiError on JSON parsing error', async () => {
      mockFetch.mockResolvedValue(new Response('invalid json', { status: 200 }));

      await expect(apiService.get('/parsing-error')).rejects.toThrow(ApiError);
      try {
        await apiService.get('/parsing-error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.message).toBe('Parsing Error');
          expect(error.status).toBe(200);
        }
      }
    });

    it('should handle request cancellation via AbortSignal', async () => {
      const controller = new AbortController();

      mockFetch.mockImplementation(async () => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          }, 50);
        });
      });

      const requestPromise = apiService.get('/slow', undefined, { signal: controller.signal });

      controller.abort();

      await expect(requestPromise).rejects.toThrow('The operation was aborted');
      await expect(requestPromise).rejects.toHaveProperty('name', 'AbortError');
    });
  });

  describe('Interceptors', () => {
    it('should apply request interceptors', async () => {
      apiService.interceptors.request.use((config) => {
        if (config.headers instanceof Headers) {
          config.headers.set('X-Intercepted', 'true');
        } else {
          config.headers = { ...config.headers, 'X-Intercepted': 'true' };
        }
        return config;
      });

      mockFetch.mockResolvedValue(new Response('{}'));
      await apiService.get('/intercept');

      const calledHeaders = mockFetch.mock.calls[0][1].headers;

      if (calledHeaders instanceof Headers) {
        expect(calledHeaders.get('X-Intercepted')).toBe('true');
      } else {
        expect(calledHeaders).toHaveProperty('X-Intercepted', 'true');
      }
    });

    it('should apply response interceptors', async () => {
      const interceptor = vi.fn((response) => response);
      apiService.interceptors.response.use(interceptor);

      mockFetch.mockResolvedValue(new Response('{}'));
      await apiService.get('/intercept-response');

      expect(interceptor).toHaveBeenCalled();
    });

    it('should handle response interceptor rejection and recover', async () => {
      // This interceptor will handle the rejection and recover
      apiService.interceptors.response.use(
        (response) => response, // does nothing on success
        (_error) => {
          // called on rejection
          // This recovery creates a new successful response
          return Promise.resolve(new Response(JSON.stringify({ recovered: true })));
        },
      );

      // This will cause a rejection because status is 400
      mockFetch.mockResolvedValue(new Response('Bad Request', { status: 400 }));

      const result = await apiService.get('/res-interceptor-rejection');

      expect(result).toEqual({ recovered: true });
    });

    it('should retry request after token refresh when receiving 401', async () => {
      // First call -> 401 Unauthorized
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Token expired' }), {
          status: 401,
          statusText: 'Unauthorized',
        }),
      );

      // Second call (Retry) -> 200 OK
      const successData = { id: 1, name: 'User' };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(successData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // 2. INTERCEPTOR SETUP: Refresh logic
      apiService.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error instanceof ApiError && error.status === 401) {
            // --- Simulation Refresh Token ---

            const { config, url } = error;

            const newToken = 'new-fake-access-token';

            const retryHeaders = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };

            return fetch(url, {
              ...config,
              headers: retryHeaders,
            });
          }

          throw error;
        },
      );

      const result = await apiService.post('/secure-data', { some: 'payload' });

      expect(result).toEqual(successData);

      expect(mockFetch).toHaveBeenCalledTimes(2);

      // First call with old token
      expect(mockFetch.mock.calls[0][0]).toBe(`${baseUrl}/secure-data`);

      // Second call with new token
      const retryCallArgs = mockFetch.mock.calls[1];
      const retryHeaders = retryCallArgs[1].headers as Record<string, string>;

      expect(retryCallArgs[0]).toBe(`${baseUrl}/secure-data`);
      expect(retryHeaders['Authorization']).toBe('Bearer new-fake-access-token');
    });

    describe('Interceptors Error Chaining (Pipeline)', () => {
      it('should allow a second interceptor to catch and recover from an error thrown by the first interceptor', async () => {
        apiService.interceptors.request.use(() => {
          throw new Error('Interceptor 1 Failed');
        });

        apiService.interceptors.request.use(
          (conf) => conf,
          (error) => {
            expect((error as Error).message).toBe('Interceptor 1 Failed');
            return { headers: { 'X-Recovered-By-Chain': 'true' } };
          },
        );

        mockFetch.mockResolvedValue(new Response('{}'));

        await apiService.get('/chain-test');

        expect(mockFetch).toHaveBeenCalled();
        expect(mockFetch.mock.calls[0][1].headers).toHaveProperty('X-Recovered-By-Chain', 'true');
      });

      it('should pass error through an intermediate interceptor that has no error handler', async () => {
        apiService.interceptors.request.use(() => Promise.reject(new Error('Boom')));

        apiService.interceptors.request.use((conf) => {
          conf.headers = { 'X-Should-Not-Exist': 'true' };
          return conf;
        });

        apiService.interceptors.request.use(
          (conf) => conf,
          (error) => {
            expect((error as Error).message).toBe('Boom');
            return { headers: { 'X-Caught-At-End': 'true' } };
          },
        );

        mockFetch.mockResolvedValue(new Response('{}'));

        await apiService.get('/fallthrough-test');

        const headers = mockFetch.mock.calls[0][1].headers;
        expect(headers).not.toHaveProperty('X-Should-Not-Exist');
        expect(headers).toHaveProperty('X-Caught-At-End', 'true');
      });

      it('should allow an interceptor to catch an error and throw a different one', async () => {
        apiService.interceptors.request.use(() => {
          throw new Error('Original Error');
        });

        apiService.interceptors.request.use(
          (c) => c,
          (error) => {
            throw new Error(`Wrapped: ${(error as Error).message}`);
          },
        );

        await expect(apiService.get('/transform')).rejects.toThrow('Wrapped: Original Error');
      });
    });
  });

  describe('Mocking', () => {
    it('should use mock handler for a matching string pattern', async () => {
      const mockData = { mock: 'data' };
      apiService.addMockHandler('/mock-me', async () => ({ data: mockData }));

      const result = await apiService.get('/mock-me');

      expect(result).toEqual(mockData);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(devLogger.info).toHaveBeenCalledWith(
        '[Mock] Handling request: https://api.test.com/mock-me',
      );
    });

    it('should use mock handler for a matching RegExp pattern', async () => {
      const mockData = { id: 123 };
      apiService.addMockHandler(/\/items\/\d+/, async () => ({
        data: mockData,
        status: 201,
      }));

      const result = await apiService.get('/items/123');
      expect(result).toEqual(mockData);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should prefer mock handler over real network request', async () => {
      apiService.addMockHandler('/users', async () => ({ data: [{ id: 1 }] }));

      mockFetch.mockRejectedValue(new Error('Should not be called'));

      const result = await apiService.get('/users');

      expect(result).toEqual([{ id: 1 }]);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Response Parsing', () => {
    it("should parse response as 'text'", async () => {
      const responseText = 'just text';
      mockFetch.mockResolvedValue(new Response(responseText));
      const result = await apiService.get('/text', {}, { responseAs: 'text' });
      expect(result).toBe(responseText);
    });

    it("should return the raw response when responseAs is 'response'", async () => {
      const rawResponse = new Response('{}');
      mockFetch.mockResolvedValue(rawResponse);
      const result = await apiService.get('/raw', {}, { responseAs: 'response' });
      expect(result).toBe(rawResponse);
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));
      const result = await apiService.delete('/resource');
      expect(result).toBeUndefined();
    });

    it('should return Blob when responseAs is set to "blob"', async () => {
      const mockBlob = new Blob(['binary'], { type: 'application/pdf' });
      mockFetch.mockResolvedValue(
        new Response(mockBlob, {
          headers: { 'Content-Type': 'application/pdf' },
        }),
      );

      const result = await apiService.get<Blob>('/file', undefined, { responseAs: 'blob' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('type', 'application/pdf');
      expect(result.constructor.name).toBe('Blob');
    });

    it('should return undefined for 200 OK with empty body when expecting JSON', async () => {
      mockFetch.mockResolvedValue(new Response('', { status: 200 }));

      const result = await apiService.get('/empty-json');
      expect(result).toBeUndefined();
    });
  });

  describe('Headers and Body preparation', () => {
    it('should not set Content-Type for FormData', async () => {
      const formData = new FormData();
      formData.append('key', 'value');

      mockFetch.mockResolvedValue(new Response(null, { status: 204 }));
      await apiService.post('/form-data', formData);

      const headers = new Headers(mockFetch.mock.calls[0][1].headers);
      expect(headers.get('Content-Type')).toBeNull();
    });
  });
});

describe('InterceptorManager', () => {
  it('should add and eject interceptors', () => {
    const apiService = new ApiService({ baseUrl: 'https://dummy.com' });
    const manager = apiService.interceptors.request;
    const handler = (config: ApiRequestOptions) => config;

    const id1 = manager.use(handler);
    const id2 = manager.use(handler);

    expect(manager.getActiveHandlers().length).toBe(2);
    manager.eject(id1);
    expect(manager.getActiveHandlers().length).toBe(1);
    manager.eject(id2);
    expect(manager.getActiveHandlers().length).toBe(0);
  });
});

describe('ApiError', () => {
  it('should construct with all properties', async () => {
    const config: ApiInternalConfig = { method: 'GET', url: 'http://test.com' };
    const data = { value: 'response data' };
    const response = new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const error = new ApiError('Test Error', {
      status: 500,
      body: { detail: 'Internal' },
      response,
      config,
    });

    expect(error.message).toBe('Test Error');
    expect(error.status).toBe(500);
    expect(error.body).toEqual({ detail: 'Internal' });
    expect(error.name).toBe('ApiError');
    expect(error.config).toBe(config);
    expect(error.url).toBe('http://test.com');
    // in ApiError we prevent access to .json()
    // because we pass JSON.parse(resp.text()) in { response } prop
    const resp = error.response as unknown as Response;
    expect(error.response && (await resp.json()).value).toBe(data.value);
  });
});
