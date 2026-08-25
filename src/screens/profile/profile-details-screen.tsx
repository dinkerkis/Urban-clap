import { useEffect, useState } from 'react';
import {
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

export type CompletedProfile = {
  email: string;
  name: string;
  phone: string;
};

type ProfileDetailsScreenProps = {
  email?: string;
  name?: string;
  phone?: string;
  onBack: () => void;
  onVerified: (profile: CompletedProfile) => void;
};

const TITLE_OPTIONS = ['Mr.', 'Ms.'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFILE_COUNTRIES = ['IN', 'AE', 'SA', 'SG'].map((id) => countries.find((country) => country.id === id)).filter((country): country is Country => Boolean(country));

function FieldLabel({ children }: { children: string }) {
  return <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#29232D' }}>{children}</Text>;
}

function inputStyle(hasError = false) {
  return {
    minHeight: 44,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: hasError ? '#D53A4D' : '#E2DEE5',
    borderRadius: 10,
    borderCurve: 'continuous' as const,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#241F27',
  };
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
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(12, 10, 14, 0.76)' }}>
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
            backgroundColor: '#FFFFFF',
            opacity: pressed ? 0.65 : 1,
            boxShadow: '0 7px 22px rgba(0, 0, 0, 0.18)',
          })}
        >
          <Text style={{ fontSize: 22, lineHeight: 24, fontWeight: '300', color: '#28222C' }}>×</Text>
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
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text selectable style={{ paddingBottom: 12, fontSize: 20, lineHeight: 27, fontWeight: '700', color: '#171319' }}>{title}</Text>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

type VerifyEmailModalProps = {
  email: string;
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
};

