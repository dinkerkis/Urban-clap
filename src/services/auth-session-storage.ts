import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from './auth-api';

const AUTH_SESSION_KEY = 'urban-clap.auth-session';

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;

  const session = value as Partial<AuthSession>;
  return (
    typeof session.user_id === 'string' &&
    typeof session.token === 'string' &&
    session.user_id.length > 0 &&
    session.token.length > 0
  );
}

export async function getStoredAuthSession(): Promise<AuthSession | null> {
  const storedSession = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  if (!storedSession) return null;

  try {
    const session = JSON.parse(storedSession) as unknown;
    if (isAuthSession(session)) return session;
  } catch {
    // A malformed stored value should not prevent the app from opening.
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  return null;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}
