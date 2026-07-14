import { View } from 'react-native';

import { colors } from '../theme/colors';

export function VerificationMessageIcon() {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Verification code sent by text message" style={{ width: 52, height: 49 }}>
      <View
        style={{
          position: 'absolute',
          right: 4,
          top: 6,
          width: 25,
          height: 40,
          borderWidth: 2,
          borderColor: colors.text,
          borderRadius: 6,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ position: 'absolute', top: 3, left: 8, width: 6, height: 2, borderRadius: 1, backgroundColor: colors.textSecondary }} />
        <View style={{ position: 'absolute', bottom: 3, left: 7, width: 7, height: 2, borderRadius: 1, backgroundColor: colors.textSecondary }} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 3,
          width: 36,
          height: 23,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          borderRadius: 7,
          borderCurve: 'continuous',
          backgroundColor: colors.primary,
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <View key={dot} style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: '#FFFFFF' }} />
        ))}
        <View
          style={{
            position: 'absolute',
            right: 6,
            bottom: -3,
            width: 8,
            height: 8,
            backgroundColor: colors.primary,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}
