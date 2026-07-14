import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { OTP_LENGTH } from '../config/auth';
import { colors } from '../theme/colors';

type Props = {
  error: boolean;
  onChange: (value: string) => void;
  value: string;
};

export function OtpInput({ error, onChange, value }: Props) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      accessibilityLabel="Enter six digit verification code"
      onPress={() => inputRef.current?.focus()}
      style={{ position: 'relative' }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const active = index === value.length && value.length < OTP_LENGTH;
          return (
            <View
              key={index}
              style={{
                flex: 1,
                aspectRatio: 0.86,
                maxHeight: 70,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: active || error ? 1.5 : 1,
                borderColor: error ? colors.danger : active ? colors.primary : colors.border,
                borderRadius: 11,
                borderCurve: 'continuous',
                backgroundColor: error ? colors.dangerSoft : colors.surface,
              }}
            >
              <Text style={{ fontSize: 20, color: colors.text, fontVariant: ['tabular-nums'] }}>
                {value[index] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        autoFocus
        caretHidden
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        textContentType="oneTimeCode"
        value={value}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01 }}
      />
    </Pressable>
  );
}
