import { Text, View } from 'react-native';

const splashColor = '#6E45E2';

export function CustomSplashScreen() {
  return (
    <View
      accessibilityLabel="Urban Clap is loading"
      accessibilityRole="progressbar"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: splashColor }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', top: -110, right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.08)' }}
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', bottom: -130, left: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,255,255,0.06)' }}
      />

      <View style={{ alignItems: 'center', gap: 22 }}>
        <View
          style={{
            width: 102,
            height: 102,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
            borderCurve: 'continuous',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 14px 34px rgba(34, 20, 91, 0.26)',
          }}
        >
          <Text style={{ color: splashColor, fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -2 }}>UC</Text>
        </View>

        <View style={{ alignItems: 'center', gap: 7 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.8 }}>Urban Clap</Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.2 }}>
            Trusted services at your doorstep
          </Text>
        </View>
      </View>
    </View>
  );
}
