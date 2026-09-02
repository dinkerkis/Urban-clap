import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../../components/app-text';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  Extrapolation,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseButton, CLOSE_BUTTON_GAP, CLOSE_BUTTON_INSET, CLOSE_BUTTON_SIZE } from '../../components/close-icon';
import { DottedUnderline } from '../../components/dotted-underline';
import { EstimateNoteIcon } from '../../components/estimate-note-icon';
import type { ServiceItem } from '../../data/service-catalog';

type ProductDetailScreenProps = {
  cart: Record<string, number>;
  cartItemsById: Record<string, ServiceItem>;
  categoryTitle: string;
  item: ServiceItem;
  onAdd: (item: ServiceItem) => Promise<boolean | void> | boolean | void;
  onBack: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onRemove: (item: ServiceItem) => void;
  onViewCart: () => void;
  subcategoryTitle: string;
  totalCartItems: number;
};

const BACKDROP_IN = FadeIn.duration(220);
const BACKDROP_OUT = FadeOut.duration(200);
const SHEET_IN = SlideInDown.duration(380).easing(Easing.out(Easing.cubic));
const SHEET_OUT = SlideOutDown.duration(300).easing(Easing.in(Easing.cubic));

function shouldShowEstimateFlow(screenTitle: string) {
  const normalizedTitle = screenTitle.trim().toLocaleLowerCase();
  return normalizedTitle.includes('rooms') && normalizedTitle.includes('walls') && normalizedTitle.includes('painting');
}

function shouldHideSelectRequirements(categoryTitle: string, subcategoryTitle: string, hasVariants: boolean) {
  const titles = `${categoryTitle} ${subcategoryTitle}`;
  const isExactCategory = (name: string) => new RegExp(`^${name}$`, 'i').test(categoryTitle.trim()) || new RegExp(`^${name}$`, 'i').test(subcategoryTitle.trim());
  return /Furniture Assembly/i.test(titles)
    || /Geyser/i.test(titles)
    || /Installation\s*&\s*uninstallation/i.test(titles)
    || /^AC$/i.test(categoryTitle.trim())
    || /^AC$/i.test(subcategoryTitle.trim())
    || ((isExactCategory('Carpenter') || isExactCategory('Electrician')) && !hasVariants);
}

