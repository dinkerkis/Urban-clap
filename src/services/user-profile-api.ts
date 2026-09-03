import { apiRequest, ApiClientError, requireApiData, type ApiResponse } from './api-client';
import { apiEndpoints } from './api-endpoints';
import { isRecord } from './normalization-utils';

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

export type UserProfile = {
  anniversaryDate?: string | null;
  address?: string;
  dob?: string | null;
  email: string;
  isEmailVerified?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  name: string;
  phone: string;
  profile_status?: string;
  user_id: string;
};

export type UpdateUserProfileResult =
  | { kind: 'updated'; data: UpdatedUserProfile; message: string }
  | { kind: 'email_verification_required'; message: string };

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

function parseUserProfile(value: unknown): UserProfile | null {
  if (!isRecord(value)) return null;

  const userId = typeof value._id === 'string' ? value._id.trim() : typeof value.user_id === 'string' ? value.user_id.trim() : '';
  if (!userId) return null;

  return {
    user_id: userId,
    name: typeof value.name === 'string' ? value.name.trim() : '',
    email: typeof value.email === 'string' ? value.email.trim() : '',
    phone: typeof value.phone === 'string' ? value.phone.trim() : '',
    address: typeof value.address === 'string' ? value.address.trim() : undefined,
    latitude: typeof value.latitude === 'number' ? value.latitude : value.latitude == null ? null : undefined,
    longitude: typeof value.longitude === 'number' ? value.longitude : value.longitude == null ? null : undefined,
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

export async function fetchUserProfile(token: string, signal?: AbortSignal): Promise<UserProfile> {
  const response = await apiRequest<ApiResponse<UserProfile>>(apiEndpoints.user.profile, {
    method: 'GET',
    token,
    signal,
    defaultErrorMessage: 'Unable to load profile. Please try again.',
    logScope: 'Get User Profile API',
  });
  const data = requireApiData(response, 'The profile response was missing. Please try again.');
  const parsed = parseUserProfile(data);
  if (!parsed) {
    throw new ApiClientError('The profile response was incomplete. Please try again.', 200, 'INVALID_RESPONSE');
  }
  return parsed;
}

export async function updateUserProfile(
  token: string,
  payload: UpdateUserProfilePayload,
  signal?: AbortSignal,
): Promise<UpdateUserProfileResult> {
  const response = await apiRequest<ApiResponse<UpdatedUserProfile | null>>(apiEndpoints.user.profile, {
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
  const response = await apiRequest<ApiResponse<UpdatedUserProfile>>(apiEndpoints.user.verifyEmail, {
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
