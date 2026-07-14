import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DashboardScreen } from './screens/dashboard';
import { OtpVerificationScreen } from './screens/otp-verification';
import { PhoneLoginScreen } from './screens/phone-login';
import { CustomSplashScreen } from './screens/splash';
import type { AuthSession } from './services/auth-api';
import { clearAuthSession, getStoredAuthSession, saveAuthSession } from './services/auth-session-storage';
import { colors } from './theme/colors';

type Screen = 'loading' | 'phone' | 'otp' | 'dashboard';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0, fade: false });

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callingCode, setCallingCode] = useState('+91');
  const [, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;

    void SplashScreen.hide();

    Promise.all([
      getStoredAuthSession().catch(() => null),
      new Promise<void>((resolve) => setTimeout(resolve, 1000)),
    ]).then(([storedSession]) => {
        if (!active) return;
        setSession(storedSession);
        setScreen(storedSession ? 'dashboard' : 'phone');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: screen === 'loading' || screen === 'dashboard' ? '#6E45E2' : colors.background }}>
      <StatusBar style={screen === 'loading' || screen === 'dashboard' ? 'light' : 'dark'} />
      {screen === 'loading' && <CustomSplashScreen />}
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
          onVerified={async (session) => {
            try {
              await saveAuthSession(session);
            } finally {
              setSession(session);
              setScreen('dashboard');
            }
          }}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          onLogout={async () => {
            await clearAuthSession();
            setSession(null);
            setPhoneNumber('');
            setScreen('phone');
          }}
        />
      )}
    </View>
  );
}
