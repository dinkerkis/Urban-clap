import { View } from 'react-native';

import { colors } from '../theme';

type TargetIconProps = {
  color?: string;
  size?: number;
};

export function TargetIcon({ color = colors.violetTone58, size = 22 }: TargetIconProps) {
  const ringSize = size - 4;
  const strokeWidth = size * 0.073;
  const markerLength = size * 0.18;
  const dotSize = size * 0.32;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderWidth: strokeWidth, borderColor: color }} />
      <View style={{ position: 'absolute', width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }} />
      <View style={{ position: 'absolute', top: 0, width: strokeWidth, height: markerLength, backgroundColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, width: strokeWidth, height: markerLength, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 0, width: markerLength, height: strokeWidth, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 0, width: markerLength, height: strokeWidth, backgroundColor: color }} />
    </View>
  );
}
