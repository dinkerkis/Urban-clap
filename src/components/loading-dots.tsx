import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function LoadingDots() {
  const d1 = useSharedValue(0.25);
  const d2 = useSharedValue(0.25);
  const d3 = useSharedValue(0.25);

  useEffect(() => {
    const pulse = (value: SharedValue<number>, delay: number) => {
      value.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
            withTiming(0.22, { duration: 280, easing: Easing.in(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    };

    pulse(d1, 0);
    pulse(d2, 140);
    pulse(d3, 280);
  }, [d1, d2, d3]);

  const s1 = useAnimatedStyle(() => ({ opacity: d1.value, transform: [{ scale: 0.82 + d1.value * 0.18 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: d2.value, transform: [{ scale: 0.82 + d2.value * 0.18 }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: d3.value, transform: [{ scale: 0.82 + d3.value * 0.18 }] }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <Animated.View style={[{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#6E45E2' }, s1]} />
      <Animated.View style={[{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#6E45E2' }, s2]} />
      <Animated.View style={[{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#6E45E2' }, s3]} />
    </View>
  );
}
