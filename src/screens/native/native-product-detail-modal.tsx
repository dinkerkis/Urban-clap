import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Text } from '../../components/app-text';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseButton, CLOSE_BUTTON_GAP, CLOSE_BUTTON_INSET, CLOSE_BUTTON_SIZE } from '../../components/close-icon';
import { useNativeProductDetail } from '../../hooks/use-native-product-detail';
import { DottedUnderline } from '../../components/dotted-underline';
import { LoadingDots } from '../../components/loading-dots';
import type { ServiceItem } from '../../data/service-catalog';
import { resolveNativeMediaUrl, type NativeProductMediaItem, type NativeProductOption } from '../../services/native-products-api';

type NativeProductDetailModalProps = {
  onAddToCart: (selections: NativeCartSelection[]) => Promise<boolean>;
  onClose: () => void;
  productId?: string;
};

export type NativeCartSelection = {
  item: ServiceItem;
  quantity: number;
};

const HERO_HEIGHT = 360;
const IMAGE_SLIDE_MS = 4_000;
const VIDEO_LOOP_HEAD_SECONDS = 0.08;
const VIDEO_LOOP_TAIL_SECONDS = 0.4;
const OPTION_ACTION_HEIGHT = 34;
const EXCHANGE_GREEN = colors.greenTone33;
const NATIVE_SECTION_COLOR = colors.violetTone98_3;
const NATIVE_PRODUCT_BACKGROUND = colors.neutralTone96;
const EXCHANGE_STEPS = [
  { textBefore: 'Select ', bold: '“With exchange”', textAfter: ' during checkout to avail up to ₹800 off.' },
  { textBefore: 'When the technician comes to install your Native RO, they’ll inspect your old unit.', bold: '', textAfter: '' },
  { textBefore: 'If it passes the check, we’ll uninstall & pick it up, and the exchange is final.', bold: '', textAfter: '' },
] as const;

const EXCHANGE_ELIGIBILITY = [
  { title: 'All brand models', subtitle: 'We accept RO of any manufacturer' },
  { title: 'Working condition', subtitle: 'Ensure the product is in working condition to qualify for the full discount amount' },
] as const;

function ExchangeIcon({ size = 22 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size, lineHeight: size + 2, fontFamily: fontFamilies.bold, color: EXCHANGE_GREEN }}>⇄</Text>
  );
}

function GreenCheck() {
  return (
    <View style={{ width: 26, height: 26, marginTop: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: EXCHANGE_GREEN }}>
      <Text style={{ marginTop: -1, fontSize: fontSizes.size17, fontFamily: fontFamilies.bold, color: colors.white }}>✓</Text>
    </View>
  );
}

function HowExchangeRow({ onPress }: { onPress: () => void }) {
  return (
    <View>
      <View style={{ height: 8, backgroundColor: NATIVE_SECTION_COLOR }} />
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          paddingHorizontal: 20,
          paddingVertical: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: pressed ? colors.violetTone97_3 : colors.white,
        })}
      >
        <ExchangeIcon size={28} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text selectable style={{ fontSize: fontSizes.size17, lineHeight: 23, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>How exchange works</Text>
          <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone38_2 }}>See eligibility & process</Text>
        </View>
        <Text style={{ fontSize: fontSizes.size28, lineHeight: 30, fontFamily: fontFamilies.light, color: colors.mauveTone9_2 }}>›</Text>
      </Pressable>
      <View style={{ height: 8, backgroundColor: NATIVE_SECTION_COLOR }} />
    </View>
  );
}

