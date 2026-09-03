import { colors } from '../theme';
import { View } from 'react-native';


export function VerificationMessageIcon() {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Verification code sent by text message" style={{ width: 47, height: 44 }}>
      <View
        style={{
          position: 'absolute',
          right: 3,
          top: 5,
          width: 23,
          height: 36,
          borderWidth: 2,
          borderColor: colors.text,
          borderRadius: 6,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ position: 'absolute', top: 3, left: 8, width: 5, height: 2, borderRadius: 1, backgroundColor: colors.textSecondary }} />
        <View style={{ position: 'absolute', bottom: 3, left: 7, width: 6, height: 2, borderRadius: 1, backgroundColor: colors.textSecondary }} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 2,
          width: 33,
          height: 21,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          borderRadius: 6,
          borderCurve: 'continuous',
          backgroundColor: colors.primary,
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <View key={dot} style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: colors.white }} />
        ))}
        <View
          style={{
            position: 'absolute',
            right: 5,
            bottom: -3,
            width: 7,
            height: 7,
            backgroundColor: colors.primary,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}
