import { colors } from '../theme';
import { Image } from 'expo-image';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export const CLOSE_BUTTON_SIZE = 32;
export const CLOSE_BUTTON_INSET = 14;
export const CLOSE_BUTTON_GAP = 12;
export const CLOSE_BUTTON_ABOVE_OFFSET = -(CLOSE_BUTTON_SIZE + CLOSE_BUTTON_GAP);

type CloseIconProps = {
  color?: string;
  size?: number;
};

export function CloseIcon({ color = colors.mauveTone9_2, size = 20 }: CloseIconProps) {
  return (
    <Image
      source={require('../../assets/close.png')}
      contentFit="contain"
      tintColor={color}
      style={{ width: size, height: size }}
    />
  );
}

type CloseButtonProps = {
  accessibilityLabel?: string;
  color?: string;
  floating?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CloseButton({
  accessibilityLabel = 'Close',
  color,
  floating = false,
  onPress,
  style,
}: CloseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: CLOSE_BUTTON_SIZE,
          height: CLOSE_BUTTON_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: CLOSE_BUTTON_SIZE / 2,
          backgroundColor: colors.white,
          opacity: pressed ? 0.7 : 1,
          ...(floating
            ? { alignSelf: 'flex-end' as const, marginRight: CLOSE_BUTTON_INSET, marginBottom: CLOSE_BUTTON_GAP }
            : null),
        },
        style,
      ]}
    >
      <CloseIcon color={color} />
    </Pressable>
  );
}
