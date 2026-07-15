import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

const AUTO_SCROLL_INTERVAL_MS = 4_000;

const offers = [
  {
    id: 'welcome',
    eyebrow: 'NEW USER OFFER',
    title: 'Get 20% off your first service',
    subtitle: 'Use code WELCOME20 at checkout',
    icon: '✨',
    background: '#18141F',
    accent: '#8A66EF',
    titleColor: '#FFFFFF',
    eyebrowColor: '#C5B4FF',
    subtitleColor: '#C5C0CB',
    bubbleColor: '#2F2740',
  },
  {
    id: 'ac-care',
    eyebrow: 'SUMMER READY',
    title: 'Power jet AC service from ₹599',
    subtitle: 'Deep cleaning for stronger cooling',
    icon: '❄️',
    background: '#DCEEFF',
    accent: '#3A78D4',
    titleColor: '#173457',
    eyebrowColor: '#34679F',
    subtitleColor: '#53708F',
    bubbleColor: '#C5E2FF',
  },
  {
    id: 'home-care',
    eyebrow: 'COMPLETE HOME CARE',
    title: 'Refresh every corner of your home',
    subtitle: 'Cleaning packages starting at ₹449',
    icon: '🏠',
    background: '#E5F6EC',
    accent: '#2D8A61',
    titleColor: '#183E2D',
    eyebrowColor: '#36795A',
    subtitleColor: '#527160',
    bubbleColor: '#CDECD9',
  },
];

export function OfferCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const selectPage = (index: number, animated = true) => {
    if (!pageWidth) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
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
    isDraggingRef.current = false;
  };

  return (
    <View onLayout={handleLayout} style={{ gap: 10 }}>
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
                minHeight: 142,
                overflow: 'hidden',
                padding: 20,
                gap: 6,
                borderRadius: 24,
                borderCurve: 'continuous',
                backgroundColor: offer.background,
              }}
            >
              <View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -30, top: -40, backgroundColor: offer.bubbleColor }} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 4, gap: 6 }}>
                  <Text style={{ fontSize: 9, lineHeight: 13, fontWeight: '800', letterSpacing: 1.2, color: offer.eyebrowColor }}>{offer.eyebrow}</Text>
                  <Text selectable style={{ fontSize: 23, lineHeight: 28, fontWeight: '800', color: offer.titleColor }}>{offer.title}</Text>
                  <Text selectable style={{ fontSize: 11, lineHeight: 16, color: offer.subtitleColor }}>{offer.subtitle}</Text>
                </View>
                <View style={{ width: '22%', minWidth: 58, maxWidth: 76, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: offer.accent }}>
                    <Text style={{ fontSize: 25 }}>{offer.icon}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ minHeight: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
                backgroundColor: active ? '#6E45E2' : '#D6D1DC',
                opacity: pressed ? 0.6 : 1,
              })}
            />
          );
        })}
      </View>
    </View>
  );
}
