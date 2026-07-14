import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DashboardScreen } from './screens/dashboard';
import { OtpVerificationScreen } from './screens/otp-verification';
import { PhoneLoginScreen } from './screens/phone-login';
import type { AuthSession } from './services/auth-api';
import { clearAuthSession, getStoredAuthSession, saveAuthSession } from './services/auth-session-storage';
import { colors } from './theme/colors';

type Screen = 'loading' | 'phone' | 'otp' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callingCode, setCallingCode] = useState('+91');
  const [, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;

    getStoredAuthSession()
      .then((storedSession) => {
        if (!active) return;
        setSession(storedSession);
        setScreen(storedSession ? 'dashboard' : 'phone');
      })
      .catch(() => {
        if (active) setScreen('phone');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: screen === 'dashboard' ? '#6E45E2' : colors.background }}>
      <StatusBar style={screen === 'dashboard' ? 'light' : 'dark'} />
      {screen === 'loading' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
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
