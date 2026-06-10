import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const LOG_PREFIX = '[HRM API]';
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'accesstoken',
  'refreshtoken',
  'currentpassword',
  'newpassword',
  'apikey',
  'secret',
]);

type RequestMeta = {
  startTime: number;
  requestId: string;
};

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMeta;
  }
}

let requestCounter = 0;

export function isApiLoggingEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_API_DEBUG === 'true'
  );
}

function nextRequestId(): string {
  requestCounter += 1;
  return `req-${requestCounter}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) {
    return '[Redacted]';
  }
  return sanitizeForLog(value);
}

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[Truncated]';
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeForLog(item, depth + 1));
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      output[key] = redactValue(key, sanitizeForLog(nested, depth + 1));
    }
    return output;
  }

  if (typeof value === 'string' && value.length > 500) {
    return `${value.slice(0, 500)}…`;
  }

  return value;
}

export function buildRequestUrl(config: InternalAxiosRequestConfig): string {
  const base = (config.baseURL ?? '').replace(/\/$/, '');
  const path = config.url ?? '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function getDurationMs(config?: InternalAxiosRequestConfig): number | null {
  const start = config?.metadata?.startTime;
  if (!start) return null;
  return Date.now() - start;
}

function formatDuration(config?: InternalAxiosRequestConfig): string {
  const ms = getDurationMs(config);
  return ms === null ? '' : ` (${ms}ms)`;
}

export function attachRequestMetadata(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  config.metadata = {
    startTime: Date.now(),
    requestId: nextRequestId(),
  };
  return config;
}

export function logApiRequest(config: InternalAxiosRequestConfig): void {
  if (!isApiLoggingEnabled()) return;

  const method = (config.method ?? 'get').toUpperCase();
  const url = buildRequestUrl(config);
  const id = config.metadata?.requestId ?? 'req-?';

  const payload: Record<string, unknown> = {
    id,
    params: config.params ? sanitizeForLog(config.params) : undefined,
  };

  if (config.data !== undefined && config.data !== '') {
    const body =
      typeof config.data === 'string'
        ? sanitizeForLog(safeJsonParse(config.data))
        : sanitizeForLog(config.data);
    payload.body = body;
  }

  if (config.headers?.Authorization) {
    payload.auth = 'Bearer [Redacted]';
  }

  console.groupCollapsed(`${LOG_PREFIX} → ${method} ${url}`);
  console.info('Request', payload);
  console.groupEnd();
}

export function logApiResponse(response: AxiosResponse): void {
  if (!isApiLoggingEnabled()) return;

  const config = response.config;
  const method = (config.method ?? 'get').toUpperCase();
  const url = buildRequestUrl(config);
  const id = config.metadata?.requestId ?? 'req-?';
  const status = response.status;

  console.groupCollapsed(
    `${LOG_PREFIX} ✓ ${method} ${url} ${status}${formatDuration(config)}`
  );
  console.info('Response', {
    id,
    status,
    data: sanitizeForLog(response.data),
  });
  console.groupEnd();
}

export function logApiError(error: AxiosError): void {
  if (!isApiLoggingEnabled()) return;

  const config = error.config;
  const method = (config?.method ?? 'get').toUpperCase();
  const url = config ? buildRequestUrl(config) : 'unknown';
  const id = config?.metadata?.requestId ?? 'req-?';
  const status = error.response?.status ?? 'NETWORK';
  const message = extractErrorMessage(error);

  // 4xx are expected client errors (wrong password, not found, etc.)
  // Reserve console.error only for 5xx server errors or network failures
  const isClientError = typeof status === 'number' && status >= 400 && status < 500;
  const logFn = isClientError ? console.warn : console.error;

  console.groupCollapsed(
    `${LOG_PREFIX} ✗ ${method} ${url} ${status}${formatDuration(config)}`
  );
  logFn('Error', {
    id,
    status,
    message,
    data: sanitizeForLog(error.response?.data),
  });
  console.groupEnd();
}

export function logApiCanceled(
  config: InternalAxiosRequestConfig | undefined,
  reason: string
): void {
  if (!isApiLoggingEnabled()) return;

  const method = (config?.method ?? 'get').toUpperCase();
  const url = config ? buildRequestUrl(config) : 'unknown';
  const id = config?.metadata?.requestId ?? 'req-?';

  console.warn(
    `${LOG_PREFIX} ⊘ ${method} ${url} canceled${formatDuration(config)}`,
    { id, reason }
  );
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error.message) return error.message;
  return 'Request failed';
}
