import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function ShareIcon() {
  return (
    <View style={{ width: 19, height: 19 }}>
      <View style={{ position: 'absolute', left: 4.5, top: 6, width: 10, height: 1.7, borderRadius: 2, backgroundColor: '#171419', transform: [{ rotate: '-29deg' }] }} />
      <View style={{ position: 'absolute', left: 4.5, top: 11.5, width: 10, height: 1.7, borderRadius: 2, backgroundColor: '#171419', transform: [{ rotate: '29deg' }] }} />
      <View style={{ position: 'absolute', left: 1, top: 7, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
      <View style={{ position: 'absolute', right: 1, top: 1.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
      <View style={{ position: 'absolute', right: 1, bottom: 1.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
    </View>
  );
}

function EstimateNoteIcon() {
  const color = '#9A6C00';
  return (
    <View style={{ width: 15, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 11, height: 13, paddingHorizontal: 2, paddingTop: 2.5, gap: 2, borderWidth: 1.2, borderColor: color, borderRadius: 1.5 }}>
        <View style={{ width: 6, height: 1.1, borderRadius: 1, backgroundColor: color }} />
        <View style={{ width: 6, height: 1.1, borderRadius: 1, backgroundColor: color }} />
        <View style={{ width: 4.5, height: 1.1, borderRadius: 1, backgroundColor: color }} />
      </View>
    </View>
  );
}

function ProductRow({ item, quantity, onAdd, onPress, onRemove }: { item: ServiceItem; quantity: number; onAdd: (item: ServiceItem) => void; onPress: (item: ServiceItem) => void; onRemove: (item: ServiceItem) => void }) {
  return (
    <Pressable onPress={() => onPress(item)} style={({ pressed }) => ({ paddingVertical: 22, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <Text selectable numberOfLines={3} style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', color: '#171419' }}>{item.title}</Text>
          {item.rating > 0 ? (
            <Text selectable style={{ fontSize: 14, color: '#625D64' }}>★ {item.rating} ({item.reviews} reviews)</Text>
          ) : null}
          <Text selectable style={{ fontSize: 15, lineHeight: 21, color: '#625D64' }}>
            <Text style={{ fontWeight: '600', color: '#171419' }}>{item.variants?.length ? 'Starts at ' : ''}₹{item.price.toLocaleString('en-IN')}</Text>
            {item.duration ? `  •  ${item.duration}` : ''}
          </Text>
          {item.description ? <Text selectable numberOfLines={3} style={{ fontSize: 13, lineHeight: 19, color: '#625D64' }}>{item.description}</Text> : null}
          <Text style={{ paddingTop: 5, fontSize: 15, lineHeight: 20, fontWeight: '600', color: '#6E45E2' }}>View details and estimate</Text>
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
              style={({ pressed }) => ({ width: 96, height: 42, marginTop: -20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', borderWidth: 1, borderColor: '#E3DFE7', backgroundColor: pressed ? '#F4F0FF' : '#FFFFFF' })}
            >
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#6E45E2' }}>Add</Text>
            </Pressable>
          ) : (
            <View style={{ height: 42, marginTop: -20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderRadius: 10, backgroundColor: '#6E45E2' }}>
              <Pressable onPress={(event) => { event.stopPropagation(); onRemove(item); }} style={{ width: 34, height: 42, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: '#FFFFFF' }}>−</Text></Pressable>
              <Text style={{ minWidth: 25, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>{quantity}</Text>
              <Pressable onPress={(event) => { event.stopPropagation(); onAdd(item); }} style={{ width: 34, height: 42, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: '#FFFFFF' }}>+</Text></Pressable>
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
  const heroProgress = useSharedValue(0);

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
  const productCount = sections.reduce((total, section) => total + section.products.length, 0);
  const ratedProducts = sections.flatMap((section) => section.products).filter((item) => item.rating > 0);
  const averageRating = ratedProducts.length ? ratedProducts.reduce((total, item) => total + item.rating, 0) / ratedProducts.length : 0;
  const sectionCardWidth = Math.floor((Math.min(width, 520) - 80) / 3);
  const modalCardWidth = Math.floor((Math.min(width, 520) - 108) / 3);

  const scrollToSection = (section: ProductSection) => {
    setMenuVisible(false);
    const offset = sectionOffsets.current[section.id];
    if (offset !== undefined) requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, offset - 70), animated: true }));
  };

  const share = () => void Share.share({ message: `Explore ${categoryTitle} services on Urban Clap.` });

  if (isLoading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF' }}><ActivityIndicator color="#6E45E2" /><Text style={{ fontSize: 13, color: '#625D64' }}>Loading services...</Text></View>;
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
          const shouldShow = event.nativeEvent.contentOffset.y >= 238;
          if (shouldShow !== stickyHeaderVisible) setStickyHeaderVisible(shouldShow);
        }}
        contentContainerStyle={{ paddingBottom: 190 + insets.bottom }}
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
          <Text selectable style={{ fontSize: 15, color: '#3F3A42' }}>{averageRating > 0 ? `★  ${averageRating.toFixed(2)} · ` : ''}{productCount} services available</Text>
        </View>

        <View style={{ height: 9, backgroundColor: '#F5F4F5' }} />

        <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 22 }}>
          {sections.map((section) => (
            <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: sectionCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.65 : 1 })}>
              <View style={{ width: sectionCardWidth, height: sectionCardWidth, overflow: 'hidden', borderRadius: 13, backgroundColor: '#F2F1F3' }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="cover" style={{ position: 'absolute', inset: 0 }} /> : null}</View>
              <Text selectable numberOfLines={3} style={{ minHeight: 37, textAlign: 'center', fontSize: 13, lineHeight: 18, color: '#171419' }}>{section.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 9, backgroundColor: '#F5F4F5' }} />

        {visibleSections.map((section) => (
          <View key={section.id} onLayout={(event) => { sectionOffsets.current[section.id] = event.nativeEvent.layout.y; }} style={{ paddingHorizontal: 20 }}>
            <Text selectable style={{ paddingTop: 30, paddingBottom: 4, fontSize: 23, lineHeight: 30, fontWeight: '600', color: '#171419' }}>{section.title}</Text>
            {section.products.length > 0 ? section.products.map((item, index) => <View key={item.id}><ProductRow item={item} quantity={cart[item.id] ?? 0} onAdd={onAdd} onPress={onProductPress} onRemove={onRemove} />{index < section.products.length - 1 ? <View style={{ height: 1, backgroundColor: '#E5E2E6' }} /> : null}</View>) : <Text selectable style={{ paddingVertical: 24, fontSize: 14, color: '#77717D' }}>Products coming soon</Text>}
            <View style={{ height: 9, marginHorizontal: -20, backgroundColor: '#F5F4F5' }} />
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
          height: insets.top + 66,
          paddingTop: insets.top,
          backgroundColor: stickyHeaderVisible ? '#FFFFFF' : 'transparent',
          borderBottomWidth: stickyHeaderVisible ? 1 : 0,
          borderBottomColor: '#E7E5E8',
          boxShadow: stickyHeaderVisible ? '0 3px 12px rgba(25, 20, 30, 0.07)' : undefined,
        }}
      >
          <View style={{ height: 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 0, backgroundColor: stickyHeaderVisible ? 'transparent' : '#FFFFFF', opacity: pressed ? 0.58 : 1 })}
            >
              <Text style={{ fontSize: 23, lineHeight: 25, fontWeight: '400', color: '#171419' }}>←</Text>
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
                <View style={{ width: 17, height: 17 }}><View style={{ position: 'absolute', left: 1, top: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 1.7, borderColor: '#171419' }} /><View style={{ position: 'absolute', right: 0, bottom: 2, width: 6.5, height: 1.7, backgroundColor: '#171419', transform: [{ rotate: '45deg' }] }} /></View>
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
      </View>

      {sections.length > 0 ? <Pressable onPress={() => setMenuVisible(true)} style={({ pressed }) => ({ position: 'absolute', bottom: insets.bottom + 130, alignSelf: 'center', height: 48, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 24, backgroundColor: '#272529', boxShadow: '0 5px 16px rgba(0,0,0,0.22)', opacity: pressed ? 0.78 : 1 })}><Text style={{ fontSize: 19, color: '#FFFFFF' }}>☰</Text><Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Menu</Text></Pressable> : null}

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

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.72)' }}>
          <View style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 25, borderRadius: 22, borderCurve: 'continuous', backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 22 }}>
              {sections.map((section) => (
                <Pressable key={section.id} onPress={() => scrollToSection(section)} style={({ pressed }) => ({ width: modalCardWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}>
                  <View style={{ width: modalCardWidth, height: modalCardWidth, overflow: 'hidden', borderRadius: 12, backgroundColor: '#F2F1F3' }}>{section.imageUrl ? <Image source={section.imageUrl} contentFit="cover" style={{ position: 'absolute', inset: 0 }} /> : null}</View>
                  <Text selectable numberOfLines={3} style={{ minHeight: 36, textAlign: 'center', fontSize: 13, lineHeight: 18, color: '#171419' }}>{section.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable accessibilityLabel="Close menu" onPress={() => setMenuVisible(false)} style={({ pressed }) => ({ width: 54, height: 54, marginTop: 22, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: '#FFFFFF', opacity: pressed ? 0.72 : 1 })}><Text style={{ fontSize: 32, lineHeight: 34, fontWeight: '300', color: '#171419' }}>×</Text></Pressable>
        </View>
      </Modal>
    </View>
  );
}
