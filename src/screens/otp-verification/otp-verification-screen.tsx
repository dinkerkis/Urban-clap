import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';

import { AuthHeader } from '../../components/auth-header';
import { OtpInput } from '../../components/otp-input';
import { VerificationMessageIcon } from '../../components/verification-message-icon';
import { OTP_EXPIRY_SECONDS, OTP_LENGTH } from '../../config/auth';
import {
  type AuthSession,
  getApiErrorMessage,
  requestLoginOtp,
  verifyLoginOtp,
} from '../../services/auth-api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  callingCode: string;
  onBack: () => void;
  onVerified: (session: AuthSession) => void;
  phoneNumber: string;
};

export function OtpVerificationScreen({ callingCode, onBack, onVerified, phoneNumber }: Props) {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [seconds, setSeconds] = useState(OTP_EXPIRY_SECONDS);
  const fullPhoneNumber = `${callingCode}${phoneNumber}`;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (otp.length !== OTP_LENGTH) return;

    let active = true;
    setErrorMessage('');
    setIsVerifying(true);
    void verifyLoginOtp(fullPhoneNumber, otp)
      .then((session) => {
        if (active) onVerified(session);
      })
      .catch((error) => {
        if (active) setErrorMessage(getApiErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsVerifying(false);
      });

    return () => {
      active = false;
    };
  }, [fullPhoneNumber, onVerified, otp]);

  const handleChange = (value: string) => {
    setErrorMessage('');
    setOtp(value);
  };

  const resend = async () => {
    if (isResending) return;
    setErrorMessage('');
    setIsResending(true);
    try {
      await requestLoginOtp(fullPhoneNumber);
      setOtp('');
      setSeconds(OTP_EXPIRY_SECONDS);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <AuthHeader onPress={onBack} />
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24, paddingTop: 42, gap: 24 }}>
          <VerificationMessageIcon />
          <View style={{ gap: 8 }}>
            <Text style={{ ...typography.title, color: colors.text }}>Enter verification code</Text>
            <Text style={{ ...typography.body, color: colors.textSecondary }}>
              A 6-digit verification code has been sent to
            </Text>
            <Text selectable style={{ ...typography.body, fontWeight: '600', color: colors.text }}>
              {callingCode} {phoneNumber}
            </Text>
          </View>

          <OtpInput error={Boolean(errorMessage)} onChange={handleChange} value={otp} />

          {errorMessage ? (
            <Text selectable accessibilityLiveRegion="polite" style={{ ...typography.caption, color: colors.danger }}>
              ●  {errorMessage}
            </Text>
          ) : isVerifying ? (
            <Text accessibilityLiveRegion="polite" style={{ ...typography.caption, color: colors.textSecondary }}>
              Verifying code…
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Text style={{ fontSize: 18, color: colors.text }}>◷</Text>
            {seconds > 0 ? (
              <Text style={{ ...typography.body, color: colors.text, fontVariant: ['tabular-nums'] }}>
                00:{String(seconds).padStart(2, '0')}
              </Text>
            ) : (
              <Pressable accessibilityRole="button" disabled={isResending} onPress={() => void resend()} hitSlop={10}>
                <Text style={{ ...typography.body, fontWeight: '600', color: colors.primary }}>
                  {isResending ? 'Sending…' : 'Resend code'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
