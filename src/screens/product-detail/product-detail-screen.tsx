import { Image } from 'expo-image';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
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

import { EstimateNoteIcon } from '../../components/estimate-note-icon';
import type { ServiceItem } from '../../data/service-catalog';

type ProductDetailScreenProps = {
  cart: Record<string, number>;
  cartItemsById: Record<string, ServiceItem>;
  categoryTitle: string;
  item: ServiceItem;
  onAdd: (item: ServiceItem) => Promise<void> | void;
  onBack: () => void;
  onRemove: (item: ServiceItem) => void;
  onViewCart: () => void;
  subcategoryTitle: string;
  totalCartItems: number;
};

const BACKDROP_IN = FadeIn.duration(220);
const BACKDROP_OUT = FadeOut.duration(200);
const SHEET_IN = SlideInDown.duration(380).easing(Easing.out(Easing.cubic));
const SHEET_OUT = SlideOutDown.duration(300).easing(Easing.in(Easing.cubic));

export function ProductDetailScreen({ cart, cartItemsById, item, onAdd, onBack, onViewCart, totalCartItems }: ProductDetailScreenProps) {
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
  const selectedCartEntry = Object.entries(cartItemsById).find(([cartKey, cartItem]) => {
    const sameProduct = (cartItem.productId || cartKey.split('::')[0]) === (item.productId || item.id.split('::')[0]);
    if (!sameProduct) return false;
    if (!selectedVariant) return cartKey === selectedItem.id;
    return selectedVariant.key ? cartItem.variantKey === selectedVariant.key : cartItem.selectedVariantLabel === selectedVariant.label;
  });
  const selectedCartKey = selectedCartEntry?.[0] ?? selectedItem.id;
  const quantity = cart[selectedCartKey] ?? 0;
  const cardWidth = Math.min(176, Math.max(142, width * 0.43));
  const hasVariants = Boolean(item.variants?.length);
  const hasRequiredSelection = !hasVariants || Boolean(selectedVariant);
  const canContinue = isAvailable && hasRequiredSelection;

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
    if (quantity > 0) onViewCart();
    else {
      setIsAddingToCart(true);
      try {
        await onAdd(selectedItem);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        entering={BACKDROP_IN}
        exiting={BACKDROP_OUT}
        style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.80)' }, backdropStyle]}
      />
      <Animated.View style={[{ flex: 1 }, dragStyle]}>
        <Animated.View
          entering={FadeIn.delay(90).duration(180)}
          exiting={FadeOut.duration(120)}
          {...panResponder.panHandlers}
          style={{ height: insets.top + 50, paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close estimate"
            onPress={onBack}
            style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#FFFFFF', opacity: pressed ? 0.72 : 1 })}
          >
            <Text style={{ fontSize: 26, lineHeight: 28, fontWeight: '400', color: '#171419', marginTop: -1 }}>×</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={SHEET_IN}
          exiting={SHEET_OUT}
          {...panResponder.panHandlers}
          style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderCurve: 'continuous', backgroundColor: '#FFFFFF' }}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces
            onScroll={(event) => {
              scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            contentContainerStyle={{ paddingBottom: 142 + insets.bottom }}
          >
            <View style={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: 34, gap: 12 }}>
              <Text selectable style={{ fontSize: 24, lineHeight: 32, fontWeight: '600', color: '#171419' }}>{item.title} estimate</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
                <Text selectable style={{ fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#171419' }}>Starts at ₹{item.price.toLocaleString('en-IN')}</Text>
                {item.duration ? <Text selectable style={{ fontSize: 13, lineHeight: 19, color: '#4C474E' }}>•  {item.duration}</Text> : null}
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#E4E1E5' }} />

          <View style={{ paddingTop: 28, gap: 24 }}>
            <Text selectable style={{ paddingHorizontal: 20, fontSize: 23, lineHeight: 30, fontWeight: '600', color: '#171419' }}>Get an estimate</Text>

            {hasVariants ? (
              <View style={{ gap: 17 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${variantsExpanded ? 'Collapse' : 'Expand'} ${item.variantLabel || 'variant options'}`}
                  accessibilityState={{ expanded: variantsExpanded }}
                  onPress={() => setVariantsExpanded((current) => !current)}
                  style={({ pressed }) => ({ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.62 : 1 })}
                >
                  <View style={{ width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#F5F4F5' }}>
                    <Text style={{ fontSize: 14, color: '#3F3A42' }}>1</Text>
                  </View>
                  <Text selectable style={{ flex: 1, fontSize: 16, lineHeight: 22, fontWeight: '600', color: '#3F3A42' }}>{item.variantLabel || 'Select an option'}</Text>
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRightWidth: 1.8,
                        borderBottomWidth: 1.8,
                        borderColor: '#171419',
                        transform: [{ rotate: variantsExpanded ? '-135deg' : '45deg' }],
                      }}
                    />
                  </View>
                </Pressable>

                {variantsExpanded ? <ScrollView horizontal contentInsetAdjustmentBehavior="never" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                  {item.variants?.map((variant, index) => {
                    const selected = selectedVariantIndex === index;
                    const showImageArea = variant.hasImageField === true;
                    const variantImageUrl = variant.imageUrl || item.imageUrl || item.images?.[0];
                    return (
                      <Pressable
                        key={variant.key || variant.label}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => setSelectedVariantIndex(index)}
                        style={({ pressed }) => ({
                          width: cardWidth,
                          minHeight: showImageArea ? 258 : 108,
                          overflow: 'hidden',
                          borderRadius: 11,
                          borderCurve: 'continuous',
                          borderWidth: selected ? 1.5 : 1,
                          borderColor: selected ? '#6E45E2' : '#DEDADF',
                          backgroundColor: selected ? '#F7F3FF' : '#FFFFFF',
                          opacity: pressed ? 0.72 : 1,
                        })}
                      >
                        {showImageArea ? (
                          <View style={{ height: 148, backgroundColor: '#F0EFF0' }}>
                            {variantImageUrl ? <Image source={variantImageUrl} contentFit="cover" contentPosition="center" transition={180} style={{ position: 'absolute', inset: 0 }} /> : null}
                          </View>
                        ) : null}
                        <View style={{ flex: 1, justifyContent: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 15 }}>
                          <Text selectable numberOfLines={3} style={{ fontSize: 13, lineHeight: 19, color: '#171419' }}>{variant.label}</Text>
                          <Text selectable style={{ fontSize: 14, lineHeight: 20, fontWeight: '600', color: '#171419', fontVariant: ['tabular-nums'] }}>₹{variant.price.toLocaleString('en-IN')}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView> : null}
              </View>
            ) : (
              <View style={{ marginHorizontal: 20, padding: 18, borderRadius: 12, backgroundColor: '#F7F6F8' }}>
                <Text selectable style={{ fontSize: 13, lineHeight: 19, color: '#4C474E' }}>No additional options are required for this service.</Text>
              </View>
            )}

            {item.includes?.length ? (
              <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 14, borderTopWidth: 1, borderTopColor: '#E4E1E5' }}>
                <Text selectable style={{ fontSize: 20, lineHeight: 26, fontWeight: '600', color: '#171419' }}>Your total price includes</Text>
                {item.includes.map((include) => <View key={include} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}><Text style={{ fontWeight: '600', color: '#6E45E2' }}>✓</Text><Text selectable style={{ flex: 1, fontSize: 12, lineHeight: 18, color: '#625D64' }}>{include}</Text></View>)}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 10), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8E5E9', boxShadow: '0 -4px 16px rgba(25,20,30,0.06)' }}>
          <View style={{ minHeight: 39, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: canContinue ? '#EAF8F1' : '#FFF8E7' }}>
            <EstimateNoteIcon color={canContinue ? '#087A4B' : '#9A6C00'} />
            <Text selectable style={{ fontSize: 13, lineHeight: 18, fontWeight: '600', color: canContinue ? '#087A4B' : '#9A6C00' }}>
              {!isAvailable ? 'This service is currently unavailable' : !hasRequiredSelection ? 'Please select an option to generate your estimate' : `Your estimate is ₹${price.toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
            <Pressable
              disabled={!canContinue || isAddingToCart}
              accessibilityRole="button"
              onPress={handleConsultation}
              style={({ pressed }) => ({ height: 55, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: canContinue ? '#6E45E2' : '#EEEEEE', opacity: pressed || isAddingToCart ? 0.78 : 1 })}
            >
              {isAddingToCart ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: canContinue ? '#FFFFFF' : '#B7B5B8' }}>{quantity > 0 ? 'View cart' : 'Book Consultation at ₹49'}</Text>}
            </Pressable>
          </View>
        </View>
      </Animated.View>
      </Animated.View>
    </View>
  );
}
