import { apiRequest, requireApiData, type ApiResponse } from './api-client';

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

async function post<T>(path: string, body: object): Promise<ApiResponse<T>> {
  return apiRequest<ApiResponse<T>>(path, { method: 'POST', json: body, logScope: 'Auth API' });
}

export async function requestLoginOtp(phone: string): Promise<OtpRequestData> {
  const response = await post<OtpRequestData>('/login_twilio_otp', { phone });
  return requireApiData(response, 'OTP was sent, but the server response was incomplete. Please try again.');
}

export async function verifyLoginOtp(phone: string, otp: string): Promise<AuthSession> {
  const response = await post<AuthSession>('/login_twilio_otp_verify', { phone, otp });
  return requireApiData(response, 'Login succeeded, but the session data was missing. Please try again.');
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
