import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Text } from './app-text';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, fontFamilies, fontSizes } from '../theme';
import { BackIcon } from './back-icon';
import type { BannerHeadingColor, PromotionalBannerSlide } from '../services/home-promotional-banner-api';

const AUTO_SCROLL_INTERVAL_MS = 4_500;
const IMAGE_TRANSITION_MS = 950;
const TEXT_IN = FadeInDown.delay(380).duration(520).withInitialValues({
  opacity: 0,
  transform: [{ translateY: 10 }],
});
const TEXT_OUT = FadeOutUp.duration(220);

export const DEFAULT_OFFER_HEADER_COLOR = colors.violetTone65;

type OfferCarouselProps = {
  embeddedOnPurple?: boolean;
  slides: PromotionalBannerSlide[];
};

function headingColor(color?: BannerHeadingColor): string {
  if (color?.type === 'solid') return color.color;
  if (color?.type === 'gradient') return color.gradient.endColor || color.gradient.startColor;
  return colors.white;
}

/** "HAPPY RAKSHA BANDHAN" → small HAPPY + stacked RAKSHA / BANDHAN (reference layout). */
function parseStackedHeading(heading: string): { eyebrow: string; lines: string[] } | null {
  const trimmed = heading.trim();
  if (!trimmed) return null;

  if (trimmed.includes('\n')) {
    const parts = trimmed.split(/\n+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) return { eyebrow: parts[0], lines: parts.slice(1) };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 3 && words[0].toUpperCase() === 'HAPPY') {
    return {
      eyebrow: words[0].toUpperCase(),
      lines: words.slice(1).map((word) => word.toUpperCase()),
    };
  }

  return null;
}

