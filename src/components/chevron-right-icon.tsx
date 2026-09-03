import { View } from 'react-native';

import { colors } from '../theme';

type ChevronRightIconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

export function ChevronRightIcon({ color = colors.violetTone98_3, size = 8, strokeWidth = 1.4 }: ChevronRightIconProps) {
  return <View style={{ width: size, height: size, borderTopWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }] }} />;
}
