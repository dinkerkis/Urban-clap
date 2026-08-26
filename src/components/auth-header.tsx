import { colors } from '../theme';
import { Pressable, View } from 'react-native';

import { BackIcon } from './back-icon';

type Props = { onPress: () => void };

export function AuthHeader({ onPress }: Props) {
  return (
    <View
      style={{
        minHeight: process.env.EXPO_OS === 'ios' ? 116 : 82,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: process.env.EXPO_OS === 'ios' ? 48 : 0,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={onPress}
        style={({ pressed }) => ({
          minWidth: 44,
          minHeight: 44,
          paddingHorizontal: 4,
          alignItems: 'flex-start',
          justifyContent: 'center',
          borderRadius: 22,
          borderCurve: 'continuous',
          opacity: pressed ? 0.55 : 1,
        })}
      >
        <BackIcon color={colors.text} />
      </Pressable>
    </View>
  );
}
