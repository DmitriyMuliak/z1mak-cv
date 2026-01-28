type ParamsValueType = string | number | boolean | (string | number | boolean)[] | undefined | null;

export type RelativePath = `/${string}`;

export type ResponseParseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'response';

export type ParamsType = Record<string, ParamsValueType>;

export interface ApiRequestOptions extends RequestInit {
  responseAs?: ResponseParseType;
  params?: ParamsType;
  meta?: Record<string, unknown>;
}

export interface ApiInternalConfig extends ApiRequestOptions {
  url: string;
}

export type MockHandler<P = unknown> = (
  url: string,
  params?: P,
  options?: ApiRequestOptions,
) => Promise<{ data?: unknown; status?: number; headers?: Record<string, string> }>;
