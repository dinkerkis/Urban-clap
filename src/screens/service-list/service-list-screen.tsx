import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { Text } from '../../components/app-text';
import Animated, { cancelAnimation, Easing, FadeIn, interpolate, runOnJS, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { CloseButton, CLOSE_BUTTON_GAP } from '../../components/close-icon';
import { DottedUnderline } from '../../components/dotted-underline';
import { EstimateNoteIcon } from '../../components/estimate-note-icon';
import type { ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCategoryProducts, type ProductSection } from '../../hooks/use-category-products';

type ServiceListScreenProps = {
  cart: Record<string, number>;
  cartItemsById: Record<string, ServiceItem>;
  categoryTitle: string;
  subcategory: ServiceSubcategory;
  totalCartCategories: number;
  totalCartItems: number;
  onAdd: (item: ServiceItem) => void;
  onBack: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => void;
  onSearchPress?: () => void;
  onViewCart: () => void;
  scrollTarget?: { productId: string; requestKey: number };
};

const HERO_DURATION = 4_500;
const HERO_HEIGHT = 280;
const NAV_HEIGHT = 66;
const SECTION_HEADER_HEIGHT = 46;
const ESTIMATE_NOTE_HEIGHT = 32;
const CONSULTATION_BUTTON_HEIGHT = 50;
const CONSULTATION_BUTTON_RADIUS = 8;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function isPaintingAndWaterproofingCategory(categoryTitle: string) {
  const normalizedTitle = categoryTitle.trim().toLocaleLowerCase();
  return normalizedTitle.includes('painting') && normalizedTitle.includes('waterproof');
}

function getSectionColumnCount(categoryTitle: string) {
  return isPaintingAndWaterproofingCategory(categoryTitle) ? 4 : 3;
}

function shouldShowEstimateFooter(screenTitle: string) {
  const normalizedTitle = screenTitle.trim().toLocaleLowerCase();
  return normalizedTitle.includes('rooms') && normalizedTitle.includes('walls') && normalizedTitle.includes('painting');
}

function SearchIcon() {
  return (
    <Image
      source={require('../../../assets/search.png')}
      contentFit="contain"
      tintColor={colors.mauveTone9_2}
      style={{ width: 18, height: 18 }}
    />
  );
}

function ShareIcon() {
  return (
    <Image
      source={require('../../../assets/share.png')}
      contentFit="contain"
      tintColor={colors.mauveTone9_2}
      style={{ width: 18, height: 18 }}
    />
  );
}

function ServiceSkeletonBlock({ height, progress, radius = 8, screenWidth, width = '100%' }: { height: number; progress: SharedValue<number>; radius?: number; screenWidth: number; width?: number | `${number}%` }) {
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.get(), [0, 1], [-screenWidth, screenWidth]) },
      { skewX: '-18deg' },
    ],
  }));
  return (
    <View style={{ width, height, overflow: 'hidden', borderRadius: radius, backgroundColor: colors.slateTone90 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: screenWidth * 0.35, backgroundColor: colors.whiteAlpha72 }, shimmerStyle]} />
    </View>
  );
}

