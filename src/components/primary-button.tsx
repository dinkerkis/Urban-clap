import { colors, typography } from '../theme';
import { Pressable, Text } from 'react-native';

import { LoadingDots } from './loading-dots';


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
        <LoadingDots color={colors.white} gap={6} size={5} />
      ) : (
        <Text
          style={{
            ...typography.button,
            color: disabled ? colors.disabledText : colors.white,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
