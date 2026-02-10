import { publicPrEnv } from '@/utils/processEnv/public';

interface Logger {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  table(tabularData: unknown, properties?: readonly string[]): void;
  assert(condition?: boolean, ...args: unknown[]): void;
  dir(item: unknown, options?: unknown): void;
}

/**
 * DevLogger for debugging
 * env.DEV_LOGGER === true.
 */
class DevLogger implements Logger {
  private isLoggingEnabled: boolean;

  constructor() {
    this.isLoggingEnabled = !!publicPrEnv.NEXT_PUBLIC_DEV_LOGGER;
  }

  private logIfEnabled(method: keyof Console, ...args: unknown[]): void {
    if (!this.isLoggingEnabled) {
      return;
    }

    (console[method] as (...args: unknown[]) => void)(...args);
  }

  log(...args: unknown[]): void {
    this.logIfEnabled('log', ...args);
  }

  warn(...args: unknown[]): void {
    this.logIfEnabled('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.logIfEnabled('error', ...args);
  }

  info(...args: unknown[]): void {
    this.logIfEnabled('info', ...args);
  }

  debug(...args: unknown[]): void {
    this.logIfEnabled('debug', ...args);
  }

  table(tabularData: unknown, properties?: readonly string[]): void {
    this.logIfEnabled('table', tabularData, properties);
  }

  assert(condition?: boolean, ...args: unknown[]): void {
    this.logIfEnabled('assert', condition, ...args);
  }

  dir(item: unknown, options?: unknown): void {
    this.logIfEnabled('dir', item, options);
  }
}

export const devLogger = new DevLogger();
