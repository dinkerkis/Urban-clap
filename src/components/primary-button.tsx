import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function PrimaryButton({ disabled = false, label, loading = false, onPress }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderCurve: 'continuous',
        backgroundColor: isDisabled
          ? colors.disabled
          : pressed
            ? colors.primaryPressed
            : colors.primary,
      })}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          style={{
            ...typography.button,
            color: disabled ? colors.disabledText : '#FFFFFF',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
