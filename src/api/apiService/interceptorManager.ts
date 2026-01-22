type InterceptorHandler<V> = (value: V) => V | Promise<V>;
type InterceptorErrorHandler<V> = (error: unknown) => V | Promise<V>;

interface Interceptor<V> {
  fulfilled: InterceptorHandler<V>;
  rejected?: InterceptorErrorHandler<V>;
}

export class InterceptorManager<V> {
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
