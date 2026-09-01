import { colors, fontFamilies, fontSizes } from '../../theme';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/app-text';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LoadingDots } from '../../components/loading-dots';
import { fetchCurrentLocation, formatLocationDisplay, type LocationDisplay } from '../../hooks/use-current-location';
import { saveCurrentLocationAddress } from '../../hooks/use-save-current-location-address';

const FETCH_PIN = colors.blueTone43;
const CONFIRM_GREEN = colors.greenTone36;
const MIN_FETCH_MS = 1_400;
const DOTS_MS = 800;
const CONFIRM_MS = 1_800;

type Phase = 'dots' | 'fetching' | 'confirming';

type LocationBootstrapScreenProps = {
  authToken?: string;
  onComplete: () => void;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function PulseRing({ delay, progress }: { delay: number; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.26 * (1 - progress.value),
    transform: [{ scale: 0.22 + progress.value * 1.15 }],
  }));

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 1_800, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.blueTone43Alpha12,
        },
        style,
      ]}
    />
  );
}

function FetchingPin() {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);

  return (
    <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
      <PulseRing delay={0} progress={ring1} />
      <PulseRing delay={600} progress={ring2} />
      <PulseRing delay={1_200} progress={ring3} />
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 11,
            backgroundColor: FETCH_PIN,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white }} />
        </View>
        <View style={{ width: 2.5, height: 11, marginTop: 1, borderRadius: 1, backgroundColor: FETCH_PIN }} />
      </View>
    </View>
  );
}

function ConfirmPin() {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 22,
          height: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 11,
          backgroundColor: CONFIRM_GREEN,
        }}
      >
        <View
          style={{
            width: 8,
            height: 4.5,
            marginTop: -1,
            borderLeftWidth: 1.8,
            borderBottomWidth: 1.8,
            borderColor: colors.white,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
      <View style={{ width: 2, height: 10, marginTop: 2, borderRadius: 1, backgroundColor: CONFIRM_GREEN }} />
    </View>
  );
}

export function LocationBootstrapScreen({ authToken, onComplete }: LocationBootstrapScreenProps) {
  const [phase, setPhase] = useState<Phase>('dots');
  const [display, setDisplay] = useState<LocationDisplay | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const locationPromise = fetchCurrentLocation();

      await wait(DOTS_MS);
      if (cancelled) return;

      setPhase('fetching');
      const fetchStartedAt = Date.now();
      const snapshot = await locationPromise;
      const remaining = Math.max(0, MIN_FETCH_MS - (Date.now() - fetchStartedAt));
      await wait(remaining);
      if (cancelled) return;

      const savePromise = saveCurrentLocationAddress(authToken, snapshot);

      if (snapshot.status === 'ready') {
        setDisplay(formatLocationDisplay(snapshot.geocodedAddress, snapshot.label));
        setPhase('confirming');
        await Promise.all([wait(CONFIRM_MS), savePromise]);
      } else {
        await savePromise;
      }

      if (!cancelled) onCompleteRef.current();
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  return (
    <View
      accessibilityLabel={
        phase === 'dots'
          ? 'Loading'
          : phase === 'fetching'
            ? 'Fetching your location'
            : `Delivering service at ${display?.title ?? 'your area'}`
      }
      accessibilityRole="progressbar"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}
    >
      {phase === 'fetching' ? (
        <Animated.View
          key="fetching"
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(160)}
          style={{ alignItems: 'center', transform: [{ translateY: -36 }] }}
        >
          <FetchingPin />
          <Text style={{ marginTop: 2, fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.regular, color: colors.neutralTone18 }}>
            Fetching your location...
          </Text>
        </Animated.View>
      ) : null}

      {phase === 'dots' ? (
        <Animated.View
          key="dots"
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <LoadingDots />
        </Animated.View>
      ) : null}

      {phase === 'confirming' && display ? (
        <Animated.View
          key="confirming"
          entering={FadeIn.duration(320)}
          exiting={FadeOut.duration(180)}
          style={{ alignItems: 'center', paddingHorizontal: 36, transform: [{ translateY: -20 }] }}
        >
          <ConfirmPin />
          <Text style={{ marginTop: 14, fontSize: fontSizes.size13, lineHeight: 18, fontFamily: fontFamilies.regular, color: CONFIRM_GREEN }}>
            Delivering service at
          </Text>
          <Text
            selectable
            style={{ marginTop: 6, fontSize: fontSizes.size22, lineHeight: 28, fontFamily: fontFamilies.bold, color: colors.neutralTone7, textAlign: 'center' }}
          >
            {display.title}
          </Text>
          {display.subtitle ? (
            <Text
              selectable
              style={{
                marginTop: 8,
                maxWidth: 300,
                fontSize: fontSizes.size14,
                lineHeight: 20,
                fontFamily: fontFamilies.regular,
                color: colors.neutralTone16,
                textAlign: 'center',
              }}
            >
              {display.subtitle}
            </Text>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}
