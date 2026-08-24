import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { DottedUnderline } from '../../components/dotted-underline';
import { EstimateNoteIcon } from '../../components/estimate-note-icon';
import type { ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCategoryProducts, type ProductSection } from '../../hooks/use-category-products';

type ServiceListScreenProps = {
  cart: Record<string, number>;
  categoryTitle: string;
  subcategory: ServiceSubcategory;
  onAdd: (item: ServiceItem) => void;
  onBack: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => void;
};

const HERO_DURATION = 4_500;
const NAV_HEIGHT = 66;
const SECTION_HEADER_HEIGHT = 46;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LoadingDot({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 180 }),
        ),
        -1,
      ),
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.42, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -5]) },
      { scale: interpolate(progress.value, [0, 1], [0.86, 1]) },
    ],
  }));

    return <Animated.View style={[{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#6E45E2' }, animatedStyle]} />;
}

function ThreeDotLoader() {
  return (
    <View accessibilityLabel="Loading services" accessibilityRole="progressbar" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <LoadingDot delay={0} />
      <LoadingDot delay={130} />
      <LoadingDot delay={260} />
    </View>
  );
}

function SearchIcon() {
  return (
    <Image
      source={require('../../../assets/search.png')}
      contentFit="contain"
      tintColor="#171419"
      style={{ width: 18, height: 18 }}
    />
  );
}

function ShareIcon() {
  return (
    <Image
      source={require('../../../assets/share.png')}
      contentFit="contain"
      tintColor="#171419"
      style={{ width: 18, height: 18 }}
    />
  );
}

function ProductRow({ item, quantity, onAdd, onPress, onRemove }: { item: ServiceItem; quantity: number; onAdd: (item: ServiceItem) => void; onPress: (item: ServiceItem) => void; onRemove: (item: ServiceItem) => void }) {
  return (
    <Pressable onPress={() => onPress(item)} style={({ pressed }) => ({ paddingVertical: 22, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <Text selectable numberOfLines={3} style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', color: '#171419' }}>{item.title}</Text>
          {item.rating > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
              <Text style={{ fontSize: 12, lineHeight: 18, color: '#625D64' }}>★</Text>
              <DottedUnderline>
                <Text selectable style={{ fontSize: 12, lineHeight: 18, color: '#625D64' }}>{item.rating} ({item.reviews} reviews)</Text>
              </DottedUnderline>
            </View>
          ) : null}
          <DottedUnderline fullWidth lineMarginTop={10} dotColor="#DDD9DE">
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
              <Text selectable style={{ fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#171419' }}>{item.variants?.length ? 'Starts at ' : ''}₹{item.price.toLocaleString('en-IN')}</Text>
              {item.duration ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={{ fontSize: 16, lineHeight: 18, color: '#625D64' }}>•</Text>
                  <Text selectable style={{ fontSize: 12, lineHeight: 18, color: '#625D64' }}>{item.duration}</Text>
                </View>
              ) : null}
            </View>
          </DottedUnderline>
          {item.description ? <Text selectable numberOfLines={3} style={{ fontSize: 13, lineHeight: 19, color: '#625D64' }}>{item.description}</Text> : null}
          <Text style={{ paddingTop: 5, fontSize: 14, lineHeight: 19, fontWeight: '600', color: '#6E45E2' }}>View details and estimate</Text>
        </View>

        <View style={{ width: 132, alignItems: 'center' }}>
          <View style={{ width: 132, height: 132, overflow: 'hidden', borderRadius: 13, borderCurve: 'continuous', backgroundColor: '#F2F1F3' }}>
            {item.imageUrl ? <Image source={item.imageUrl} contentFit="cover" transition={180} style={{ position: 'absolute', inset: 0 }} /> : null}
          </View>
          {quantity === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                if (item.variants?.length) onPress(item);
                else onAdd(item);
              }}
              style={({ pressed }) => ({ width: 78, height: 32, marginTop: -20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: pressed ? '#F4F0FF' : '#FFFFFF', boxShadow: '0 1px 6px rgba(23, 20, 25, 0.16)' })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#6E45E2' }}>Add</Text>
            </Pressable>
          ) : (
            <View style={{ width: 78, height: 32, marginTop: -20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderRadius: 10, backgroundColor: '#6E45E2' }}>
              <Pressable onPress={(event) => { event.stopPropagation(); onRemove(item); }} style={{ width: 26, height: 32, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: '#FFFFFF' }}>−</Text></Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>{quantity}</Text>
              <Pressable onPress={(event) => { event.stopPropagation(); onAdd(item); }} style={{ width: 26, height: 32, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: '#FFFFFF' }}>+</Text></Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function ServiceListScreen({ cart, categoryTitle, subcategory, onAdd, onBack, onProductPress, onRemove }: ServiceListScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { errorMessage, isLoading, retry, sections } = useCategoryProducts(subcategory.id);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [stickyHeaderVisible, setStickyHeaderVisible] = useState(false);
  const [stickySection, setStickySection] = useState<ProductSection | null>(null);
  const heroProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);

  const heroItems = useMemo(() => {
    const items = sections.flatMap((section) => section.products.map((product) => ({ imageUrl: product.imageUrl || section.imageUrl, title: product.title, subtitle: product.description })));
    const unique = items.filter((item, index) => item.imageUrl && items.findIndex((candidate) => candidate.imageUrl === item.imageUrl) === index);
    if (unique.length > 0) return unique.slice(0, 5);
    return subcategory.imageUrl ? [{ imageUrl: subcategory.imageUrl, title: categoryTitle, subtitle: subcategory.subtitle }] : [];
  }, [categoryTitle, sections, subcategory.imageUrl, subcategory.subtitle]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleSections = useMemo(
    () => sections
      .map((section) => ({ ...section, products: normalizedSearch ? section.products.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(normalizedSearch)) : section.products }))
      .filter((section) => !normalizedSearch || section.title.toLowerCase().includes(normalizedSearch) || section.products.length > 0),
    [normalizedSearch, sections],
  );

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
  const sectionCardWidth = Math.floor((Math.min(width, 520) - 80) / 3);
  const modalCardWidth = Math.floor((Math.min(width, 520) - 80) / 3);
  const modalImageSize = Math.floor(modalCardWidth * 0.82);

  const scrollToSection = (section: ProductSection) => {
    closeMenu();
    const offset = sectionOffsets.current[section.id];
    if (offset !== undefined) requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, offset - (insets.top + NAV_HEIGHT + SECTION_HEADER_HEIGHT) + 10), animated: true }));
  };

  const share = () => void Share.share({ message: `Explore ${categoryTitle} services on Urban Clap.` });

  if (isLoading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}><ThreeDotLoader /></View>;
  }

  if (errorMessage) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: '#FFFFFF' }}><Text selectable style={{ textAlign: 'center', fontSize: 13, lineHeight: 19, color: '#625D64' }}>{errorMessage}</Text><Pressable onPress={retry} style={{ paddingHorizontal: 20, paddingVertical: 11, borderRadius: 999, backgroundColor: '#6E45E2' }}><Text style={{ fontWeight: '600', color: '#FFFFFF' }}>Try again</Text></Pressable></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const shouldShow = y >= 238;
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
        contentContainerStyle={{ paddingBottom: 118 + insets.bottom }}
      >
        <View style={{ height: 310, backgroundColor: '#CBC6DD' }}>
          {heroItems[heroIndex]?.imageUrl ? (
            <Animated.View key={`${heroIndex}-${heroItems[heroIndex].imageUrl}`} entering={FadeIn.duration(280)} style={{ position: 'absolute', inset: 0 }}>
              <Image source={heroItems[heroIndex].imageUrl} contentFit="cover" contentPosition="center" transition={120} style={{ position: 'absolute', inset: 0 }} />
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(17, 10, 25, 0.26)' }} />
            </Animated.View>
          ) : null}

          {heroItems[heroIndex] ? <View style={{ position: 'absolute', left: 28, right: 28, bottom: 43, gap: 5 }}><Text selectable numberOfLines={2} style={{ maxWidth: '82%', fontSize: 23, lineHeight: 29, fontWeight: '600', color: '#FFFFFF' }}>{heroItems[heroIndex].title}</Text><Text selectable numberOfLines={2} style={{ maxWidth: '82%', fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.88)' }}>{heroItems[heroIndex].subtitle}</Text></View> : null}

          {heroItems.length > 1 ? <View style={{ position: 'absolute', left: 20, right: 20, bottom: 17, flexDirection: 'row', gap: 5 }}>{heroItems.map((item, index) => <View key={`${item.imageUrl}-${index}`} style={{ flex: 1, height: 3, overflow: 'hidden', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.38)' }}>{index < heroIndex ? <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} /> : index === heroIndex ? <Animated.View style={[{ flex: 1, backgroundColor: '#FFFFFF', transformOrigin: 'left' }, activeProgressStyle]} /> : null}</View>)}</View> : null}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 22, gap: 7 }}>
          <Text selectable style={{ fontSize: 25, lineHeight: 32, fontWeight: '600', color: '#171419' }}>{categoryTitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
            {averageRating > 0 ? (
              <>
                <Text style={{ fontSize: 13, lineHeight: 18, color: '#171419' }}>★</Text>
                <DottedUnderline>
                  <Text selectable style={{ fontSize: 13, lineHeight: 18, color: '#171419' }}>{averageRating.toFixed(2)} ({productCount} services available)</Text>
                </DottedUnderline>
              </>
            ) : (
              <Text selectable style={{ fontSize: 13, lineHeight: 18, color: '#171419' }}>{productCount} services available</Text>
            )}
          </View>
        </View>

        <View style={{ height: 8, backgroundColor: '#F5F4F5' }} />

        <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 22 }}>
          {sections.map((section) => (
            <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: sectionCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.65 : 1 })}>
              <View style={{ width: sectionCardWidth, height: sectionCardWidth, overflow: 'hidden', borderRadius: 8, borderCurve: 'continuous', backgroundColor: '#EEEEEE' }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="cover" style={{ position: 'absolute', inset: 0 }} /> : null}</View>
              <Text selectable numberOfLines={3} style={{ minHeight: 37, textAlign: 'center', fontSize: 13, lineHeight: 18, color: '#171419' }}>{section.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 8, backgroundColor: '#F5F4F5' }} />

        {visibleSections.map((section, sectionIndex) => (
          <View key={section.id} onLayout={(event) => { sectionOffsets.current[section.id] = event.nativeEvent.layout.y; }} style={{ paddingHorizontal: 20 }}>
            <Text selectable style={{ paddingTop: 30, paddingBottom: 4, fontSize: 23, lineHeight: 30, fontWeight: '600', color: '#171419' }}>{section.title}</Text>
            {section.products.length > 0 ? section.products.map((item, index) => <View key={item.id}><ProductRow item={item} quantity={cart[item.id] ?? 0} onAdd={onAdd} onPress={onProductPress} onRemove={onRemove} />{index < section.products.length - 1 ? <View style={{ height: 1, backgroundColor: '#E5E2E6' }} /> : null}</View>) : <Text selectable style={{ paddingVertical: 24, fontSize: 14, color: '#77717D' }}>Products coming soon</Text>}
            {sectionIndex < visibleSections.length - 1 ? <View style={{ height: 8, marginHorizontal: -20, backgroundColor: '#F5F4F5' }} /> : null}
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
          backgroundColor: stickyHeaderVisible || stickySection ? '#FFFFFF' : 'transparent',
          boxShadow: stickyHeaderVisible || stickySection ? '0 3px 12px rgba(25, 20, 30, 0.07)' : undefined,
        }}
      >
          <View style={{ height: NAV_HEIGHT, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: stickyHeaderVisible || stickySection ? 1 : 0, borderBottomColor: '#E7E5E8' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderCurve: 'continuous', backgroundColor: '#FFFFFF', opacity: pressed ? 0.58 : 1 })}
            >
              <BackIcon />
            </Pressable>

            {searchVisible ? (
              <View style={{ flex: 1, height: 40, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, backgroundColor: '#F4F3F5' }}>
                <TextInput
                  autoFocus
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search services"
                  placeholderTextColor="#918A97"
                  style={{ flex: 1, fontSize: 14, color: '#171419' }}
                />
              </View>
            ) : stickyHeaderVisible ? (
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, fontSize: 18, lineHeight: 24, fontWeight: '600', color: '#171419' }}>
                {categoryTitle}
              </Text>
            ) : <View style={{ flex: 1 }} />}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={searchVisible ? 'Close search' : 'Search services'}
              hitSlop={8}
              onPress={() => setSearchVisible((current) => !current)}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: stickyHeaderVisible ? 1 : 0, borderColor: '#E5E2E6', backgroundColor: '#FFFFFF', opacity: pressed ? 0.62 : 1 })}
            >
              {searchVisible ? (
                <Text style={{ fontSize: 25, lineHeight: 27, fontWeight: '300', color: '#171419' }}>×</Text>
              ) : (
                <SearchIcon />
              )}
            </Pressable>

            {!searchVisible ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Share ${categoryTitle}`}
                hitSlop={8}
                onPress={share}
                style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: stickyHeaderVisible ? 1 : 0, borderColor: '#E5E2E6', backgroundColor: '#FFFFFF', opacity: pressed ? 0.62 : 1 })}
              >
                <ShareIcon />
              </Pressable>
            ) : null}
          </View>
          {stickySection ? (
            <View style={{ height: SECTION_HEADER_HEIGHT, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7E5E8' }}>
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#171419' }}>
                {stickySection.title}
              </Text>
            </View>
          ) : null}
      </View>

      {sections.length > 0 ? <Pressable onPress={openMenu} style={({ pressed }) => ({ position: 'absolute', bottom: insets.bottom + 130, alignSelf: 'center', height: 36, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, backgroundColor: '#272529', boxShadow: '0 5px 16px rgba(0,0,0,0.22)', opacity: pressed ? 0.78 : 1 })}><Text style={{ fontSize: 19, color: '#FFFFFF' }}>☰</Text><Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Menu</Text></Pressable> : null}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEECEF',
          boxShadow: '0 -4px 16px rgba(25, 20, 30, 0.06)',
        }}
      >
        <View style={{ minHeight: 38, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF8E7' }}>
          <EstimateNoteIcon />
          <Text selectable numberOfLines={2} style={{ flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#9A6C00' }}>
            Please generate an estimate first from the list above
          </Text>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <View
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={{ height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#EEEEEE' }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#B7B5B8' }}>Book Consultation at ₹49</Text>
          </View>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 72 + insets.bottom }}>
          <AnimatedPressable onPress={closeMenu} style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }, menuFadeStyle]} />
          <Animated.View style={[{ paddingHorizontal: 16 }, menuCardStyle]}>
            <View style={{ paddingHorizontal: 12, paddingTop: 22, paddingBottom: 25, borderRadius: 22, borderCurve: 'continuous', backgroundColor: '#FFFFFF' }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 22 }}>
                {sections.map((section) => (
                  <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: modalCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}>
                    <View style={{ width: modalImageSize, height: modalImageSize, overflow: 'hidden', borderRadius: 8, borderCurve: 'continuous', backgroundColor: '#EEEEEE' }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="cover" style={{ position: 'absolute', inset: 0 }} /> : null}</View>
                    <Text selectable numberOfLines={2} style={{ width: '100%', minHeight: 36, textAlign: 'center', fontSize: 13, lineHeight: 18, color: '#171419' }}>{section.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable accessibilityLabel="Close menu" onPress={closeMenu} style={({ pressed }) => ({ width: 44, height: 44, marginTop: 22, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#FFFFFF', opacity: pressed ? 0.72 : 1 })}><Text style={{ fontSize: 28, lineHeight: 30, fontWeight: '300', color: '#171419' }}>×</Text></Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
