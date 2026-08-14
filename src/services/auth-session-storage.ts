import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from './auth-api';

const AUTH_SESSION_KEY = 'urban-clap.auth-session';
const INSTALL_MARKER_NAME = 'urban-clap.install-marker';

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

function getInstallMarker(): File {
  return new File(Paths.document, INSTALL_MARKER_NAME);
}

function markCurrentInstall(): void {
  const marker = getInstallMarker();
  if (marker.exists) return;

  try {
    marker.create();
    marker.write('1');
  } catch {
    // Marker write failures should not block login.
  }
}

async function clearKeychainSessionIfFreshInstall(): Promise<void> {
  if (getInstallMarker().exists) return;

  // iOS Keychain survives app deletion. The document-directory marker does not,
  // so a reinstall is treated as a new install and the old session is dropped.
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  markCurrentInstall();
}

export async function getStoredAuthSession(): Promise<AuthSession | null> {
  await clearKeychainSessionIfFreshInstall();

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
  markCurrentInstall();
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}