function VerifyEmailModal({ email, visible, onClose, onVerified }: VerifyEmailModalProps) {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!visible) return;
    setOtp('');
    setSeconds(30);
  }, [visible]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const timer = setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1_000);
    return () => clearInterval(timer);
  }, [seconds, visible]);

  const verify = () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit verification code.');
      return;
    }
    onVerified();
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1, backgroundColor: 'rgba(16, 13, 18, 0.72)' }}>
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
              backgroundColor: '#FFFFFF',
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
                backgroundColor: '#FFFFFF',
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text style={{ fontSize: 22, lineHeight: 24, fontWeight: '300', color: '#28222C' }}>×</Text>
            </Pressable>

            <Text selectable style={{ fontSize: 27, lineHeight: 34, fontWeight: '700', color: '#171319' }}>Verify your email</Text>
            <Text selectable style={{ fontSize: 15, lineHeight: 21, color: '#777078' }}>We sent a 6-digit code to {email}.</Text>
            <TextInput
              accessibilityLabel="6-digit verification code"
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              placeholderTextColor="#A9A3AC"
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, ''))}
              style={[inputStyle(), { fontSize: 18, fontVariant: ['tabular-nums'], letterSpacing: 2 }]}
            />

            <Pressable
              accessibilityRole="button"
              onPress={verify}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                minWidth: 132,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: '#5935DD',
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Verify</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={seconds > 0}
              onPress={() => {
                setOtp('');
                setSeconds(30);
              }}
              style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 14, color: seconds > 0 ? '#AAA4AD' : '#5935DD' }}>
                {seconds > 0 ? `Resend OTP in ${seconds}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ProfileDetailsScreen({ email, name, phone, onBack, onVerified }: ProfileDetailsScreenProps) {
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: boolean; name?: boolean; phone?: boolean }>({});
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

  const submit = () => {
    Keyboard.dismiss();
    const nextErrors = {
      name: fullName.trim().length < 2,
      email: !EMAIL_PATTERN.test(emailAddress.trim()),
      phone: phoneNumber.length !== country.phoneLength,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.phone) {
      Alert.alert('Check your details', 'Please enter a valid name, email address and 10-digit phone number.');
      return;
    }
    setShowVerification(true);
  };

  const completeProfile = () => {
    setShowVerification(false);
    onVerified({
      name: fullName.trim(),
      email: emailAddress.trim().toLowerCase(),
      phone: `${country.callingCode} ${phoneNumber}`,
    });
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 8, paddingHorizontal: 20, paddingBottom: 20, gap: 18 }}
      >
        <View style={{ minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={10} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 0.7, borderColor: '#E4E0E6', backgroundColor: 'transparent', opacity: pressed ? 0.65 : 1 })}>
            <BackIcon color="#241A30" />
          </Pressable>
          <Text selectable style={{ fontSize: 18, lineHeight: 25, fontWeight: '700', color: '#1D1820' }}>Profile details</Text>
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
              style={({ pressed }) => ({ width: 65, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRightWidth: 0, borderColor: errors.name ? '#D53A4D' : '#E2DEE5', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, opacity: pressed ? 0.65 : 1 })}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#241F27' }}>{TITLE_OPTIONS[titleIndex]}</Text>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  width: 7,
                  height: 7,
                  borderRightWidth: 1.7,
                  borderBottomWidth: 1.7,
                  borderColor: '#241F27',
                  transform: [{ rotate: '45deg' }, { translateY: -2 }],
                }}
              />
            </Pressable>
            <TextInput value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Enter your name" placeholderTextColor="#A9A3AC" style={[inputStyle(Boolean(errors.name)), { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Email address</FieldLabel>
          <TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Enter your email" placeholderTextColor="#A9A3AC" style={inputStyle(Boolean(errors.email))} />
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
              borderColor: errors.phone ? '#D53A4D' : '#E2DEE5',
              borderRadius: 10,
              borderCurve: 'continuous',
              backgroundColor: '#FFFFFF',
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
              <Text style={{ fontSize: 17 }}>{country.flag}</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '600', color: '#241F27' }}>{country.callingCode}</Text>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  width: 7,
                  height: 7,
                  borderRightWidth: 1.7,
                  borderBottomWidth: 1.7,
                  borderColor: '#241F27',
                  transform: [{ rotate: '45deg' }, { translateY: -2 }],
                }}
              />
            </Pressable>
            <View style={{ width: 1, height: '100%', backgroundColor: '#E2DEE5' }} />
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
              placeholderTextColor="#A9A3AC"
              textContentType="telephoneNumber"
              style={{ flex: 1, alignSelf: 'stretch', paddingHorizontal: 13, paddingVertical: 0, fontSize: 14, color: '#241F27', fontVariant: ['tabular-nums'] }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Date of birth</FieldLabel>
          <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor="#A9A3AC" style={inputStyle()} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel>Anniversary</FieldLabel>
          <TextInput value={anniversary} onChangeText={setAnniversary} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor="#A9A3AC" style={inputStyle()} />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: keyboardVisible ? 6 : Math.max(insets.bottom, 14), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EDECEE', boxShadow: '0 -3px 10px rgba(23, 20, 25, 0.06)' }}>
        <Pressable accessibilityRole="button" onPress={submit} style={({ pressed }) => ({ minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderCurve: 'continuous', backgroundColor: '#5432DB', opacity: pressed ? 0.72 : 1 })}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Complete</Text>
        </Pressable>
      </View>

      <VerifyEmailModal email={emailAddress.trim()} visible={showVerification} onClose={() => setShowVerification(false)} onVerified={completeProfile} />
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
            style={({ pressed }) => ({ minHeight: 58, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#EEEAEF', opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: 15, color: '#000000' }}>{title}</Text>
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
            style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: '#EEEAEF', opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: 19 }}>{nextCountry.flag}</Text>
            <Text style={{ flex: 1, fontSize: 15, color: '#000000' }}>{nextCountry.name}</Text>
            <Text selectable style={{ fontSize: 16, color: '#AAA4AD' }}>{nextCountry.callingCode}</Text>
          </Pressable>
        ))}
      </ProfilePickerModal>
    </KeyboardAvoidingView>
  );
}
