import { fetch } from 'expo/fetch';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
export const API_BASE_URL = configuredApiBaseUrl
  ?.replace(/\/+$/, '')
  .replace(/\/mobile$/, '');
const REQUEST_TIMEOUT_MS = 15_000;

if (!configuredApiBaseUrl || !API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to your .env file.');
}

export type ApiResponse<T> = {
  code?: number;
  data: T;
  message?: string;
  success: boolean;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number | string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function requireApiData<T>(response: ApiResponse<T>, message = 'The server returned incomplete data. Please try again.'): T {
  if (response.data == null) {
    throw new ApiClientError(message, 200, 'INVALID_RESPONSE');
  }
  return response.data;
}

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers' | 'signal'> & {
  defaultErrorMessage?: string;
  json?: unknown;
  logScope: string;
  signal?: AbortSignal;
  token?: string;
};

function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (['authorization', 'otp', 'token'].includes(key.toLowerCase())) return [key, '[REDACTED]'];
      return [key, sanitizeForLog(entry)];
    }),
  );
}

function getErrorDetails(payload: unknown): { code?: number | string; message?: string } {
  if (!payload || typeof payload !== 'object') return {};
  const value = payload as { code?: unknown; message?: unknown };
  return {
    code: typeof value.code === 'number' || typeof value.code === 'string' ? value.code : undefined,
    message: typeof value.message === 'string' ? value.message : undefined,
  };
}

export function getApiAssetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}/${path.replace(/^\//, '')}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions): Promise<T> {
  const { defaultErrorMessage = 'The request could not be completed. Please try again.', json, logScope, signal, token, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abortRequest, { once: true });
  const method = requestOptions.method ?? 'GET';

  try {
    if (__DEV__) {
      console.log(`[${logScope}] Request\n${method} ${API_BASE_URL}${path}`);
      if (json !== undefined) console.log(`[${logScope}] Body`, sanitizeForLog(json));
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      method,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: json === undefined ? undefined : JSON.stringify(json),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as T | null;

    if (__DEV__) {
      console.log(`[${logScope}] Response\nStatus: ${response.status}\n${JSON.stringify(sanitizeForLog(payload), null, 2)}`);
    }

    const details = getErrorDetails(payload);
    const explicitlyFailed = Boolean(payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: unknown }).success === false);
    if (!response.ok || explicitlyFailed) {
      throw new ApiClientError(details.message || defaultErrorMessage, response.status, details.code);
    }
    if (payload == null) {
      throw new ApiClientError('The server returned an invalid response. Please try again.', response.status);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new ApiClientError('The request timed out. Please try again.', 408, 'TIMEOUT');
    }
    throw new ApiClientError('Unable to connect. Check your internet connection and try again.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}
