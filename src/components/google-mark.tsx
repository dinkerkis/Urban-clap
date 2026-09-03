import { Text } from './app-text';
import { colors, fontFamilies, fontSizes } from '../theme';

export function GoogleMark() {
  return (
    <Text style={{ marginLeft: -2, fontSize: fontSizes.size12, fontFamily: fontFamilies.bold, letterSpacing: -0.3 }}>
      <Text style={{ color: colors.blueTone61 }}>G</Text>
      <Text style={{ color: colors.redTone56 }}>o</Text>
      <Text style={{ color: colors.yellowTone50 }}>o</Text>
      <Text style={{ color: colors.blueTone61 }}>g</Text>
      <Text style={{ color: colors.greenTone43 }}>l</Text>
      <Text style={{ color: colors.redTone56 }}>e</Text>
    </Text>
  );
}
