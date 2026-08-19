import { Image } from 'expo-image';

type BackIconProps = {
  color?: string;
  size?: number;
};

export function BackIcon({ color = '#171419', size = 18 }: BackIconProps) {
  return (
    <Image
      source={require('../../assets/back.png')}
      contentFit="contain"
      tintColor={color}
      style={{ width: size, height: size }}
    />
  );
}
