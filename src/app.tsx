import { colors } from './theme';
import {
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { fetchCurrentLocation } from './hooks/use-current-location';
import { DashboardScreen } from './screens/dashboard';
import { LocationBootstrapScreen } from './screens/location-bootstrap';
import { OtpVerificationScreen } from './screens/otp-verification';
import { PhoneLoginScreen } from './screens/phone-login';
import { CustomSplashScreen } from './screens/splash';
import type { AuthSession } from './services/auth-api';
import type { CompletedProfile } from './screens/profile';
import { clearAuthSession, getStoredAuthSession, saveAuthSession } from './services/auth-session-storage';
import { fetchUserProfile } from './services/user-profile-api';

type Screen = 'loading' | 'location-bootstrap' | 'phone' | 'otp' | 'dashboard';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0, fade: false });

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    os_light: OpenSans_300Light,
    os_regular: OpenSans_400Regular,
    os_medium: OpenSans_500Medium,
    os_semi_bold: OpenSans_600SemiBold,
    os_bold: OpenSans_700Bold,
    os_extrabold: OpenSans_800ExtraBold,
  });
  const [screen, setScreen] = useState<Screen>('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callingCode, setCallingCode] = useState('+91');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let active = true;

    void SplashScreen.hide();

    const sessionPromise = getStoredAuthSession().catch(() => null);
    void sessionPromise.then((storedSession) => {
      if (storedSession) void fetchCurrentLocation();
    });

    Promise.all([
      sessionPromise,
      new Promise<void>((resolve) => setTimeout(resolve, 1600)),
    ]).then(([storedSession]) => {
        if (!active) return;
        setSession(storedSession);
        setScreen(storedSession ? 'location-bootstrap' : 'phone');
      });

    return () => {
      active = false;
    };
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    const token = session?.token;
    if (screen !== 'dashboard' || !token) return;

    const controller = new AbortController();
    void fetchUserProfile(token, controller.signal)
      .then((profile) => {
        setSession((current) => {
          if (!current || current.token !== token) return current;
          const updatedSession: AuthSession = { ...current, ...profile };
          void saveAuthSession(updatedSession);
          return updatedSession;
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (__DEV__) console.warn('[Get User Profile API]', error);
      });

    return () => controller.abort();
  }, [screen, session?.token]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={{ flex: 1, backgroundColor: screen === 'loading' || screen === 'dashboard' ? colors.violetTone58 : colors.background }}>
        <StatusBar style={screen === 'loading' || screen === 'dashboard' ? 'light' : 'dark'} />
        {screen === 'loading' && <CustomSplashScreen />}
        {screen === 'location-bootstrap' && (
          <LocationBootstrapScreen
            authToken={session?.token}
            onComplete={() => setScreen('dashboard')}
          />
        )}
        {screen === 'phone' && (
          <PhoneLoginScreen
            onContinue={({ callingCode: nextCallingCode, phoneNumber: phone }) => {
              setPhoneNumber(phone);
              setCallingCode(nextCallingCode);
              setScreen('otp');
            }}
          />
        )}
        {screen === 'otp' && (
          <OtpVerificationScreen
            phoneNumber={phoneNumber}
            callingCode={callingCode}
            onBack={() => setScreen('phone')}
            onVerified={async (verifiedSession) => {
              const sessionWithPhone: AuthSession = {
                ...verifiedSession,
                phone: verifiedSession.phone || `${callingCode} ${phoneNumber}`,
              };
              try {
                await saveAuthSession(sessionWithPhone);
              } finally {
                setSession(sessionWithPhone);
                setScreen('location-bootstrap');
              }
            }}
          />
        )}
        {screen === 'dashboard' && (
          <DashboardScreen
            anniversaryDate={session?.anniversaryDate}
            authToken={session?.token}
            dob={session?.dob}
            email={session?.email}
            name={session?.name}
            phone={session?.phone || (phoneNumber ? `${callingCode} ${phoneNumber}` : undefined)}
            profilePicture={session?.profilePicture}
            onProfileUpdated={(profile: CompletedProfile) => {
              if (!session) return;
              const updatedSession = { ...session, ...profile };
              setSession(updatedSession);
              void saveAuthSession(updatedSession);
            }}
            onLogout={async () => {
              await clearAuthSession();
              setSession(null);
              setPhoneNumber('');
              setScreen('phone');
            }}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