export function ProductDetailScreen({ categoryTitle, item, onAdd, onBack, onLoadingChange, onViewCart, subcategoryTitle }: ProductDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width } = useWindowDimensions();
  const dragY = useSharedValue(0);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const scrollOffset = useRef(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => {
    const selectedIndex = item.variants?.findIndex((variant) => variant.key === item.variantKey || variant.label === item.selectedVariantLabel) ?? -1;
    return selectedIndex;
  });
  const [selectedVariantQuantity, setSelectedVariantQuantity] = useState(() => item.selectedVariantLabel || item.variantKey ? 1 : 0);
  const [variantsExpanded, setVariantsExpanded] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const selectedVariant = item.variants?.[selectedVariantIndex];
  const price = selectedVariant?.price ?? item.price;
  const isAvailable = !item.status || item.status.toLowerCase() === 'active';
  const selectedItem: ServiceItem = {
    ...item,
    id: selectedVariant ? `${item.id}::${selectedVariant.key || selectedVariantIndex}` : item.id,
    imageUrl: selectedVariant?.imageUrl || item.imageUrl || item.images?.[0],
    price,
    originalPrice: price,
    selectedVariantLabel: selectedVariant?.label,
    variantKey: selectedVariant?.key,
  };
  const cardWidth = Math.min(176, Math.max(142, width * 0.43));
  const hasVariants = Boolean(item.variants?.length);
  const hasRequiredSelection = !hasVariants || Boolean(selectedVariant);
  const canContinue = isAvailable && hasRequiredSelection;
  const showEstimateFlow = shouldShowEstimateFlow(subcategoryTitle);
  const isIkeaFurniture = /IKEA Furniture/i.test(categoryTitle) || /IKEA Furniture/i.test(subcategoryTitle);
  const showSimplifiedVariants = (/Furniture Assembly/i.test(subcategoryTitle) || isIkeaFurniture) && hasVariants;
  const hideRequirementsTitle = showSimplifiedVariants || shouldHideSelectRequirements(categoryTitle, subcategoryTitle, hasVariants);
  const showDoneBar = !showEstimateFlow && Boolean(selectedVariant) && (!showSimplifiedVariants || selectedVariantQuantity > 0);

  const closeAfterSwipe = () => {
    onBackRef.current();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          scrollOffset.current <= 2 && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          scrollOffset.current <= 2 && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          dragY.value = Math.max(0, gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 90 || gesture.vy > 1.1) {
            dragY.value = withTiming(windowHeight, { duration: 280, easing: Easing.in(Easing.cubic) }, (finished) => {
              if (finished) runOnJS(closeAfterSwipe)();
            });
            return;
          }
          dragY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
        },
      }),
    [dragY, windowHeight],
  );

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragY.value, [0, windowHeight * 0.45], [1, 0], Extrapolation.CLAMP),
  }));

  const handleConsultation = async () => {
    if (!canContinue || isAddingToCart) return;
    setIsAddingToCart(true);
    onLoadingChange?.(true);
    onBack();
    try {
      let added: boolean | void = true;
      const addCount = showSimplifiedVariants ? selectedVariantQuantity : 1;
      for (let count = 0; count < addCount; count += 1) {
        added = await onAdd(selectedItem);
        if (added === false) break;
      }
      if (added !== false && showEstimateFlow) onViewCart();
    } finally {
      onLoadingChange?.(false);
      setIsAddingToCart(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        entering={BACKDROP_IN}
        exiting={BACKDROP_OUT}
        style={[{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha80 }, backdropStyle]}
      />
      <Animated.View style={[{ flex: 1 }, dragStyle]}>
        <Animated.View
          entering={FadeIn.delay(90).duration(180)}
          exiting={FadeOut.duration(120)}
          {...panResponder.panHandlers}
          style={{ height: insets.top + CLOSE_BUTTON_SIZE + CLOSE_BUTTON_GAP, paddingTop: insets.top, paddingHorizontal: CLOSE_BUTTON_INSET, paddingBottom: CLOSE_BUTTON_GAP, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}
        >
          <CloseButton accessibilityLabel={showEstimateFlow ? 'Close estimate' : 'Close details'} onPress={onBack} />
        </Animated.View>

        <Animated.View
          entering={SHEET_IN}
          exiting={SHEET_OUT}
          {...panResponder.panHandlers}
          style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderCurve: 'continuous', backgroundColor: colors.white }}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces
            onScroll={(event) => {
              scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            contentContainerStyle={{ paddingBottom: (showEstimateFlow ? 142 : showDoneBar ? 104 : 32) + insets.bottom }}
          >
            <View style={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: 34, gap: 12 }}>
              <Text selectable style={{ fontSize: fontSizes.size24, lineHeight: 32, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>{item.title}{showEstimateFlow ? ' estimate' : ''}</Text>
              {showSimplifiedVariants ? (
                item.rating > 0 ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>★</Text>
                  <DottedUnderline>
                    <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{item.rating} ({item.reviews} reviews)</Text>
                  </DottedUnderline>
                </View> : null
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
                  <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>Starts at ₹{item.price.toLocaleString('en-IN')}</Text>
                  {item.duration ? <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone29 }}>•  {item.duration}</Text> : null}
                </View>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />

          <View style={{ paddingTop: hideRequirementsTitle ? (hasVariants ? 22 : 0) : 28, gap: hideRequirementsTitle ? 0 : 24 }}>
            {!hideRequirementsTitle ? <Text selectable style={{ paddingHorizontal: 20, fontSize: fontSizes.size23, lineHeight: 30, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>
              {showEstimateFlow ? 'Get an estimate' : 'Select requirements'}
            </Text> : null}

            {hasVariants ? (
              <View style={{ gap: showSimplifiedVariants ? 0 : 17 }}>
                {!showSimplifiedVariants ? <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${variantsExpanded ? 'Collapse' : 'Expand'} ${item.variantLabel || 'variant options'}`}
                  accessibilityState={{ expanded: variantsExpanded }}
                  onPress={() => setVariantsExpanded((current) => !current)}
                  style={({ pressed }) => ({ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.62 : 1 })}
                >
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: colors.mauveTone96 }}>
                    <Text style={{ fontSize: fontSizes.size13, fontFamily: fontFamilies.semiBold, color: colors.black, fontVariant: ['tabular-nums'] }}>1</Text>
                  </View>
                  <Text selectable style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: colors.black }}>{item.variantLabel || 'Select an option'}</Text>
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRightWidth: 1.8,
                        borderBottomWidth: 1.8,
                        borderColor: colors.mauveTone9_2,
                        transform: [{ rotate: variantsExpanded ? '-135deg' : '45deg' }],
                      }}
                    />
                  </View>
                </Pressable> : null}

                {showSimplifiedVariants || variantsExpanded ? <ScrollView horizontal contentInsetAdjustmentBehavior="never" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                  {item.variants?.map((variant, index) => {
                    const selected = selectedVariantIndex === index;
                    const variantImageUrl = variant.imageUrl?.trim();
                    const showImageArea = Boolean(variantImageUrl);
                    return (
                      <Pressable
                        key={variant.key || variant.label}
                        accessibilityRole={showSimplifiedVariants ? undefined : 'radio'}
                        accessibilityState={showSimplifiedVariants ? undefined : { checked: selected }}
                        onPress={showSimplifiedVariants ? undefined : () => setSelectedVariantIndex(index)}
                        style={({ pressed }) => ({
                          width: cardWidth,
                          minHeight: showImageArea ? 258 : 108,
                          overflow: 'hidden',
                          borderRadius: 8,
                          borderCurve: 'continuous',
                          borderWidth: showSimplifiedVariants ? 1 : selected ? 1.5 : 1,
                          borderColor: showSimplifiedVariants ? colors.mauveTone86_2 : selected ? colors.violetTone58 : colors.mauveTone86_2,
                          backgroundColor: showSimplifiedVariants ? colors.white : selected ? colors.violetTone98 : colors.white,
                          opacity: pressed ? 0.72 : 1,
                        })}
                      >
                        {showImageArea ? (
                          <View style={{ height: 148, backgroundColor: colors.violetTone98_3 }}>
                            <Image source={variantImageUrl} contentFit="cover" contentPosition="center" transition={180} style={{ position: 'absolute', inset: 0 }} />
                          </View>
                        ) : null}
                        <View style={{ flex: 1, justifyContent: 'flex-start', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 15 }}>
                          <Text selectable numberOfLines={3} style={{ fontSize: fontSizes.size13, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>{variant.label}</Text>
                          <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2, fontVariant: ['tabular-nums'] }}>₹{variant.price.toLocaleString('en-IN')}</Text>
                          {showSimplifiedVariants ? selected && selectedVariantQuantity > 0 ? (
                            <View style={{ alignSelf: 'flex-start', width: 78, height: 30, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 9, borderWidth: 1, borderColor: colors.mauveTone86_2, backgroundColor: colors.white }}>
                              <Pressable accessibilityRole="button" accessibilityLabel={`Remove one ${variant.label}`} onPress={(event) => { event.stopPropagation(); setSelectedVariantQuantity((current) => { const next = Math.max(0, current - 1); if (next === 0) setSelectedVariantIndex(-1); return next; }); }} style={{ width: 22, height: 28, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: fontSizes.size17, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>−</Text></Pressable>
                              <Text style={{ minWidth: 18, textAlign: 'center', fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.violetTone58, fontVariant: ['tabular-nums'] }}>{selectedVariantQuantity}</Text>
                              <Pressable accessibilityRole="button" accessibilityLabel={`Add one more ${variant.label}`} onPress={(event) => { event.stopPropagation(); setSelectedVariantQuantity((current) => current + 1); }} style={{ width: 22, height: 28, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: fontSizes.size17, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>+</Text></Pressable>
                            </View>
                          ) : (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Add ${variant.label}`}
                              onPress={(event) => {
                                event.stopPropagation();
                                setSelectedVariantIndex(index);
                                setSelectedVariantQuantity(1);
                              }}
                              style={({ pressed }) => ({ alignSelf: 'flex-start', width: 70, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderCurve: 'continuous', backgroundColor: pressed ? colors.mauveTone96 : colors.white, borderWidth: 1, borderColor: colors.mauveTone86_2, opacity: pressed ? 0.76 : 1 })}
                            >
                              <Text style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.medium, color: colors.violetTone58 }}>Add</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView> : null}
              </View>
            ) : showEstimateFlow ? (
              <View style={{ marginHorizontal: 20, padding: 18, borderRadius: 12, backgroundColor: colors.violetTone97_3 }}>
                <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone29 }}>No additional options are required for this service.</Text>
              </View>
            ) : null}

            {item.includes?.length ? (
              <View>
                <View style={{ height: 1, marginHorizontal: 16, backgroundColor: colors.violetTone98_3 }} />
                <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 14 }}>
                  <Text selectable style={{ fontSize: fontSizes.size20, lineHeight: 26, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>Your total price includes</Text>
                  {item.includes.map((include) => <View key={include} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}><Text style={{ fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>✓</Text><Text selectable style={{ flex: 1, fontSize: fontSizes.size12, lineHeight: 18, color: colors.mauveTone38_2 }}>{include}</Text></View>)}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {showEstimateFlow ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 10), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.violetTone98_3, boxShadow: `0 -4px 16px ${colors.violetTone10Alpha6}` }}>
          <View style={{ minHeight: 39, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: canContinue ? colors.greenTone95 : colors.yellowTone95 }}>
            <EstimateNoteIcon color={canContinue ? colors.tealTone25_2 : colors.yellowTone30} />
            <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 18, fontFamily: fontFamilies.semiBold, color: canContinue ? colors.tealTone25_2 : colors.yellowTone30 }}>
              {!isAvailable ? 'This service is currently unavailable' : !hasRequiredSelection ? 'Please select an option to generate your estimate' : `Your estimate is ₹${price.toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
            <Pressable
              disabled={!canContinue || isAddingToCart}
              accessibilityRole="button"
              onPress={handleConsultation}
              style={({ pressed }) => ({ height: 55, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: canContinue ? colors.violetTone58 : colors.neutralTone93, opacity: pressed ? 0.78 : 1 })}
            >
              <Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.semiBold, color: canContinue ? colors.white : colors.neutralTone72 }}>Book Consultation at ₹49</Text>
            </Pressable>
          </View>
        </View> : showDoneBar ? (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(140)}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10), flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.violetTone98_3, boxShadow: `0 -4px 16px ${colors.violetTone10Alpha6}` }}
          >
            <Text selectable style={{ flex: 1, fontSize: fontSizes.size16, lineHeight: 22, fontFamily: fontFamilies.semiBold, color: colors.black, fontVariant: ['tabular-nums'] }}>
              ₹{(showSimplifiedVariants ? price * selectedVariantQuantity : price).toLocaleString('en-IN')}
            </Text>
            <Pressable
              disabled={!canContinue || isAddingToCart}
              accessibilityRole="button"
              accessibilityLabel="Confirm selected option"
              onPress={handleConsultation}
              style={({ pressed }) => ({ width: Math.min(172, width * 0.44), height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderCurve: 'continuous', backgroundColor: canContinue ? colors.violetTone58 : colors.neutralTone93, opacity: pressed ? 0.78 : 1 })}
            >
              <Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: canContinue ? colors.white : colors.neutralTone72 }}>Done</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </Animated.View>
      </Animated.View>
    </View>
  );
}
