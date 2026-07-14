import { fetch } from 'expo/fetch';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 15_000;

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to your .env file.');
}

type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
  success: boolean;
};

export type OtpRequestData = {
  is_new_user: boolean;
  phone: string;
};

export type AuthSession = {
  email: string;
  name: string;
  profilePicture: string;
  role: string;
  status: number;
  token: string;
  user_id: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForLog);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (key === 'otp') return [key, '[REDACTED]'];
        if (key === 'token') return [key, '[REDACTED]'];
        return [key, sanitizeForLog(entry)];
      }),
    );
  }

  return value;
}

function logApi(label: string, value: unknown): void {
  if (__DEV__) console.log(`[Auth API] ${label}`, sanitizeForLog(value));
}

async function post<T>(path: string, body: object): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    logApi(`POST ${path} body`, body);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    logApi(`POST ${path} response (${response.status})`, payload);

    if (!response.ok || !payload?.success) {
      throw new ApiError(payload?.message || 'The request could not be completed. Please try again.', response.status);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 408);
    }
    throw new ApiError('Unable to connect. Check your internet connection and try again.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestLoginOtp(phone: string): Promise<OtpRequestData> {
  const response = await post<OtpRequestData>('/login_twilio_otp', { phone });
  return response.data;
}

export async function verifyLoginOtp(phone: string, otp: string): Promise<AuthSession> {
  const response = await post<AuthSession>('/login_twilio_otp_verify', { phone, otp });
  return response.data;
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