function ServiceListSkeleton({ categoryTitle, hideHeroImage, onBack, showEstimateFooter }: { categoryTitle: string; hideHeroImage: boolean; onBack: () => void; showEstimateFooter: boolean }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const columnCount = getSectionColumnCount(categoryTitle);
  const cardWidth = Math.floor((Math.min(screenWidth, 520) - 32 - (columnCount - 1) * 12) / columnCount);
  const categoryImageSize = Math.min(72, cardWidth);
  const productImageSize = 128;

  useEffect(() => {
    cancelAnimation(progress);
    if (reducedMotion) {
      progress.set(0.45);
      return;
    }
    progress.set(0);
    progress.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(progress);
  }, [progress, reducedMotion]);

  return (
    <View accessibilityLabel="Loading category details" accessibilityRole="progressbar" style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView scrollEnabled={false} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: hideHeroImage ? insets.top + NAV_HEIGHT : 0, paddingBottom: (showEstimateFooter ? 118 : 24) + insets.bottom }}>
        {!hideHeroImage ? <ServiceSkeletonBlock height={HERO_HEIGHT} progress={progress} radius={0} screenWidth={screenWidth} /> : null}
        <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 22, gap: 10 }}>
          <ServiceSkeletonBlock height={32} progress={progress} screenWidth={screenWidth} width="72%" />
          <ServiceSkeletonBlock height={18} progress={progress} radius={5} screenWidth={screenWidth} width="46%" />
        </View>
        <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25, flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View key={`service-skeleton-category-${index}`} style={{ width: cardWidth, alignItems: 'center', gap: 8 }}>
              <ServiceSkeletonBlock height={categoryImageSize} progress={progress} radius={8} screenWidth={screenWidth} width={categoryImageSize} />
              <ServiceSkeletonBlock height={16} progress={progress} radius={5} screenWidth={screenWidth} width="86%" />
              <ServiceSkeletonBlock height={16} progress={progress} radius={5} screenWidth={screenWidth} width="68%" />
            </View>
          ))}
        </View>
        <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />
        <View style={{ padding: 20, gap: 18 }}>
          <ServiceSkeletonBlock height={28} progress={progress} screenWidth={screenWidth} width="62%" />
          {[0, 1].map((index) => (
            <View key={`service-skeleton-product-${index}`} style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, gap: 10 }}>
                <ServiceSkeletonBlock height={22} progress={progress} screenWidth={screenWidth} width="88%" />
                <ServiceSkeletonBlock height={15} progress={progress} radius={5} screenWidth={screenWidth} width="60%" />
                <ServiceSkeletonBlock height={15} progress={progress} radius={5} screenWidth={screenWidth} width="72%" />
              </View>
              <ServiceSkeletonBlock height={productImageSize} progress={progress} radius={13} screenWidth={screenWidth} width={productImageSize} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top + NAV_HEIGHT, paddingTop: insets.top, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} onPress={onBack} style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.white, opacity: pressed ? 0.58 : 1 })}><BackIcon /></Pressable>
        <View style={{ flex: 1 }} />
        <ServiceSkeletonBlock height={40} progress={progress} radius={20} screenWidth={screenWidth} width={40} />
        <ServiceSkeletonBlock height={40} progress={progress} radius={20} screenWidth={screenWidth} width={40} />
      </View>

      {showEstimateFooter ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 10), borderTopWidth: 1, borderTopColor: colors.violetTone98_3, backgroundColor: colors.white }}>
          <View style={{ height: ESTIMATE_NOTE_HEIGHT, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.yellowTone95 }}>
            <ServiceSkeletonBlock height={14} progress={progress} radius={4} screenWidth={screenWidth} width="72%" />
          </View>
          <View style={{ paddingHorizontal: 16, paddingTop: 9 }}>
            <ServiceSkeletonBlock height={CONSULTATION_BUTTON_HEIGHT} progress={progress} radius={CONSULTATION_BUTTON_RADIUS} screenWidth={screenWidth} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ProductRow({ cartItem, hidePriceUnderline, item, quantity, showEstimateLabel, onAdd, onPress, onRemove }: { cartItem: ServiceItem; hidePriceUnderline: boolean; item: ServiceItem; quantity: number; showEstimateLabel: boolean; onAdd: (item: ServiceItem) => void; onPress: (item: ServiceItem) => void; onRemove: (item: ServiceItem) => void }) {
  const productImageSize = 128;
  const displayItem = quantity > 0 ? cartItem : item;
  const variantsCount = item.variants?.length ?? 0;
  const priceRow = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>{quantity === 0 && item.variants?.length ? 'Starts at ' : ''}₹{displayItem.price.toLocaleString('en-IN')}</Text>
      {item.duration ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: fontSizes.size16, lineHeight: 19, textAlignVertical: 'center', color: colors.mauveTone38_2 }}>•</Text>
          <Text selectable style={{ fontSize: fontSizes.size12, lineHeight: 18, color: colors.mauveTone38_2 }}>{item.duration}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable onPress={() => onPress(item)} style={({ pressed }) => ({ paddingVertical: 22, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <Text selectable numberOfLines={3} style={{ fontSize: fontSizes.size18, lineHeight: 25, fontFamily: fontFamilies.semiBold, color: colors.black }}>{item.title}</Text>
          {item.rating > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
              <Text style={{ fontSize: fontSizes.size12, lineHeight: 18, color: colors.mauveTone38_2 }}>★</Text>
              <DottedUnderline>
                <Text selectable style={{ fontSize: fontSizes.size12, lineHeight: 18, color: colors.mauveTone38_2 }}>{item.rating} ({item.reviews} reviews)</Text>
              </DottedUnderline>
            </View>
          ) : null}
          {hidePriceUnderline ? priceRow : <DottedUnderline fullWidth lineMarginTop={10} dotColor={colors.mauveTone86}>{priceRow}</DottedUnderline>}
          {item.description ? <Text selectable numberOfLines={3} style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{item.description}</Text> : null}
          <Text style={{ paddingTop: 5, fontSize: fontSizes.size14, lineHeight: 19, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>{showEstimateLabel ? 'View details and estimate' : 'View details'}</Text>
        </View>

        <View style={{ width: productImageSize, height: productImageSize + (quantity === 0 && variantsCount > 0 ? 39 : 16), alignItems: 'center' }}>
          <View style={{ width: productImageSize, height: productImageSize, overflow: 'hidden', borderRadius: 9, borderCurve: 'continuous', backgroundColor: colors.violetTone98_3 }}>
            {displayItem.imageUrl ? <Image source={displayItem.imageUrl} contentFit="cover" transition={180} style={{ position: 'absolute', inset: 0 }} /> : null}
          </View>
          {quantity === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.title}${variantsCount > 0 ? `, ${variantsCount} ${variantsCount === 1 ? 'option' : 'options'}` : ''}`}
              onPress={(event) => {
                event.stopPropagation();
                if (item.variants?.length) onPress(item);
                else onAdd(item);
              }}
              style={({ pressed }) => ({ position: 'absolute', bottom: variantsCount > 0 ? 23 : 0, alignSelf: 'center', width: 78, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderCurve: 'continuous', borderWidth: 1, borderColor: colors.mauveTone89_4, backgroundColor: pressed ? colors.violetTone97 : colors.white, elevation: 0, shadowOpacity: 0 })}
            >
              <Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.medium, color: colors.violetTone58 }}>Add</Text>
            </Pressable>
          ) : (
            <View style={{ position: 'absolute', bottom: 0, alignSelf: 'center', width: 78, height: 32, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, overflow: 'hidden', borderRadius: 10, borderWidth: 1, borderColor: colors.violetTone58, backgroundColor: colors.white, elevation: 0, shadowOpacity: 0 }}>
              <Pressable onPress={(event) => { event.stopPropagation(); onRemove(cartItem); }} style={{ width: 22, height: 30, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: fontSizes.size17, lineHeight: 20, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>−</Text></Pressable>
              <Text style={{ minWidth: 18, textAlign: 'center', fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.violetTone58, fontVariant: ['tabular-nums'] }}>{quantity}</Text>
              <Pressable onPress={(event) => { event.stopPropagation(); onAdd(cartItem); }} style={{ width: 22, height: 30, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: fontSizes.size17, lineHeight: 20, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>+</Text></Pressable>
            </View>
          )}
          {quantity === 0 && variantsCount > 0 ? <Text selectable style={{ position: 'absolute', bottom: -1, fontSize: fontSizes.size12, lineHeight: 15, fontFamily: fontFamilies.regular, color: colors.mauveTone38_2 }}>{variantsCount} {variantsCount === 1 ? 'option' : 'options'}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ServiceListScreen({ cart, cartItemsById, categoryTitle, subcategory, totalCartCategories, totalCartItems, onAdd, onBack, onProductPress, onRemove, onSearchPress, onViewCart, scrollTarget }: ServiceListScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { categoryName, errorMessage, isLoading, retry, sections } = useCategoryProducts(subcategory.id);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const productOffsets = useRef<Record<string, number>>({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stickyHeaderVisible, setStickyHeaderVisible] = useState(false);
  const [stickySection, setStickySection] = useState<ProductSection | null>(null);
  const heroProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);
  const displayCategoryTitle = categoryName?.trim() || categoryTitle;
  const showEstimateFooter = shouldShowEstimateFooter(displayCategoryTitle);
  const showCartFooter = !showEstimateFooter && totalCartItems > 0;
  const hideSectionPicker = /RO\s*\/\s*Water Purifier|Geyser/i.test(subcategory.title);
  const hideParentCategoryHero = /Electrician.*Plumber.*Carpenter/i.test(categoryTitle);
  const alwaysShowNavButtonBorders = /AC\s*&\s*Appliance|Electrician.*Plumber.*Carpenter/i.test(categoryTitle);
  const hideHeroImage = hideSectionPicker || hideParentCategoryHero || /Furniture Assembly/i.test(subcategory.title);
  const hidePriceUnderline = hideParentCategoryHero
    || /Furniture Assembly/i.test(subcategory.title)
    || /Furniture Assembly/i.test(displayCategoryTitle)
    || /^AC$/i.test(subcategory.title.trim())
    || /^AC$/i.test(displayCategoryTitle.trim());
  // Without a hero, the category title starts 25px below the navigation bar
  // and is 32px tall. Pin it as soon as its last pixel scrolls under the bar.
  const stickyHeaderThreshold = hideHeroImage ? 57 : HERO_HEIGHT - 72;

  const getCartSelection = (item: ServiceItem) => {
    const cartIds = Object.keys(cart).filter((cartId) => cart[cartId] > 0 && (cartId === item.id || cartId.startsWith(`${item.id}::`)));
    const quantity = cartIds.reduce((total, cartId) => total + (cart[cartId] ?? 0), 0);
    const cartItem = cartIds.map((cartId) => cartItemsById[cartId]).find(Boolean) ?? item;
    return { cartItem, quantity };
  };

  const heroItems = useMemo(() => {
    const items = sections.flatMap((section) => section.products.map((product) => ({ imageUrl: product.imageUrl || section.imageUrl, title: product.title, subtitle: product.description })));
    const unique = items.filter((item, index) => item.imageUrl && items.findIndex((candidate) => candidate.imageUrl === item.imageUrl) === index);
    if (unique.length > 0) return unique.slice(0, 5);
    return subcategory.imageUrl ? [{ imageUrl: subcategory.imageUrl, title: displayCategoryTitle, subtitle: subcategory.subtitle }] : [];
  }, [displayCategoryTitle, sections, subcategory.imageUrl, subcategory.subtitle]);

  const visibleSections = sections;

  useEffect(() => {
    if (!scrollTarget || isLoading || errorMessage) return;
    let attempts = 0;
    const scrollToProduct = () => {
      const offset = productOffsets.current[scrollTarget.productId];
      if (offset !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - (insets.top + NAV_HEIGHT + SECTION_HEADER_HEIGHT) + 10), animated: true });
        return;
      }
      attempts += 1;
      if (attempts < 6) timer = setTimeout(scrollToProduct, 80);
    };
    let timer = setTimeout(scrollToProduct, 120);
    return () => clearTimeout(timer);
  }, [errorMessage, insets.top, isLoading, scrollTarget?.productId, scrollTarget?.requestKey]);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    heroProgress.value = 0;
    heroProgress.value = withTiming(1, { duration: HERO_DURATION });
    const timer = setTimeout(() => setHeroIndex((current) => (current + 1) % heroItems.length), HERO_DURATION);
    return () => clearTimeout(timer);
  }, [heroIndex, heroItems.length, heroProgress]);

  useEffect(() => {
    if (heroIndex >= heroItems.length) setHeroIndex(0);
  }, [heroIndex, heroItems.length]);

  const activeProgressStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: heroProgress.value }] }));
  const menuFadeStyle = useAnimatedStyle(() => ({ opacity: menuProgress.value }));
  const menuCardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuProgress.value, [0, 0.18, 1], [0, 0, 1]),
    transform: [{ scale: interpolate(menuProgress.value, [0, 0.18, 1], [0.82, 0.82, 1]) }],
  }));

  const openMenu = () => {
    menuProgress.value = 0;
    setMenuVisible(true);
  };

  useEffect(() => {
    if (!menuVisible) return;
    menuProgress.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
  }, [menuProgress, menuVisible]);

  const closeMenu = () => {
    menuProgress.value = withTiming(0, { duration: 380, easing: Easing.in(Easing.cubic) }, (finished) => {
      'worklet';
      if (finished) runOnJS(setMenuVisible)(false);
    });
  };

  const productCount = sections.reduce((total, section) => total + section.products.length, 0);
  const ratedProducts = sections.flatMap((section) => section.products).filter((item) => item.rating > 0);
  const averageRating = ratedProducts.length ? ratedProducts.reduce((total, item) => total + item.rating, 0) / ratedProducts.length : 0;
  const showEstimateLabel = isPaintingAndWaterproofingCategory(categoryTitle);
  const useFourColumnSectionGrid = /^(IKEA Furniture Assembly|Carpenter)$/i.test(displayCategoryTitle.trim());
  const sectionColumnCount = useFourColumnSectionGrid ? 4 : getSectionColumnCount(categoryTitle);
  const sectionCardWidth = Math.floor((Math.min(width, 520) - 32 - (sectionColumnCount - 1) * 12) / sectionColumnCount);
  const sectionImageSize = Math.min(72, sectionCardWidth);
  const modalCardWidth = Math.floor((Math.min(width, 520) - 56 - (sectionColumnCount - 1) * 12) / sectionColumnCount);
  const modalImageSize = Math.min(72, modalCardWidth);

  const scrollToSection = (section: ProductSection) => {
    closeMenu();
    const offset = sectionOffsets.current[section.id];
    if (offset !== undefined) requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, offset - (insets.top + NAV_HEIGHT + SECTION_HEADER_HEIGHT) + 10), animated: true }));
  };

  const share = () => void Share.share({ message: `Explore ${displayCategoryTitle} services on Urban Clap.` });

  if (isLoading) {
    return <ServiceListSkeleton categoryTitle={categoryTitle} hideHeroImage={hideHeroImage} onBack={onBack} showEstimateFooter={shouldShowEstimateFooter(subcategory.title)} />;
  }

  if (errorMessage) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: colors.white }}><Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{errorMessage}</Text><Pressable onPress={retry} style={{ paddingHorizontal: 20, paddingVertical: 11, borderRadius: 999, backgroundColor: colors.violetTone58 }}><Text style={{ fontFamily: fontFamilies.semiBold, color: colors.white }}>Try again</Text></Pressable></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const shouldShow = !hideSectionPicker && y >= stickyHeaderThreshold;
          if (shouldShow !== stickyHeaderVisible) setStickyHeaderVisible(shouldShow);

          const navBottom = y + insets.top + NAV_HEIGHT;
          const pinLine = navBottom + SECTION_HEADER_HEIGHT;
          let nextSection: ProductSection | null = null;
          for (const section of visibleSections) {
            const offset = sectionOffsets.current[section.id];
            if (offset !== undefined && offset <= pinLine) nextSection = section;
          }
          const firstOffset = visibleSections[0] ? sectionOffsets.current[visibleSections[0].id] : undefined;
          if (firstOffset === undefined || navBottom < firstOffset) nextSection = null;
          if (nextSection?.id !== stickySection?.id) setStickySection(nextSection);
        }}
        contentContainerStyle={{ paddingTop: hideHeroImage ? insets.top + NAV_HEIGHT : 0, paddingBottom: (showEstimateFooter ? 118 : showCartFooter ? 104 : 8) + insets.bottom }}
      >
        {!hideSectionPicker ? (
          <>
            {!hideHeroImage ? (
              <View style={{ height: HERO_HEIGHT, backgroundColor: colors.blueTone82 }}>
                {heroItems[heroIndex]?.imageUrl ? (
                  <Animated.View key={`${heroIndex}-${heroItems[heroIndex].imageUrl}`} entering={FadeIn.duration(280)} style={{ position: 'absolute', inset: 0 }}>
                    <Image source={heroItems[heroIndex].imageUrl} contentFit="cover" contentPosition="center" transition={120} style={{ position: 'absolute', inset: 0 }} />
                  </Animated.View>
                ) : null}

                {heroItems.length > 1 ? <View style={{ position: 'absolute', left: 20, right: 20, bottom: 17, flexDirection: 'row', gap: 5 }}>{heroItems.map((item, index) => <View key={`${item.imageUrl}-${index}`} style={{ flex: 1, height: 3, overflow: 'hidden', borderRadius: 2, backgroundColor: colors.whiteAlpha38 }}>{index < heroIndex ? <View style={{ flex: 1, backgroundColor: colors.white }} /> : index === heroIndex ? <Animated.View style={[{ flex: 1, backgroundColor: colors.white, transformOrigin: 'left' }, activeProgressStyle]} /> : null}</View>)}</View> : null}
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 22, gap: 7 }}>
              <Text selectable style={{ fontSize: fontSizes.size24, lineHeight: 32, fontFamily: fontFamilies.semiBold, color: colors.black }}>{displayCategoryTitle}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                {averageRating > 0 ? (
                  <>
                    <Text style={{ fontSize: fontSizes.size13, lineHeight: 18, color: colors.mauveTone9_2 }}>★</Text>
                    <DottedUnderline>
                      <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 18, color: colors.mauveTone9_2 }}>{averageRating.toFixed(2)} ({productCount} services available)</Text>
                    </DottedUnderline>
                  </>
                ) : (
                  <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 18, color: colors.mauveTone9_2 }}>{productCount} services available</Text>
                )}
              </View>
            </View>

            <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />
          </>
        ) : null}

        {!hideSectionPicker ? (
          <>
            <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25, flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 16 }}>
              {sections.map((section) => (
                <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: sectionCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.65 : 1 })}>
                  <View style={{ width: sectionImageSize, height: sectionImageSize, overflow: 'hidden', borderRadius: 8, borderCurve: 'continuous', backgroundColor: colors.violetTone98_3 }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="contain" style={{ width: sectionImageSize, height: sectionImageSize }} /> : null}</View>
                  <Text selectable numberOfLines={3} style={{ minHeight: 37, textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 18, color: colors.black }}>{section.title}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />
          </>
        ) : null}

        {visibleSections.map((section, sectionIndex) => (
          <View key={section.id} onLayout={(event) => { sectionOffsets.current[section.id] = event.nativeEvent.layout.y; }} style={{ paddingHorizontal: 20 }}>
            <Text selectable style={{ paddingTop: 30, paddingBottom: 4, fontSize: fontSizes.size23, lineHeight: 30, fontFamily: fontFamilies.semiBold, color: colors.black }}>{section.title}</Text>
            {section.products.length > 0 ? section.products.map((item, index) => {
              const { cartItem, quantity } = getCartSelection(item);
              return <View key={item.id} onLayout={(event) => { productOffsets.current[item.id] = event.nativeEvent.layout.y + (sectionOffsets.current[section.id] ?? 0); }}><ProductRow cartItem={cartItem} hidePriceUnderline={hidePriceUnderline} item={item} quantity={quantity} showEstimateLabel={showEstimateLabel} onAdd={onAdd} onPress={onProductPress} onRemove={onRemove} />{index < section.products.length - 1 ? <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} /> : null}</View>;
            }) : <Text selectable style={{ paddingVertical: 24, fontSize: fontSizes.size14, color: colors.violetTone47 }}>Products coming soon</Text>}
            {sectionIndex < visibleSections.length - 1 ? <View style={{ height: 8, marginHorizontal: -20, backgroundColor: colors.violetTone98_3 }} /> : null}
          </View>
        ))}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: insets.top + NAV_HEIGHT + (stickySection ? SECTION_HEADER_HEIGHT : 0),
          paddingTop: insets.top,
          backgroundColor: hideHeroImage || stickyHeaderVisible || stickySection ? colors.white : colors.transparent,
          boxShadow: stickyHeaderVisible || stickySection ? `0 3px 12px ${colors.violetTone10Alpha7}` : undefined,
        }}
      >
          <View style={{ height: NAV_HEIGHT, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: stickyHeaderVisible || stickySection ? 1 : 0, borderBottomColor: colors.violetTone98_3 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderCurve: 'continuous', borderWidth: alwaysShowNavButtonBorders ? 1 : 0, borderColor: colors.mauveTone89_4, backgroundColor: colors.white, opacity: pressed ? 0.58 : 1 })}
            >
              <BackIcon />
            </Pressable>

            {stickyHeaderVisible ? (
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, fontSize: fontSizes.size16, lineHeight: 22, fontFamily: fontFamilies.bold, color: colors.black }}>
                {displayCategoryTitle}
              </Text>
            ) : <View style={{ flex: 1 }} />}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search services"
              hitSlop={8}
              onPress={onSearchPress}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: alwaysShowNavButtonBorders || stickyHeaderVisible ? 1 : 0, borderColor: colors.mauveTone89_4, backgroundColor: colors.white, opacity: pressed ? 0.62 : 1 })}
            >
              <SearchIcon />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Share ${displayCategoryTitle}`}
              hitSlop={8}
              onPress={share}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: alwaysShowNavButtonBorders || stickyHeaderVisible ? 1 : 0, borderColor: colors.mauveTone89_4, backgroundColor: colors.white, opacity: pressed ? 0.62 : 1 })}
            >
              <ShareIcon />
            </Pressable>
          </View>
          {stickySection ? (
            <View style={{ height: SECTION_HEADER_HEIGHT, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 }}>
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: fontSizes.size13, lineHeight: 19, fontFamily: fontFamilies.bold, color: colors.black }}>
                {stickySection.title}
              </Text>
            </View>
          ) : null}
      </View>

      {sections.length > 0 ? (
        <Pressable
          onPress={openMenu}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: insets.bottom + (showEstimateFooter ? 130 : showCartFooter ? 86 : 24),
            alignSelf: 'center',
            height: 34,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 17,
            backgroundColor: colors.violetTone15_3,
            boxShadow: `0 5px 16px ${colors.blackAlpha22}`,
            opacity: pressed ? 0.78 : 1,
          })}
        >
          <View style={{ width: 12, height: 10, alignSelf: 'center', justifyContent: 'space-between' }}>
            <View style={{ width: 12, height: 1.5, borderRadius: 1, backgroundColor: colors.white }} />
            <View style={{ width: 12, height: 1.5, borderRadius: 1, backgroundColor: colors.white }} />
            <View style={{ width: 12, height: 1.5, borderRadius: 1, backgroundColor: colors.white }} />
          </View>
          <Text style={{ fontSize: fontSizes.size16, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.white }}>Menu</Text>
        </Pressable>
      ) : null}

      {showEstimateFooter ? <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.violetTone98_3,
          boxShadow: `0 -4px 16px ${colors.violetTone10Alpha6}`,
        }}
      >
        <View style={{ minHeight: ESTIMATE_NOTE_HEIGHT, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: colors.yellowTone95 }}>
          <EstimateNoteIcon />
          <Text selectable numberOfLines={2} style={{ flexShrink: 1, textAlign: 'center', fontSize: fontSizes.size12, lineHeight: 16, fontFamily: fontFamilies.semiBold, color: colors.yellowTone30 }}>
            Please generate an estimate first from the list above
          </Text>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 9 }}>
          <View
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={{ height: CONSULTATION_BUTTON_HEIGHT, alignItems: 'center', justifyContent: 'center', borderRadius: CONSULTATION_BUTTON_RADIUS, borderCurve: 'continuous', backgroundColor: colors.neutralTone93 }}
          >
            <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.neutralTone72 }}>Book Consultation at ₹49</Text>
          </View>
        </View>
      </View> : showCartFooter ? (
        <View
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10), flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.violetTone98_3, boxShadow: `0 -3px 10px ${colors.mauveTone9Alpha6}` }}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.black, fontVariant: ['tabular-nums'] }}>
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} added
            </Text>
            <Text selectable style={{ fontSize: fontSizes.size12, lineHeight: 17, color: colors.mauveTone43, fontVariant: ['tabular-nums'] }}>
              From {totalCartCategories} {totalCartCategories === 1 ? 'category' : 'categories'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View cart with ${totalCartItems} ${totalCartItems === 1 ? 'item' : 'items'}`}
            onPress={onViewCart}
            style={({ pressed }) => ({ width: Math.min(172, width * 0.44), height: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderCurve: 'continuous', backgroundColor: colors.violetTone58, opacity: pressed ? 0.78 : 1 })}
          >
            <Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: colors.white }}>View cart</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 72 + insets.bottom }}>
          <AnimatedPressable onPress={closeMenu} style={[{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha72 }, menuFadeStyle]} />
          <Animated.View style={[{ paddingHorizontal: 16 }, menuCardStyle]}>
            <View style={{ paddingHorizontal: 12, paddingTop: 22, paddingBottom: 25, borderRadius: 22, borderCurve: 'continuous', backgroundColor: colors.white }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 22 }}>
                {sections.map((section) => (
                  <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: modalCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}>
                    <View style={{ width: modalImageSize, height: modalImageSize, overflow: 'hidden', borderRadius: 8, borderCurve: 'continuous', backgroundColor: colors.violetTone98_3 }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="contain" style={{ width: modalImageSize, height: modalImageSize }} /> : null}</View>
                    <Text selectable numberOfLines={2} style={{ width: '100%', minHeight: 36, textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 18, color: colors.black }}>{section.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <CloseButton accessibilityLabel="Close menu" onPress={closeMenu} style={{ marginTop: CLOSE_BUTTON_GAP, alignSelf: 'center' }} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