function ExchangeInfoModal({ visible, onClose }: { onClose: () => void; visible: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" statusBarTranslucent transparent visible={visible}>
      <View style={{ flex: 1, backgroundColor: colors.blackAlpha78 }}>
        <CloseButton
          accessibilityLabel="Close exchange info"
          onPress={onClose}
          style={{ position: 'absolute', zIndex: 2, top: insets.top + 10, right: CLOSE_BUTTON_INSET }}
        />

        <View
          style={{
            flex: 1,
            marginTop: insets.top + 10 + CLOSE_BUTTON_SIZE + CLOSE_BUTTON_GAP,
            overflow: 'hidden',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderCurve: 'continuous',
            backgroundColor: colors.white,
          }}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 22, paddingBottom: Math.max(insets.bottom, 16) + 12, gap: 22 }}
          >
            <View style={{ paddingHorizontal: 20, gap: 14 }}>
              <ExchangeIcon size={32} />
              <Text selectable style={{ fontSize: fontSizes.size28, lineHeight: 36, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>
                Exchange your old RO & get up to <Text style={{ color: EXCHANGE_GREEN }}>₹800 off</Text>
              </Text>
            </View>

            <View style={{ height: 8, backgroundColor: NATIVE_SECTION_COLOR }} />

            <View style={{ paddingHorizontal: 20, gap: 16 }}>
              <Text selectable style={{ fontSize: fontSizes.size22, lineHeight: 28, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>Exchange eligibility</Text>
              {EXCHANGE_ELIGIBILITY.map((item) => (
                <View key={item.title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <GreenCheck />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text selectable style={{ fontSize: fontSizes.size19, lineHeight: 25, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>{item.title}</Text>
                    <Text selectable style={{ fontSize: fontSizes.size16, lineHeight: 22, color: colors.mauveTone38_2 }}>{item.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 8, backgroundColor: NATIVE_SECTION_COLOR }} />

            <View style={{ paddingHorizontal: 20, gap: 16 }}>
              <Text selectable style={{ fontSize: fontSizes.size22, lineHeight: 28, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>Here’s how it works</Text>
              <View>
                {EXCHANGE_STEPS.map((step, index) => {
                  const isLast = index === EXCHANGE_STEPS.length - 1;
                  return (
                    <View key={`step-${index + 1}`} style={{ flexDirection: 'row', alignItems: 'stretch', gap: 14 }}>
                      <View style={{ width: 28, alignItems: 'center' }}>
                        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.mauveTone9_2 }}>
                          <Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: colors.white }}>{index + 1}</Text>
                        </View>
                        {!isLast ? <View style={{ flex: 1, width: 2, marginVertical: 4, backgroundColor: NATIVE_SECTION_COLOR }} /> : null}
                      </View>
                      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                        <Text selectable style={{ fontSize: fontSizes.size17, lineHeight: 24, color: colors.mauveTone24_2 }}>
                          {step.textBefore}
                          {step.bold ? <Text style={{ fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>{step.bold}</Text> : null}
                          {step.textAfter}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function formatCount(count = 0): string {
  if (count >= 1_000_000) return `${Math.round(count / 100_000) / 10}M`;
  if (count >= 1_000) return `${Math.round(count / 100) / 10}K`;
  return String(count);
}

function OptionAction({
  quantity,
  onAdd,
  onRemove,
}: {
  onAdd: () => void;
  onRemove: () => void;
  quantity: number;
}) {
  if (quantity <= 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add option"
        onPress={onAdd}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          minWidth: 78,
          height: OPTION_ACTION_HEIGHT,
          paddingHorizontal: 18,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          borderCurve: 'continuous',
          borderWidth: 0.9,
          borderColor: colors.mauveTone88_3,
          backgroundColor: pressed ? colors.violetTone97_3 : colors.white,
        })}
      >
        <Text style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>Add</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        width: 78,
        height: OPTION_ACTION_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: colors.violetTone58,
        borderRadius: 8,
        borderCurve: 'continuous',
        backgroundColor: colors.white,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={onRemove}
        style={({ pressed }) => ({ width: 26, height: OPTION_ACTION_HEIGHT, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
      >
        <Text style={{ fontSize: fontSizes.size18, lineHeight: 20, color: colors.violetTone58 }}>−</Text>
      </Pressable>
      <Text style={{ flex: 1, textAlign: 'center', fontSize: fontSizes.size14, fontFamily: fontFamilies.bold, color: colors.violetTone58, fontVariant: ['tabular-nums'] }}>{quantity}</Text>
      <View
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: true }}
        style={{ width: 26, height: OPTION_ACTION_HEIGHT, alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}
      >
        <Text style={{ fontSize: fontSizes.size18, lineHeight: 20, color: colors.violetTone58 }}>+</Text>
      </View>
    </View>
  );
}

function OptionCard({
  option,
  quantity,
  onAdd,
  onRemove,
}: {
  onAdd: () => void;
  onRemove: () => void;
  option: NativeProductOption;
  quantity: number;
}) {
  return (
    <View style={{ width: 156, overflow: 'hidden', borderWidth: 1, borderColor: colors.mauveTone88_3, borderRadius: 10, borderCurve: 'continuous', backgroundColor: colors.white }}>
      {option.image ? (
        <View style={{ height: 145, alignItems: 'center', justifyContent: 'center', backgroundColor: NATIVE_PRODUCT_BACKGROUND }}>
          <Image source={{ uri: resolveNativeMediaUrl(option.image) }} contentFit="contain" transition={180} style={{ width: '100%', height: '100%' }} />
        </View>
      ) : null}
      <View style={{ padding: 12, gap: 5 }}>
        <Text selectable numberOfLines={2} style={{ fontSize: fontSizes.size14, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>{option.label}</Text>
        {option.rating ? <Text selectable style={{ fontSize: fontSizes.size12, color: colors.mauveTone39 }}>★ {option.rating.average ?? 0} ({formatCount(option.rating.count)} reviews)</Text> : null}
        <Text selectable style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2, fontVariant: ['tabular-nums'] }}>₹{option.price.toLocaleString('en-IN')}</Text>
        <OptionAction quantity={quantity} onAdd={onAdd} onRemove={onRemove} />
      </View>
    </View>
  );
}

function DetailImage({ onPress, path, width }: { onPress?: () => void; path: string; width: number }) {
  const [aspectRatio, setAspectRatio] = useState(1);
  const image = (
    <Image
      source={{ uri: resolveNativeMediaUrl(path) }}
      contentFit="contain"
      transition={180}
      onLoad={(event) => {
        const { height, width: sourceWidth } = event.source;
        if (sourceWidth > 0 && height > 0) setAspectRatio(sourceWidth / height);
      }}
      style={{ width, aspectRatio, backgroundColor: colors.slateTone5 }}
    />
  );
  if (!onPress) return image;
  return <Pressable accessibilityRole="button" accessibilityLabel="Know more about product specifications" onPress={onPress}>{image}</Pressable>;
}

function FullSpecificationsModal({ images, onClose, visible }: { images: { image: string; sort_order: number }[]; onClose: () => void; visible: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" statusBarTranslucent transparent visible={visible}>
      <View style={{ flex: 1, backgroundColor: colors.blackAlpha78 }}>
        <CloseButton
          accessibilityLabel="Close specifications"
          onPress={onClose}
          style={{ position: 'absolute', zIndex: 2, top: insets.top + 10, right: CLOSE_BUTTON_INSET }}
        />
        <View style={{ flex: 1, marginTop: insets.top + 10 + CLOSE_BUTTON_SIZE + CLOSE_BUTTON_GAP, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderCurve: 'continuous', backgroundColor: colors.white }}>
          <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            {[...images].sort((left, right) => left.sort_order - right.sort_order).map((item) => (
              <DetailImage key={`full-spec-${item.sort_order}`} path={item.image} width={width} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProductVideo({
  path,
  height = HERO_HEIGHT,
  isActive = true,
  loop = false,
  nativeControls = false,
  onComplete,
  onProgress,
}: {
  height?: number;
  isActive?: boolean;
  loop?: boolean;
  nativeControls?: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  path: string;
}) {
  const uri = resolveNativeMediaUrl(path);
  const completedRef = useRef(false);
  const loopRestartingRef = useRef(false);
  const player = useVideoPlayer(uri, (nextPlayer) => {
    nextPlayer.loop = false;
    nextPlayer.muted = true;
    nextPlayer.timeUpdateEventInterval = 0.05;
  });

  useEffect(() => {
    player.loop = false;
  }, [player]);

  useEffect(() => {
    completedRef.current = false;
    loopRestartingRef.current = false;
    if (!isActive) {
      player.pause();
      return;
    }
    player.currentTime = 0;
    player.play();
  }, [isActive, player]);

  useEffect(() => {
    if (!onProgress && !onComplete && !loop) return;

    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (!isActive) return;
      const duration = player.duration;
      if (loop && duration > 0) {
        if (currentTime < 0.3) loopRestartingRef.current = false;
        if (!loopRestartingRef.current && currentTime >= duration - VIDEO_LOOP_TAIL_SECONDS) {
          loopRestartingRef.current = true;
          player.currentTime = VIDEO_LOOP_HEAD_SECONDS;
          player.play();
          return;
        }
      }
      if (duration > 0) onProgress?.(Math.min(1, currentTime / duration));
    });

    const endSub = player.addListener('playToEnd', () => {
      if (!isActive || completedRef.current) return;
      if (loop) {
        loopRestartingRef.current = true;
        player.currentTime = VIDEO_LOOP_HEAD_SECONDS;
        player.play();
        return;
      }
      completedRef.current = true;
      onProgress?.(1);
      onComplete?.();
    });

    return () => {
      timeSub.remove();
      endSub.remove();
    };
  }, [isActive, loop, onComplete, onProgress, player]);

  return (
    <VideoView
      player={player}
      contentFit="cover"
      nativeControls={nativeControls}
      style={{ width: '100%', height, backgroundColor: colors.slateTone5 }}
    />
  );
}

function BannerSegments({
  activeIndex,
  count,
  progress,
}: {
  activeIndex: number;
  count: number;
  progress: number;
}) {
  if (count <= 1) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 14,
        flexDirection: 'row',
        gap: 5,
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const fill = index < activeIndex ? 1 : index === activeIndex ? Math.max(0, Math.min(progress, 1)) : 0;
        return (
          <View
            key={`segment-${index}`}
            style={{
              flex: 1,
              height: 4,
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: colors.whiteAlpha35,
            }}
          >
            <View
              style={{
                width: `${fill * 100}%`,
                height: '100%',
                borderRadius: 2,
                backgroundColor: colors.white,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

function BannerCarousel({
  fallbackImage,
  items,
  width,
}: {
  fallbackImage?: string;
  items: NativeProductMediaItem[];
  width: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const slides = useMemo<NativeProductMediaItem[]>(() => {
    if (items.length) return items;
    if (fallbackImage) return [{ type: 'image', sort_order: 0, url: fallbackImage }];
    return [];
  }, [fallbackImage, items]);
  const activeSlide = slides[activeIndex];

  const goToIndex = useCallback(
    (index: number) => {
      if (!slides.length || !width) return;
      const nextIndex = ((index % slides.length) + slides.length) % slides.length;
      setActiveIndex(nextIndex);
      setProgress(0);
      scrollRef.current?.scrollTo({ x: width * nextIndex, animated: true });
    },
    [slides.length, width],
  );

  const handleComplete = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  useEffect(() => {
    setActiveIndex(0);
    setProgress(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [slides]);

  useEffect(() => {
    if (!activeSlide || activeSlide.type !== 'image') return;

    let frameId = 0;
    const startedAt = Date.now();
    const tick = () => {
      const nextProgress = Math.min(1, (Date.now() - startedAt) / IMAGE_SLIDE_MS);
      setProgress(nextProgress);
      if (nextProgress >= 1) {
        handleComplete();
        return;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeIndex, activeSlide, handleComplete]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(nextIndex, slides.length - 1));
    if (clamped === activeIndex) return;
    setActiveIndex(clamped);
    setProgress(0);
  };

  if (!slides.length) {
    return <View style={{ height: HERO_HEIGHT, backgroundColor: colors.slateTone5 }} />;
  }

  return (
    <View style={{ height: HERO_HEIGHT, backgroundColor: colors.slateTone5 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {slides.map((item, index) => (
          <View key={`${item.type}-${item.sort_order}-${index}`} style={{ width, height: HERO_HEIGHT }}>
            {item.type === 'video' ? (
              <ProductVideo
                path={item.url}
                isActive={index === activeIndex}
                onProgress={index === activeIndex ? setProgress : undefined}
                onComplete={index === activeIndex ? handleComplete : undefined}
              />
            ) : (
              <Image
                source={{ uri: resolveNativeMediaUrl(item.url) }}
                contentFit="cover"
                transition={180}
                style={{ width: '100%', height: HERO_HEIGHT }}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <BannerSegments activeIndex={activeIndex} count={slides.length} progress={progress} />
    </View>
  );
}

export function NativeProductDetailModal({ onAddToCart, onClose, productId }: NativeProductDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width } = useWindowDimensions();
  const { data, errorMessage, isLoading, retry } = useNativeProductDetail(productId);
  const [optionQuantities, setOptionQuantities] = useState<Record<number, number>>({});
  const [exchangeInfoVisible, setExchangeInfoVisible] = useState(false);
  const [fullSpecificationsVisible, setFullSpecificationsVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [detailScrollY, setDetailScrollY] = useState(0);
  const [detailVideoLayouts, setDetailVideoLayouts] = useState<Record<number, { height: number; y: number }>>({});
  const contentWidth = width;
  const bannerMedia = data?.banner_gallery ?? [];

  useEffect(() => {
    setOptionQuantities({});
    setExchangeInfoVisible(false);
    setFullSpecificationsVisible(false);
    setIsAddingToCart(false);
    setDetailScrollY(0);
    setDetailVideoLayouts({});
  }, [productId]);

  const selectedSummary = useMemo(() => {
    if (!data?.options.length) return null;
    let quantity = 0;
    let total = 0;
    data.options.forEach((option, index) => {
      const count = optionQuantities[index] ?? 0;
      if (count <= 0) return;
      quantity += count;
      total += option.price * count;
    });
    if (quantity <= 0) return null;
    return { quantity, total };
  }, [data?.options, optionQuantities]);

  const updateQuantity = (index: number, delta: number) => {
    setOptionQuantities((current) => {
      const nextCount = Math.max(0, (current[index] ?? 0) + delta);
      if (nextCount === 0) {
        const { [index]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [index]: nextCount };
    });
  };

  const handleDone = async () => {
    if (!data || !selectedSummary || isAddingToCart) return;
    const selections: NativeCartSelection[] = data.options.flatMap((option, index) => {
      const quantity = optionQuantities[index] ?? 0;
      if (quantity <= 0) return [];
      const variantKey = option.key || option.label;
      const reviewsCount = option.rating?.count ?? data.rating?.count ?? 0;
      return [{
        quantity,
        item: {
          id: `${data._id}::${variantKey}`,
          productId: data._id,
          title: data.product_name,
          description: option.label,
          price: option.price,
          originalPrice: option.price,
          duration: '',
          rating: option.rating?.average ?? data.rating?.average ?? 0,
          reviews: `${formatCount(reviewsCount)} reviews`,
          icon: '',
          tint: colors.violetTone96_5,
          imageUrl: option.image ? resolveNativeMediaUrl(option.image) : data.main_image ? resolveNativeMediaUrl(data.main_image) : undefined,
          selectedVariantLabel: option.label,
          slug: data.slug,
          variantKey,
        },
      }];
    });

    setIsAddingToCart(true);
    const added = await onAddToCart(selections);
    setIsAddingToCart(false);
    if (added) {
      setOptionQuantities({});
      onClose();
    }
  };

  const bottomBarHeight = selectedSummary ? 72 + Math.max(insets.bottom, 10) : 0;
  const detailViewportHeight = Math.max(1, windowHeight - insets.top - 52);
  const isDetailVideoVisible = (sortOrder: number) => {
    const layout = detailVideoLayouts[sortOrder];
    if (!layout) return false;
    const visibleTop = Math.max(layout.y, detailScrollY);
    const visibleBottom = Math.min(layout.y + layout.height, detailScrollY + detailViewportHeight);
    return Math.max(0, visibleBottom - visibleTop) >= layout.height * 0.5;
  };
  const storeDetailVideoLayout = (sortOrder: number, event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    setDetailVideoLayouts((current) => {
      const previous = current[sortOrder];
      if (previous?.height === height && previous.y === y) return current;
      return { ...current, [sortOrder]: { height, y } };
    });
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" statusBarTranslucent transparent visible={Boolean(productId)}>
      <View style={{ flex: 1, backgroundColor: colors.blackAlpha78 }}>
        <CloseButton
          accessibilityLabel="Close product details"
          onPress={onClose}
          style={{ position: 'absolute', zIndex: 2, top: insets.top + 10, right: CLOSE_BUTTON_INSET }}
        />

        <View style={{ flex: 1, marginTop: insets.top + 10 + CLOSE_BUTTON_SIZE + CLOSE_BUTTON_GAP, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderCurve: 'continuous', backgroundColor: colors.white }}>
          {isLoading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.transparent }}><LoadingDots /><Text style={{ fontSize: fontSizes.size14, color: colors.mauveTone39 }}>Loading product details...</Text></View> : null}
          {!isLoading && errorMessage ? <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 }}><Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size14, lineHeight: 21, color: colors.mauveTone39 }}>{errorMessage}</Text><Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => ({ paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, backgroundColor: colors.violetTone58, opacity: pressed ? 0.72 : 1 })}><Text style={{ fontFamily: fontFamilies.bold, color: colors.white }}>Retry</Text></Pressable></View> : null}
          {!isLoading && data ? (
            <>
              <ScrollView
                contentInsetAdjustmentBehavior="never"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={32}
                onScroll={(event) => setDetailScrollY(event.nativeEvent.contentOffset.y)}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + bottomBarHeight }}
              >
                {bannerMedia.length > 0 || data.main_image ? (
                  <BannerCarousel items={bannerMedia} fallbackImage={data.main_image} width={contentWidth} />
                ) : null}

                <View style={{ paddingHorizontal: 20, paddingVertical: 22, gap: 5 }}>
                  <Text selectable style={{ fontSize: fontSizes.size22, lineHeight: 29, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>{data.product_name}</Text>
                  {data.rating ? (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                      <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>★</Text>
                      <DottedUnderline>
                        <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{data.rating.average ?? 0} ({formatCount(data.rating.count)} reviews)</Text>
                      </DottedUnderline>
                    </View>
                  ) : null}
                </View>

                {data.options.length ? (
                  <View>
                    <View style={{ height: 1, backgroundColor: NATIVE_SECTION_COLOR }} />
                    <ScrollView horizontal contentInsetAdjustmentBehavior="never" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 22, gap: 12 }}>
                      {data.options.map((option, index) => (
                        <OptionCard
                          key={`${option.label}-${index}`}
                          option={option}
                          quantity={optionQuantities[index] ?? 0}
                          onAdd={() => updateQuantity(index, 1)}
                          onRemove={() => updateQuantity(index, -1)}
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {data.exchange_steps.length > 0 ? (
                  <HowExchangeRow onPress={() => setExchangeInfoVisible(true)} />
                ) : null}

                {data.product_details.map((item) => {
                  if (item.type === 'image') return <DetailImage key={`detail-${item.sort_order}`} path={item.url} width={contentWidth} />;
                  if (item.type === 'video') return (
                    <View key={`detail-${item.sort_order}`} onLayout={(event) => storeDetailVideoLayout(item.sort_order, event)}>
                      <ProductVideo path={item.url} isActive={isDetailVideoVisible(item.sort_order)} loop nativeControls={false} />
                    </View>
                  );
                  if (item.type === 'slider') return <View key={`detail-${item.sort_order}`} style={{ paddingVertical: 22, gap: 15, backgroundColor: colors.slateTone5 }}>{item.slider_title ? <Text selectable style={{ paddingHorizontal: 20, fontSize: fontSizes.size21, lineHeight: 28, fontFamily: fontFamilies.bold, color: colors.white }}>{item.slider_title}</Text> : null}<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>{item.slider_images.map((path, index) => <DetailImage key={`${item.sort_order}-${index}`} path={path} width={220} />)}</ScrollView></View>;
                  return null;
                })}
                {data.product_specification?.short_desc_image ? (
                  <DetailImage
                    path={data.product_specification.short_desc_image}
                    width={contentWidth}
                    onPress={(data.product_specification.full_desc_content?.length ?? 0) > 0 ? () => setFullSpecificationsVisible(true) : undefined}
                  />
                ) : null}
              </ScrollView>

              {selectedSummary ? (
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: Math.max(insets.bottom, 10),
                    borderTopWidth: 1,
                    borderTopColor: NATIVE_SECTION_COLOR,
                    backgroundColor: colors.white,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ minWidth: 28, height: 28, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: colors.violetTone95_2 }}>
                      <Text selectable style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2, fontVariant: ['tabular-nums'] }}>{selectedSummary.quantity}</Text>
                    </View>
                    <Text selectable style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2, fontVariant: ['tabular-nums'] }}>₹{selectedSummary.total.toLocaleString('en-IN')}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isAddingToCart}
                    onPress={() => void handleDone()}
                    style={({ pressed }) => ({
                      minWidth: 128,
                      height: 42,
                      paddingHorizontal: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      borderCurve: 'continuous',
                      backgroundColor: pressed ? colors.blueTone50 : colors.violetTone58,
                      opacity: isAddingToCart ? 0.88 : 1,
                    })}
                  >
                    {isAddingToCart ? <LoadingDots color={colors.white} size={6} /> : <Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: colors.white }}>Done</Text>}
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        <ExchangeInfoModal visible={exchangeInfoVisible} onClose={() => setExchangeInfoVisible(false)} />
        <FullSpecificationsModal
          images={data?.product_specification?.full_desc_content ?? []}
          visible={fullSpecificationsVisible}
          onClose={() => setFullSpecificationsVisible(false)}
        />
      </View>
    </Modal>
  );
}
