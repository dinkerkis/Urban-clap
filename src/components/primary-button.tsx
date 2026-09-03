import { colors, typography } from '../theme';
import { Pressable } from 'react-native';
import { Text } from './app-text';

import { LoadingDots } from './loading-dots';


type Props = {
  disabled?: boolean;
  label: string;
  labelFontFamily?: string;
  loading?: boolean;
  minHeight?: number;
  onPress: () => void;
};

export function PrimaryButton({ disabled = false, label, labelFontFamily, loading = false, minHeight = 58, onPress }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight,
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
            fontFamily: labelFontFamily ?? typography.button.fontFamily,
            color: disabled ? colors.disabledText : colors.white,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
