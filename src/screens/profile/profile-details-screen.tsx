import { colors, fontSizes } from '../../theme';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { countries, defaultCountry, type Country } from '../../config/countries';
import { getApiErrorMessage } from '../../services/auth-api';
import { updateUserProfile, verifyUserEmailOtp, type UpdateUserProfilePayload } from '../../services/user-profile-api';

export type CompletedProfile = {
  email: string;
  name: string;
  phone: string;
};

type ProfileDetailsScreenProps = {
  authToken?: string;
  email?: string;
  name?: string;
  phone?: string;
  onBack: () => void;
  onVerified: (profile: CompletedProfile) => void;
};

const TITLE_OPTIONS = ['Mr.', 'Ms.'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
const PROFILE_COUNTRIES = ['IN', 'AE', 'SA', 'SG'].map((id) => countries.find((country) => country.id === id)).filter((country): country is Country => Boolean(country));

function FieldLabel({ children }: { children: string }) {
  return <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, fontWeight: '600', color: colors.mauveTone16 }}>{children}</Text>;
}

function inputStyle(hasError = false) {
  return {
    minHeight: 44,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: hasError ? colors.redTone53 : colors.violetTone88_2,
    borderRadius: 10,
    borderCurve: 'continuous' as const,
    backgroundColor: colors.white,
    fontSize: fontSizes.size14,
    color: colors.mauveTone14_2,
  };
}

function formatSessionPhone(phone: string, callingCode: string) {
  const digits = phone.replace(/\D/g, '');
  const codeDigits = callingCode.replace(/\D/g, '');
  if (codeDigits && digits.startsWith(codeDigits) && digits.length > codeDigits.length) {
    return `${callingCode} ${digits.slice(codeDigits.length)}`;
  }
  return `${callingCode} ${digits}`;
}

function normalizeOptionalDate(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

type ProfilePickerModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function ProfilePickerModal({ children, onClose, title, visible }: ProfilePickerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.violetTone5Alpha76 }}>
        <Pressable accessibilityLabel={`Close ${title}`} onPress={onClose} style={{ position: 'absolute', inset: 0 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 22,
            marginBottom: 8,
            borderRadius: 18,
            backgroundColor: colors.white,
            opacity: pressed ? 0.65 : 1,
            boxShadow: `0 7px 22px ${colors.blackAlpha18}`,
          })}
        >
          <Text style={{ fontSize: fontSizes.size22, lineHeight: 24, fontWeight: '300', color: colors.mauveTone15_2 }}>×</Text>
        </Pressable>
        <Animated.View
          entering={SlideInDown.duration(250)}
          exiting={SlideOutDown.duration(210)}
          style={{
            paddingTop: 26,
            paddingHorizontal: 22,
            paddingBottom: Math.max(insets.bottom, 18) + 12,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderCurve: 'continuous',
            backgroundColor: colors.white,
          }}
        >
          <Text selectable style={{ paddingBottom: 12, fontSize: fontSizes.size20, lineHeight: 27, fontWeight: '700', color: colors.mauveTone9 }}>{title}</Text>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

type VerifyEmailModalProps = {
  authToken: string;
  email: string;
  pendingPayload: UpdateUserProfilePayload | null;
  visible: boolean;
  onClose: () => void;
  onVerified: (profile: { email: string; phone: string }) => void;
};

