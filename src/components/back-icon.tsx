import { colors } from '../theme';
import { Image } from 'expo-image';

type BackIconProps = {
  color?: string;
  size?: number;
};

export function BackIcon({ color = colors.mauveTone9_2, size = 18 }: BackIconProps) {
  return (
    <Image
      source={require('../../assets/back.png')}
      contentFit="contain"
      tintColor={color}
      style={{ width: size, height: size }}
    />
  );
}
