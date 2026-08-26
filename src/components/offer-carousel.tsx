import { colors, fontSizes } from '../theme';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

const AUTO_SCROLL_INTERVAL_MS = 4_000;

const offers = [
  {
    id: 'salon',
    eyebrow: 'SALON AT HOME',
    title: 'Get additional 25% off on your first booking',
    subtitle: 'Book now  →',
    image: require('../../assets/offer-salon-transparent.png'),
    headerColor: colors.violetTone65,
    titleColor: colors.white,
    eyebrowColor: colors.white,
    subtitleColor: colors.whiteAlpha88,
  },
  {
    id: 'ac-care',
    eyebrow: 'AC SERVICE',
    title: '25% off on your first AC servicing',
    subtitle: 'Get up to ₹100 off',
    image: require('../../assets/offer-ac-service-transparent.png'),
    headerColor: colors.cyanTone46,
    titleColor: colors.white,
    eyebrowColor: colors.white,
    subtitleColor: colors.whiteAlpha88,
  },
  {
    id: 'water-care',
    eyebrow: 'SMART WATER CARE',
    title: 'Pure water, made effortless',
    subtitle: 'Explore smart purification  →',
    image: require('../../assets/offer-water-purifier-transparent.png'),
    headerColor: colors.blueTone5,
    titleColor: colors.white,
    eyebrowColor: colors.blueTone76,
    subtitleColor: colors.whiteAlpha82,
  },
];

export const DEFAULT_OFFER_HEADER_COLOR = offers[0].headerColor;

type OfferCarouselProps = {
  embeddedOnPurple?: boolean;
  onHeaderColorChange?: (color: string) => void;
};

export function OfferCarousel({ embeddedOnPurple = false, onHeaderColorChange }: OfferCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const selectPage = (index: number, animated = true) => {
    if (!pageWidth) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
    onHeaderColorChange?.(offers[index].headerColor);
    scrollRef.current?.scrollTo({ x: pageWidth * index, animated });
  };

  useEffect(() => {
    if (!pageWidth) return;

    const timer = setInterval(() => {
      if (isDraggingRef.current) return;
      const nextIndex = (activeIndexRef.current + 1) % offers.length;
      selectPage(nextIndex);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [pageWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== pageWidth) {
      setPageWidth(nextWidth);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ x: nextWidth * activeIndexRef.current, animated: false }));
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const nextIndex = Math.max(0, Math.min(offers.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    onHeaderColorChange?.(offers[nextIndex].headerColor);
    isDraggingRef.current = false;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const visibleIndex = Math.max(0, Math.min(offers.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
    if (visibleIndex === activeIndexRef.current) return;
    activeIndexRef.current = visibleIndex;
    setActiveIndex(visibleIndex);
    onHeaderColorChange?.(offers[visibleIndex].headerColor);
  };

  return (
    <View onLayout={handleLayout} style={{ marginHorizontal: embeddedOnPurple ? -20 : 0, gap: embeddedOnPurple ? 0 : 10 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          isDraggingRef.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={handleScroll}
        onScrollEndDrag={(event) => {
          if (event.nativeEvent.velocity?.x === 0) handleScrollEnd(event);
        }}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel="Promotional offers"
      >
        {offers.map((offer) => (
          <View key={offer.id} style={{ width: pageWidth || undefined }}>
            <View
              style={{
                minHeight: embeddedOnPurple ? 162 : 142,
                overflow: 'hidden',
                paddingHorizontal: 18,
                paddingVertical: 17,
                borderRadius: embeddedOnPurple ? 0 : 24,
                borderCurve: 'continuous',
                backgroundColor: colors.transparent,
              }}
            >
              <Image source={offer.image} contentFit="contain" contentPosition="right center" style={{ position: 'absolute', inset: 0 }} />
              <View style={{ width: '54%', minHeight: 128, justifyContent: 'center', gap: 7 }}>
                <Text style={{ fontSize: fontSizes.size10, lineHeight: 13, fontWeight: '600', letterSpacing: 0.8, color: offer.eyebrowColor }}>{offer.eyebrow}</Text>
                <Text selectable style={{ fontSize: fontSizes.size19, lineHeight: 24, fontWeight: '600', color: offer.titleColor }}>{offer.title}</Text>
                <Text selectable style={{ fontSize: fontSizes.size11, lineHeight: 16, fontWeight: '600', color: offer.subtitleColor }}>{offer.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: embeddedOnPurple ? 'absolute' : 'relative', right: embeddedOnPurple ? 18 : undefined, bottom: embeddedOnPurple ? 12 : undefined, minHeight: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {offers.map((offer, index) => {
          const active = index === activeIndex;
          return (
            <Pressable
              key={offer.id}
              accessibilityRole="button"
              accessibilityLabel={`Show offer ${index + 1}`}
              onPress={() => selectPage(index)}
              hitSlop={8}
              style={({ pressed }) => ({
                width: active ? 22 : 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: embeddedOnPurple
                  ? active ? colors.white : colors.whiteAlpha38
                  : active ? colors.violetTone58 : colors.violetTone84_2,
                opacity: pressed ? 0.6 : 1,
              })}
            />
          );
        })}
      </View>
    </View>
  );
}