function VerifyEmailModal({ authToken, email, pendingPayload, visible, onClose, onVerified }: VerifyEmailModalProps) {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setOtp('');
    setSeconds(30);
    setIsVerifying(false);
    setIsResending(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const timer = setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1_000);
    return () => clearInterval(timer);
  }, [seconds, visible]);

  const verify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit verification code.');
      return;
    }
    if (isVerifying) return;

    setIsVerifying(true);
    try {
      const result = await verifyUserEmailOtp(authToken, otp);
      onVerified({ email: result.data.email, phone: result.data.phone });
    } catch (error) {
      Alert.alert('Verification failed', getApiErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (!pendingPayload || isResending || seconds > 0) return;
    setIsResending(true);
    try {
      await updateUserProfile(authToken, pendingPayload);
      setOtp('');
      setSeconds(30);
      Alert.alert('OTP sent', 'A new verification code was sent to your email.');
    } catch (error) {
      Alert.alert('Resend failed', getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1, backgroundColor: colors.violetTone6Alpha72 }}>
          <Pressable accessibilityLabel="Close email verification" onPress={onClose} style={{ flex: 1 }} />

          <Animated.View
            entering={SlideInDown.duration(260)}
            exiting={SlideOutDown.duration(220)}
            style={{
              paddingHorizontal: 22,
              paddingTop: 28,
              paddingBottom: Math.max(insets.bottom, 18) + 20,
              gap: 16,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: colors.white,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={({ pressed }) => ({
                position: 'absolute',
                right: 20,
                top: -44,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                backgroundColor: colors.white,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.size22, lineHeight: 24, fontWeight: '300', color: colors.mauveTone15_2 }}>×</Text>
            </Pressable>

            <Text selectable style={{ fontSize: fontSizes.size27, lineHeight: 34, fontWeight: '700', color: colors.mauveTone9 }}>Verify your email</Text>
            <Text selectable style={{ fontSize: fontSizes.size15, lineHeight: 21, color: colors.neutralTone45 }}>We sent a 6-digit code to {email}.</Text>
            <TextInput
              accessibilityLabel="6-digit verification code"
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              placeholderTextColor={colors.mauveTone66}
              value={otp}
              editable={!isVerifying}
              onChangeText={(value) => setOtp(value.replace(/\D/g, ''))}
              style={[inputStyle(), { fontSize: fontSizes.size18, fontVariant: ['tabular-nums'], letterSpacing: 2 }]}
            />

            <Pressable
              accessibilityRole="button"
              disabled={isVerifying}
              onPress={() => {
                void verify();
              }}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                minWidth: 132,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: colors.blueTone54,
                opacity: isVerifying ? 0.7 : pressed ? 0.72 : 1,
              })}
            >
              {isVerifying ? <ActivityIndicator color={colors.white} /> : <Text style={{ fontSize: fontSizes.size16, fontWeight: '700', color: colors.white }}>Verify</Text>}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={seconds > 0 || isResending || !pendingPayload}
              onPress={() => {
                void resendOtp();
              }}
              style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
            >
              <Text style={{ fontSize: fontSizes.size14, color: seconds > 0 || isResending ? colors.mauveTone66_4 : colors.blueTone54 }}>
                {isResending ? 'Sending…' : seconds > 0 ? `Resend OTP in ${seconds}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ProfileDetailsScreen({ authToken, email, name, phone, onBack, onVerified }: ProfileDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const initialCountry = countries.find((country) => phone?.replace(/\s/g, '').startsWith(country.callingCode)) ?? defaultCountry;
  const [titleIndex, setTitleIndex] = useState(0);
  const [isTitlePickerOpen, setIsTitlePickerOpen] = useState(false);
  const [fullName, setFullName] = useState(name?.trim() || '');
  const [emailAddress, setEmailAddress] = useState(email?.trim() || '');
  const [country, setCountry] = useState(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState((phone || '').replace(initialCountry.callingCode, '').replace(/\D/g, ''));
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateUserProfilePayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ anniversary?: boolean; dob?: boolean; email?: boolean; name?: boolean; phone?: boolean }>({});
  const countrySelectorWidth = country.id === 'SA' || country.id === 'AE' ? 100 : 90;

  useEffect(() => {
    const showEvent = process.env.EXPO_OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = process.env.EXPO_OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const buildCompletedProfile = (nextEmail: string, nextPhone: string): CompletedProfile => ({
    name: fullName.trim(),
    email: nextEmail.trim().toLowerCase(),
    phone: formatSessionPhone(nextPhone, country.callingCode),
  });

  const submit = async () => {
    Keyboard.dismiss();
    const dobValue = normalizeOptionalDate(dateOfBirth);
    const anniversaryValue = normalizeOptionalDate(anniversary);
    const nextErrors = {
      name: fullName.trim().length < 2,
      email: !EMAIL_PATTERN.test(emailAddress.trim()),
      phone: phoneNumber.length !== country.phoneLength,
      dob: Boolean(dobValue && !DATE_PATTERN.test(dobValue)),
      anniversary: Boolean(anniversaryValue && !DATE_PATTERN.test(anniversaryValue)),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      Alert.alert('Check your details', 'Please enter a valid name, email address and phone number.');
      return;
    }
    if (nextErrors.dob || nextErrors.anniversary) {
      Alert.alert('Check your dates', 'Please enter dates as DD-MM-YYYY.');
      return;
    }
    if (!authToken) {
      Alert.alert('Sign in required', 'Please sign in again to update your profile.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload: UpdateUserProfilePayload = {
        name: fullName.trim(),
        email: emailAddress.trim().toLowerCase(),
        phone: phoneNumber,
        ...(dobValue ? { dob: dobValue } : {}),
        ...(anniversaryValue ? { anniversaryDate: anniversaryValue } : {}),
      };
      const result = await updateUserProfile(authToken, payload);

      if (result.kind === 'email_verification_required') {
        setPendingPayload(payload);
        setShowVerification(true);
        return;
      }

      setPendingPayload(null);
      Alert.alert('Profile updated', result.message);
      onVerified(buildCompletedProfile(result.data.email, result.data.phone));
    } catch (error) {
      Alert.alert('Update failed', getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeProfile = (verified: { email: string; phone: string }) => {
    setShowVerification(false);
    setPendingPayload(null);
    Alert.alert('Email verified', 'Email verified and updated successfully');
    onVerified(buildCompletedProfile(verified.email, verified.phone));
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 8, paddingHorizontal: 20, paddingBottom: 20, gap: 18 }}
      >
        <View style={{ minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={10} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 0.7, borderColor: colors.mauveTone89, backgroundColor: colors.transparent, opacity: pressed ? 0.65 : 1 })}>
            <BackIcon color={colors.violetTone15} />
          </Pressable>
          <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 25, fontWeight: '700', color: colors.mauveTone11 }}>Profile details</Text>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Name</FieldLabel>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss();
                setIsTitlePickerOpen(true);
              }}
              style={({ pressed }) => ({ width: 65, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRightWidth: 0, borderColor: errors.name ? colors.redTone53 : colors.violetTone88_2, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, opacity: pressed ? 0.65 : 1 })}
            >
              <Text style={{ fontSize: fontSizes.size14, fontWeight: '600', color: colors.mauveTone14_2 }}>{TITLE_OPTIONS[titleIndex]}</Text>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  width: 7,
                  height: 7,
                  borderRightWidth: 1.7,
                  borderBottomWidth: 1.7,
                  borderColor: colors.mauveTone14_2,
                  transform: [{ rotate: '45deg' }, { translateY: -2 }],
                }}
              />
            </Pressable>
            <TextInput value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Enter your name" placeholderTextColor={colors.mauveTone66} style={[inputStyle(Boolean(errors.name)), { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Email address</FieldLabel>
          <TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Enter your email" placeholderTextColor={colors.mauveTone66} style={inputStyle(Boolean(errors.email))} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Phone number</FieldLabel>
          <View
            style={{
              height: 44,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: errors.phone ? colors.redTone53 : colors.violetTone88_2,
              borderRadius: 10,
              borderCurve: 'continuous',
              backgroundColor: colors.white,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select country. Current selection ${country.name} ${country.callingCode}`}
              onPress={() => {
                Keyboard.dismiss();
                setIsCountryPickerOpen(true);
              }}
              style={({ pressed }) => ({ height: '100%', width: countrySelectorWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: pressed ? 0.62 : 1 })}
            >
              <Text style={{ fontSize: fontSizes.size17 }}>{country.flag}</Text>
              <Text selectable style={{ fontSize: fontSizes.size14, fontWeight: '600', color: colors.mauveTone14_2 }}>{country.callingCode}</Text>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  width: 7,
                  height: 7,
                  borderRightWidth: 1.7,
                  borderBottomWidth: 1.7,
                  borderColor: colors.mauveTone14_2,
                  transform: [{ rotate: '45deg' }, { translateY: -2 }],
                }}
              />
            </Pressable>
            <View style={{ width: 1, height: '100%', backgroundColor: colors.violetTone88_2 }} />
            <TextInput
              value={phoneNumber}
              onChangeText={(value) => {
                setErrors((current) => ({ ...current, phone: false }));
                setPhoneNumber(value.replace(/\D/g, '').slice(0, country.phoneLength));
              }}
              autoCorrect={false}
              keyboardType="phone-pad"
              maxLength={country.phoneLength}
              placeholder="Enter Phone Number"
              placeholderTextColor={colors.mauveTone66}
              textContentType="telephoneNumber"
              style={{ flex: 1, alignSelf: 'stretch', paddingHorizontal: 13, paddingVertical: 0, fontSize: fontSizes.size14, color: colors.mauveTone14_2, fontVariant: ['tabular-nums'] }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Date of birth</FieldLabel>
          <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor={colors.mauveTone66} style={inputStyle(Boolean(errors.dob))} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Anniversary</FieldLabel>
          <TextInput value={anniversary} onChangeText={setAnniversary} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor={colors.mauveTone66} style={inputStyle(Boolean(errors.anniversary))} />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: keyboardVisible ? 6 : Math.max(insets.bottom, 14), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.violetTone93_2, boxShadow: `0 -3px 10px ${colors.mauveTone9Alpha6}` }}>
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => {
            void submit();
          }}
          style={({ pressed }) => ({
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9,
            borderCurve: 'continuous',
            backgroundColor: colors.blueTone53,
            opacity: isSubmitting ? 0.7 : pressed ? 0.72 : 1,
          })}
        >
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={{ fontSize: fontSizes.size15, fontWeight: '700', color: colors.white }}>Complete</Text>}
        </Pressable>
      </View>

      <VerifyEmailModal
        authToken={authToken ?? ''}
        email={emailAddress.trim()}
        pendingPayload={pendingPayload}
        visible={showVerification}
        onClose={() => {
          setShowVerification(false);
          setPendingPayload(null);
        }}
        onVerified={completeProfile}
      />
      <ProfilePickerModal visible={isTitlePickerOpen} title="Select title" onClose={() => setIsTitlePickerOpen(false)}>
        {TITLE_OPTIONS.map((title, index) => (
          <Pressable
            key={title}
            accessibilityRole="radio"
            accessibilityState={{ checked: index === titleIndex }}
            onPress={() => {
              setTitleIndex(index);
              setIsTitlePickerOpen(false);
            }}
            style={({ pressed }) => ({ minHeight: 58, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.mauveTone93, opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: fontSizes.size15, color: colors.black }}>{title}</Text>
          </Pressable>
        ))}
      </ProfilePickerModal>
      <ProfilePickerModal
        visible={isCountryPickerOpen}
        title="Select country code"
        onClose={() => setIsCountryPickerOpen(false)}
      >
        {PROFILE_COUNTRIES.map((nextCountry) => (
          <Pressable
            key={nextCountry.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: nextCountry.id === country.id }}
            onPress={() => {
              setCountry(nextCountry);
              setPhoneNumber('');
              setErrors((current) => ({ ...current, phone: false }));
              setIsCountryPickerOpen(false);
            }}
            style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.mauveTone93, opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: fontSizes.size19 }}>{nextCountry.flag}</Text>
            <Text style={{ flex: 1, fontSize: fontSizes.size15, color: colors.black }}>{nextCountry.name}</Text>
            <Text selectable style={{ fontSize: fontSizes.size16, color: colors.mauveTone66_4 }}>{nextCountry.callingCode}</Text>
          </Pressable>
        ))}
      </ProfilePickerModal>
    </KeyboardAvoidingView>
  );
}
