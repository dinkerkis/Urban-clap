import { forwardRef, type ComponentRef } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput as NativeTextInput } from 'react-native';

import { fontFamilies } from '../theme';

export type TextInput = ComponentRef<typeof NativeTextInput>;

export const TextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput({ style, ...props }, ref) {
  return <NativeTextInput ref={ref} {...props} style={[{ fontFamily: fontFamilies.regular }, style]} />;
});
