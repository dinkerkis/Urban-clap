import { apiRequest, ApiClientError, requireApiData, type ApiResponse } from './api-client';

export type UpdateUserProfilePayload = {
  anniversaryDate?: string;
  dob?: string;
  email: string;
  name: string;
  phone: string;
};

export type UpdatedUserProfile = {
  anniversaryDate?: string | null;
  dob?: string | null;
  email: string;
  isEmailVerified?: boolean;
  phone: string;
  profile_status?: string;
  user_id: string;
};

export type UpdateUserProfileResult =
  | { kind: 'updated'; data: UpdatedUserProfile; message: string }
  | { kind: 'email_verification_required'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function parseUpdatedProfile(value: unknown): UpdatedUserProfile | null {
  if (!isRecord(value)) return null;
  if (typeof value.user_id !== 'string' || !value.user_id.trim()) return null;
  if (typeof value.email !== 'string' || !value.email.trim()) return null;
  if (typeof value.phone !== 'string' || !value.phone.trim()) return null;

  return {
    user_id: value.user_id.trim(),
    email: value.email.trim(),
    phone: value.phone.trim(),
    dob: typeof value.dob === 'string' ? value.dob : value.dob == null ? null : undefined,
    anniversaryDate:
      typeof value.anniversaryDate === 'string'
        ? value.anniversaryDate
        : value.anniversaryDate == null
          ? null
          : undefined,
    profile_status: typeof value.profile_status === 'string' ? value.profile_status : undefined,
    isEmailVerified: typeof value.isEmailVerified === 'boolean' ? value.isEmailVerified : undefined,
  };
}

export async function updateUserProfile(
  token: string,
  payload: UpdateUserProfilePayload,
  signal?: AbortSignal,
): Promise<UpdateUserProfileResult> {
  const response = await apiRequest<ApiResponse<UpdatedUserProfile | null>>('/mobile/user/profile', {
    method: 'PUT',
    token,
    json: payload,
    signal,
    defaultErrorMessage: 'Unable to update profile. Please try again.',
    logScope: 'Update User Profile API',
  });

  const message = typeof response.message === 'string' && response.message.trim() ? response.message.trim() : 'Profile updated successfully';
  const data = parseUpdatedProfile(response.data);

  if (data) {
    return { kind: 'updated', data, message };
  }

  // Response-1: email changed → OTP sent, data is null
  return { kind: 'email_verification_required', message };
}

export async function verifyUserEmailOtp(
  token: string,
  otp: string,
  signal?: AbortSignal,
): Promise<{ data: UpdatedUserProfile; message: string }> {
  const response = await apiRequest<ApiResponse<UpdatedUserProfile>>('/mobile/user/profile/verify-email', {
    method: 'POST',
    token,
    json: { otp },
    signal,
    defaultErrorMessage: 'Unable to verify email. Please try again.',
    logScope: 'Verify User Email OTP API',
  });

  const data = requireApiData(response, 'Email was verified, but the profile data was missing. Please try again.');
  const parsed = parseUpdatedProfile(data);
  if (!parsed) {
    throw new ApiClientError('Email was verified, but the profile data was incomplete. Please try again.', 200, 'INVALID_RESPONSE');
  }

  const message =
    typeof response.message === 'string' && response.message.trim()
      ? response.message.trim()
      : 'Email verified and updated successfully';

  return { data: parsed, message };
}
