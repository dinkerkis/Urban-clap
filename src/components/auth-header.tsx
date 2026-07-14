import { Pressable, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = { onPress: () => void };

export function AuthHeader({ onPress }: Props) {
  return (
    <View
      style={{
        minHeight: process.env.EXPO_OS === 'ios' ? 116 : 82,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 12,
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
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 22,
          borderCurve: 'continuous',
          opacity: pressed ? 0.55 : 1,
        })}
      >
        <Text style={{ fontSize: 30, lineHeight: 34, color: colors.text }}>‹</Text>
      </Pressable>
    </View>
  );
}
