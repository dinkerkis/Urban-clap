import { colors, fontFamilies, fontSizes, typography } from '../../theme';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountryPickerModal } from '../../components/country-picker-modal';
import { PhoneMessageIcon } from '../../components/phone-message-icon';
import { PrimaryButton } from '../../components/primary-button';
import { defaultCountry, type Country } from '../../config/countries';
import { getApiErrorMessage, requestLoginOtp } from '../../services/auth-api';

type Props = {
  onContinue: (value: { callingCode: string; phoneNumber: string }) => void;
};

export function PhoneLoginScreen({ onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(defaultCountry);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isValid = phone.length === country.phoneLength;

  const selectCountry = (nextCountry: Country) => {
    setCountry(nextCountry);
    setPhone('');
    setErrorMessage('');
    setIsCountryPickerOpen(false);
  };

  const continueToOtp = async () => {
    if (!isValid || isSending) return;

    const fullPhoneNumber = `${country.callingCode}${phone}`;
    setErrorMessage('');
    setIsSending(true);
    try {
      await requestLoginOtp(fullPhoneNumber);
      setIsSending(false);
      onContinue({ callingCode: country.callingCode, phoneNumber: phone });
    } catch (error) {
      setIsSending(false);
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        bounces={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: process.env.EXPO_OS === 'android' ? Math.max(insets.top, 12) : 28,
          paddingBottom: 24,
        }}
      >
        <View>
          <View style={{ gap: 30 }}>
            <View style={{ gap: 20 }}>
              <PhoneMessageIcon />
              <View style={{ gap: 10 }}>
                <Text style={{ ...typography.hero, color: colors.text }}>Enter your phone number</Text>
                <Text style={{ ...typography.body, color: colors.textSecondary }}>
                  We’ll send you a text with a verification code. Standard tariff may apply.
                </Text>
              </View>
            </View>

            <View style={{ gap: 9 }}>
              <View
                style={{
                  height: 64,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Select country. Current selection ${country.name} ${country.callingCode}`}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsCountryPickerOpen(true);
                  }}
                  style={{ height: '100%', minWidth: 122, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                  <Text style={{ fontSize: fontSizes.size17 }}>{country.flag}</Text>
                  <Text selectable style={{ ...typography.input, fontFamily: fontFamilies.semiBold, color: colors.text }}>{country.callingCode}</Text>
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    style={{
                      width: 8,
                      height: 8,
                      borderRightWidth: 2,
                      borderBottomWidth: 2,
                      borderColor: colors.text,
                      transform: [{ rotate: '45deg' }, { translateY: -2 }],
                    }}
                  />
                </Pressable>
                <View style={{ width: 1, height: '52%', backgroundColor: colors.border }} />
                <TextInput
                  autoCorrect={false}
                  keyboardType="phone-pad"
                  maxLength={country.phoneLength}
                  onChangeText={(text) => {
                    setErrorMessage('');
                    setPhone(text.replace(/\D/g, '').slice(0, country.phoneLength));
                  }}
                  placeholder="Enter Phone Number"
                  placeholderTextColor={colors.placeholder}
                  returnKeyType="done"
                  showSoftInputOnFocus
                  textContentType="telephoneNumber"
                  value={phone}
                  onSubmitEditing={continueToOtp}
                  style={{ flex: 1, alignSelf: 'stretch', paddingHorizontal: 16, paddingVertical: 0, ...typography.input, color: colors.text, fontVariant: ['tabular-nums'] }}
                />
              </View>
              {errorMessage ? (
                <Text selectable accessibilityLiveRegion="polite" style={{ ...typography.caption, color: colors.danger }}>
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          </View>

        </View>
      </ScrollView>
      <View
        style={{
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: process.env.EXPO_OS === 'ios' ? 34 : Math.max(insets.bottom + 14, 30),
          gap: 14,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: fontSizes.size12, lineHeight: 18, textAlign: 'center', color: colors.textSecondary }}>
          By continuing, you agree to our <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>T&amp;C</Text> and{' '}
          <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Privacy</Text> policy
        </Text>
        <PrimaryButton disabled={!isValid} label="Continue" loading={isSending} onPress={() => void continueToOtp()} />
      </View>
      <CountryPickerModal
        onClose={() => setIsCountryPickerOpen(false)}
        onSelect={selectCountry}
        selectedCountry={country}
        visible={isCountryPickerOpen}
      />
    </KeyboardAvoidingView>
  );
}
