import { Image } from 'expo-image';

import { colors } from '../theme';

type SearchIconProps = {
  color?: string;
  size?: number;
};

export function SearchIcon({ color = colors.violetTone42, size = 18 }: SearchIconProps) {
  return <Image source={require('../../assets/search.png')} contentFit="contain" tintColor={color} style={{ width: size, height: size }} />;
}
