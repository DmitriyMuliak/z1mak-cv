import type { ApiRequestOptions } from './types';

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
