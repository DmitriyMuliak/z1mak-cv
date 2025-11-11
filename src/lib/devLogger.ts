/* eslint-disable @typescript-eslint/no-explicit-any */
import { publicPrEnv } from '@/utils/processEnv/public';

/**
 * Інтерфейс, що повторює найбільш поширені методи console.
 */
interface Logger {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  table(tabularData: any, properties?: readonly string[]): void;
  assert(condition?: boolean, ...args: any[]): void;
  dir(item: any, options?: any): void;
}

/**
 * DevLogger for debugging
 * env.DEV_LOGGER === true.
 */
class DevLogger implements Logger {
  private isLoggingEnabled: boolean;

  constructor() {
    this.isLoggingEnabled = Boolean(publicPrEnv.NEXT_PUBLIC_DEV_LOGGER);
  }

  private logIfEnabled(method: keyof Console, ...args: any[]): void {
    if (this.isLoggingEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (console[method] as Function)(...args);
    }
  }

  log(...args: any[]): void {
    this.logIfEnabled('log', ...args);
  }

  warn(...args: any[]): void {
    this.logIfEnabled('warn', ...args);
  }

  error(...args: any[]): void {
    this.logIfEnabled('error', ...args);
  }

  info(...args: any[]): void {
    this.logIfEnabled('info', ...args);
  }

  debug(...args: any[]): void {
    this.logIfEnabled('debug', ...args);
  }

  table(tabularData: any, properties?: readonly string[]): void {
    this.logIfEnabled('table', tabularData, properties);
  }

  assert(condition?: boolean, ...args: any[]): void {
    this.logIfEnabled('assert', condition, ...args);
  }

  dir(item: any, options?: any): void {
    this.logIfEnabled('dir', item, options);
  }
}

export const devLogger = new DevLogger();
