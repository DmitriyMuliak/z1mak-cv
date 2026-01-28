# ApiService & Error Handling

## Overview

The `ApiService` is a production-ready, type-safe wrapper around the native Fetch API. It is designed to handle enterprise-level concerns such as **memory safety**, **interceptor management**, **mocking**, and **robust error parsing**.

## Key Features

- **Memory Safety:** Prevents OOM (Out of Memory) crashes by enforcing size limits on error bodies (default 16KB).
- **Type-Safe Interceptors:** strictly typed request and response middleware.
- **Smart Error Handling:** Uses **Discriminated Unions** to safely distinguish between valid JSON business errors and raw system errors (HTML/502s).
- **Mocking Support:** Built-in RegExp-based mocking for rapid development.

---

## Quick Start

```typescript
// 1. Initialize
export const api = new ApiService({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'X-App-Version': '1.0.0' },
});

// 2. Make Requests
interface User {
  id: number;
  name: string;
}

// GET
const user = await api.get<User, { id: number }>('/users/1', { id: 123 });

// POST
await api.post<TResponse, TBody>('/users', { name: 'John' });
```

---

## Error Handling Architecture

We do **not** use standard `response.json()` in catch blocks to avoid memory exhaustion attacks or crashing the browser on large HTML error dumps. We use a custom `ApiError` class with a consumed response body.

### The `ApiError` Structure

The `error.body` is a **Discriminated Union**. TypeScript will automatically narrow the type based on the `invalidFormat` flag.

```typescript
type ErrorBody<T> =
  | ({ invalidFormat: false } & T) // Valid JSON Business Error
  | { invalidFormat: true; raw: string }; // Invalid JSON (HTML, 502, Truncated)
```

### Best Practice: Handling Errors in UI

Use the provided **Type Guards** to safely access error data.

#### 1. `isValidApiError` (Recommended)

Use this when you expect a specific validation structure from the backend.

```typescript
import { isValidApiError } from '@/api/utils/isApiError';

interface ValidationError {
  message: string;
  fields: Record<string, string[]>;
}

try {
  await api.users.create(userData);
} catch (error) {
  // ✅ Checks if it is ApiError AND if the JSON format is valid
  if (isValidApiError<ValidationError>(error)) {
    // TypeScript knows 'fields' exists here
    form.setErrors(error.body.fields);
    toast.error(error.body.message);
  } else {
    // Handle network errors, 500 HTML responses, or generic errors
    toast.error('Something went wrong');
  }
}
```

#### 2. `isApiError` (Low Level)

Use this if you need to access the raw body of a failed request (e.g., for logging).

```typescript
import { isApiError } from '@/api/utils/isApiError';

if (isApiError(error)) {
  if (error.body.invalidFormat) {
    console.error('Critical: Server returned non-JSON:', error.body.raw);
  } else {
    console.log('Business Error:', error.body);
  }
}
```

---

## Interceptors & Middleware

Interceptors allow you to inject logic before a request is sent or after a response is received. This is the ideal layer for **Infrastructure Logic** (e.g., Authentication).

**Important:** In the `rejected` response interceptor, the `error.response` object is a `ConsumedResponse`. You **cannot** call `.json()` or `.text()` on it, as the stream has already been read. Always use `error.body` instead.

### 1. Basic Usage

```typescript
// Request Interceptor: Inject Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response Interceptor: Global Error Actions
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (isValidApiError(error) && error.status === 401) {
      // Handle Session Expiry
      logoutUser();
    }
    return Promise.reject(error);
  },
);
```

### 2. Replaying Requests (Infrastructure Retries)

In response interceptors, you have access to the original request configuration via `error.config`. This allows you to **replay** a request after resolving system issues (like a Token Refresh).

We provide a dedicated method **`api.retryRequest(config)`** for this purpose. It safely handles the Absolute URLs present in the error config without duplicating the `baseUrl`.

**Example: 401 Token Refresh Logic**

We use `meta` to track the retry state, ensuring we don't enter an infinite loop.

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check for 401 and ensure we haven't retried yet using `meta`
    if (isValidApiError(error) && error.status === 401) {
      const meta = error.config.meta || {};

      // If we already tried to refresh auth for this request, stop.
      if (meta.isAuthRetry) {
        return Promise.reject(error);
      }

      meta.isAuthRetry = true;
      error.config.meta = meta;

      try {
        await authService.refreshToken();
        const newToken = authService.getToken();

        // Update header and replay
        error.config.headers.set('Authorization', `Bearer ${newToken}`);
        return api.retryRequest(error.config);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    throw error;
  },
);
```

### 3. Advanced: Custom State via `meta`

The `ApiService` is stateless and does not enforce a retry strategy. However, request configurations include a **`meta`** property. You can use this to store custom state (like retry counters) directly within the request lifecycle, ensuring thread safety for parallel requests.

**Type Definition:**

```typescript
interface ApiRequestOptions {
  // ...
  meta?: Record<string, unknown>; // Store your custom state here
}
```

**Example: Retry 503 Errors (Max 3 Attempts)**

```typescript
api.interceptors.response.use(
  async (response) => response,
  (err) => {
    // Only retry specifically for 503 Service Unavailable
    if (!isValidApiError(err) || err.status !== 503) {
      return Promise.reject(err);
    }

    // 1. Initialize meta state
    const meta: { retryAttempts?: number } = err.config.meta || {};
    err.config.meta = meta;

    // 2. Custom Logic
    const attempts = meta.retryAttempts || 0;

    if (attempts < 3) {
      meta.retryAttempts = attempts + 1;

      // Add a 1s delay before retrying
      return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
        api.retryRequest(err.config),
      );
    }

    return Promise.reject(err);
  },
);
```

### Architectural Note: Business vs. Infrastructure Retries

While the `ApiService` can technically handle retries, it is best practice to separate concerns:

1. **Infrastructure Retries (ApiService/Interceptors):**

- Handle strictly **systemic** issues like `401 Unauthorized` (Token Refresh).
- These are transparent to the user.

2. **Business Retries (Application Layer):**

- Handle **transient** issues like `503 Service Unavailable` or Network Failures.
- **Best Practice:** Implement these retries in your data-fetching layer (e.g., React Query, SWR, or custom hooks) rather than the global `ApiService`. This allows for granular control (e.g., retrying a dashboard load is okay; retrying a payment transaction is dangerous).

---

## Mocking

You can mock endpoints using string paths or RegExp. Mocks bypass the network but still run through interceptors.

```typescript
api.addMockHandler(/\/users\/\d+/, async (url, params) => {
  return {
    status: 200,
    data: { id: 1, name: 'Mocked User' },
  };
});
```

---

## Important Architectural Decisions

1. **Why `readLimitedBody` instead of `response.clone()`?**

- `response.clone()` buffers the _entire_ stream into RAM. If a server returns a 100MB log file or infinite stream instead of a JSON error, the application will crash.
- Our implementation reads up to **16KB** and strictly aborts the stream connection if the limit is exceeded.

2. **`ConsumedResponse` Type**

- To prevent runtime errors, the `ApiError.response` type excludes methods like `.json()`, `.blob()`, and `.text()`. This enforces the use of the pre-parsed `ApiError.body`.