function BannerHeading({
  color,
  heading,
}: {
  color?: BannerHeadingColor;
  heading: string;
}) {
  const stacked = parseStackedHeading(heading);
  const accent = headingColor(color);

  if (!stacked) {
    return (
      <Text selectable style={{ fontSize: fontSizes.size30, lineHeight: 32, fontFamily: fontFamilies.bold, color: accent }}>
        {heading}
      </Text>
    );
  }

  return (
    <View style={{ gap: 2 }}>
      <Text
        selectable
        style={{
          fontFamily: fontFamilies.bold,
          fontSize: fontSizes.size12,
          lineHeight: 16,
          letterSpacing: 2.4,
          color: accent,
        }}
      >
        {stacked.eyebrow}
      </Text>
      <View style={{ marginTop: 2 }}>
        {stacked.lines.map((line) => (
          <Text
            key={line}
            selectable
            style={{
              fontFamily: fontFamilies.bold,
              fontSize: fontSizes.size34 - 2,
              lineHeight: 34,
              letterSpacing: 0.4,
              color: accent,
            }}
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

function BannerImage({ uri, height }: { height: number; uri: string }) {
  return (
    <Image
      source={{ uri }}
      contentFit="contain"
      contentPosition="right center"
      style={{ width: '100%', height }}
    />
  );
}

function ActionArrow({ color }: { color: string }) {
  const prefersReducedMotion = useReducedMotion();
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    translateX.set(
      withDelay(
        1_000,
        withSequence(
          withTiming(7, { duration: 450, easing: Easing.bezier(0.77, 0, 0.175, 1) }),
          withTiming(0, { duration: 500, easing: Easing.bezier(0.23, 1, 0.32, 1) }),
        ),
      ),
    );

    return () => cancelAnimation(translateX);
  }, [prefersReducedMotion, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }, { rotate: '180deg' }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <BackIcon color={color} size={14} />
    </Animated.View>
  );
}

export function OfferCarousel({ embeddedOnPurple = false, slides }: OfferCarouselProps) {
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [baseIndex, setBaseIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [bannerWidth, setBannerWidth] = useState(0);
  const slideIn = useSharedValue(0);
  const touchStartX = useRef(0);

  const finishTransition = (index: number) => {
    activeIndexRef.current = index;
    setBaseIndex(index);
    setActiveIndex(index);
    setIncomingIndex(null);
    slideIn.value = 0;
    isAnimatingRef.current = false;
  };

  const goTo = (index: number) => {
    if (!slides.length || isAnimatingRef.current || bannerWidth <= 0) return;
    const current = activeIndexRef.current;
    const length = slides.length;
    const normalized = ((index % length) + length) % length;
    if (normalized === current) return;

    const isForward = !(
      index < 0 ||
      index === current - 1 ||
      (index >= 0 && index < length && index < current)
    );

    isAnimatingRef.current = true;
    setActiveIndex(normalized);
    // Same full-bleed layout as the first image; new slide opens from the right over it
    slideIn.value = isForward ? bannerWidth : -bannerWidth;
    setIncomingIndex(normalized);
  };

  useEffect(() => {
    if (incomingIndex == null || bannerWidth <= 0) return;

    slideIn.value = withTiming(0, { duration: IMAGE_TRANSITION_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(finishTransition)(incomingIndex);
    });
  }, [incomingIndex, bannerWidth, slideIn]);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setBaseIndex(0);
    setIncomingIndex(null);
    slideIn.value = 0;
    isAnimatingRef.current = false;
  }, [slides, slideIn]);

  useEffect(() => {
    if (bannerWidth <= 0 || slides.length <= 1) return;

    const timer = setInterval(() => {
      if (isAnimatingRef.current) return;
      goTo(activeIndexRef.current + 1);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bannerWidth, slides.length]);

  const handleBannerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== bannerWidth) setBannerWidth(nextWidth);
  };

  const incomingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideIn.value }],
  }));

  if (!slides.length) return null;

  const activeSlide = slides[activeIndex] ?? slides[0];
  const baseSlide = slides[baseIndex] ?? slides[0];
  const incomingSlide = incomingIndex != null ? slides[incomingIndex] : null;
  const actionLabel = activeSlide.actionText;

  const bannerHeight = embeddedOnPurple ? 160 : 140;

  return (
    <View style={{ marginHorizontal: embeddedOnPurple ? -20 : 0, gap: embeddedOnPurple ? 0 : 10 }}>
      <View
        onLayout={handleBannerLayout}
        style={{
          minHeight: bannerHeight,
          overflow: 'hidden',
          borderRadius: embeddedOnPurple ? 0 : 24,
          borderCurve: 'continuous',
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.nativeEvent.pageX;
        }}
        onTouchEnd={(event) => {
          if (slides.length <= 1 || isAnimatingRef.current) return;
          const deltaX = event.nativeEvent.pageX - touchStartX.current;
          if (Math.abs(deltaX) < 40) return;
          goTo(activeIndexRef.current + (deltaX < 0 ? 1 : -1));
        }}
      >
        {/* While next image slides in, old image hides instantly so it never shows underneath */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bannerHeight, opacity: incomingSlide ? 0 : 1 }}>
          <BannerImage uri={baseSlide.imageUrl} height={bannerHeight} />
        </View>
        {incomingSlide ? (
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: bannerHeight }, incomingStyle]}
          >
            <BannerImage uri={incomingSlide.imageUrl} height={bannerHeight} />
          </Animated.View>
        ) : null}

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 18,
            top: 17,
            bottom: 17,
            width: '58%',
            overflow: 'hidden',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            key={`copy-${activeIndex}`}
            entering={TEXT_IN}
            exiting={TEXT_OUT}
            style={{ position: 'absolute', left: 0, right: 0, gap: 4 }}
          >
            <BannerHeading heading={activeSlide.mainHeading} color={activeSlide.mainHeadingColor} />
            {activeSlide.label ? (
              <Text style={{ fontSize: fontSizes.size13, lineHeight: 18, fontFamily: fontFamilies.semiBold, color: activeSlide.textColor }}>
                {activeSlide.label}
              </Text>
            ) : null}
            {actionLabel ? (
              <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text selectable style={{ fontSize: fontSizes.size15, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: activeSlide.textColor }}>
                  {actionLabel}
                </Text>
                {activeSlide.showActionArrow ? (
                  <ActionArrow key={`action-arrow-${activeIndex}`} color={activeSlide.textColor} />
                ) : null}
              </View>
            ) : null}
          </Animated.View>
        </View>
      </View>

      {slides.length > 1 ? (
        <View
          style={{
            position: embeddedOnPurple ? 'absolute' : 'relative',
            right: embeddedOnPurple ? 18 : undefined,
            bottom: embeddedOnPurple ? 12 : undefined,
            minHeight: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {slides.map((slide, index) => {
            const active = index === activeIndex;
            return (
              <Pressable
                key={`${slide.mainHeading}-dot-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Show offer ${index + 1}`}
                onPress={() => goTo(index)}
                hitSlop={8}
                style={({ pressed }) => ({
                  width: active ? 22 : 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: embeddedOnPurple
                    ? active
                      ? colors.white
                      : colors.whiteAlpha38
                    : active
                      ? colors.violetTone58
                      : colors.violetTone84_2,
                  opacity: pressed ? 0.6 : 1,
                })}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
