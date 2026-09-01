import type { TextProps } from 'react-native';
import { Text as NativeText } from 'react-native';

import { fontFamilies } from '../theme';

export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: fontFamilies.regular }, style]} />;
}
