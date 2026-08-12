import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const splashColor = '#6E45E2';

export function CustomSplashScreen() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.95);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    const timing = { duration: 400, easing: Easing.out(Easing.cubic) };
    logoOpacity.value = withTiming(1, timing);
    logoScale.value = withTiming(1, timing);
    textOpacity.value = withDelay(220, withTiming(1, { duration: 360, easing: Easing.out(Easing.quad) }));
  }, [logoOpacity, logoScale, textOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

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
        style={{ position: 'absolute', bottom: -90, left: -70, width: 226, height: 226, borderRadius: 113, backgroundColor: 'rgba(255,255,255,0.04)' }}
      />

      <View style={{ alignItems: 'center', gap: 42, transform: [{ translateY: -35 }] }}>
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 35,
              borderCurve: 'continuous',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 14px 34px rgba(34, 20, 91, 0.26)',
            },
            logoAnimatedStyle,
          ]}
        >
          <Text style={{ color: splashColor, fontSize: 45, lineHeight: 52, fontWeight: '800', letterSpacing: -2.2 }}>UC</Text>
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center', gap: 8 }, textAnimatedStyle]}>
          <Text style={{ color: '#FFFFFF', fontSize: 44, lineHeight: 52, fontWeight: '800', letterSpacing: -1 }}>Urban Clap</Text>
          <Text style={{ color: 'rgba(255,255,255,0.76)', fontSize: 18, lineHeight: 25, fontWeight: '400', letterSpacing: 0.1 }}>
            Trusted services at your doorstep
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
