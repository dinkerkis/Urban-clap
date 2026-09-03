import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { TextInput } from '../../components/app-text-input';
import { Text } from '../../components/app-text';
import Animated, { useAnimatedReaction, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { DEFAULT_OFFER_HEADER_COLOR, OfferCarousel } from '../../components/offer-carousel';
import { LoadingDots } from '../../components/loading-dots';
import { SearchIcon } from '../../components/search-icon';
import type { ServiceCategory } from '../../data/service-catalog';
import { useCurrentLocation } from '../../hooks/use-current-location';
import { useHomePromotionalBanner } from '../../hooks/use-home-promotional-banner';
import { useHomeSpotlights } from '../../hooks/use-home-spotlights';
import type { HomeSpotlight } from '../../services/home-spotlights-api';

const SEARCH_SUGGESTIONS = ['AC service', 'Facial', 'Kitchen cleaning'];

function lightenHexColor(color: string, whiteMix = 0.54) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (!match) return '#D1C6F6';
  const channels = match.slice(1).map((channel) => Number.parseInt(channel, 16));
  const lightened = channels.map((channel) => Math.round(channel + (255 - channel) * whiteMix));
  return `#${lightened.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function formatCategoryLabel(title: string) {
  const normalizedTitle = title.trim().toLowerCase();
  if (normalizedTitle === "women's salon & spa") {
    return `${title.replace(/\s+spa$/i, '')}\nSpa`;
  }
  if (normalizedTitle === 'ac & appliance repair') {
    return `${title.replace(/\s+repair$/i, '')}\nRepair`;
  }

  const commaIndex = title.indexOf(', ');
  const ampIndex = title.lastIndexOf(' & ');
  if (commaIndex >= 0 && ampIndex > commaIndex) {
    return `${title.slice(0, ampIndex)}\n& ${title.slice(ampIndex + 3)}`;
  }
  return title;
}

function LocationPinIcon() {
  return <Image source={require('../../../assets/pin.png')} contentFit="contain" tintColor={colors.white} style={{ width: 18, height: 18 }} />;
}

function ChevronDownIcon() {
  return (
    <View style={{ width: 10, height: 7, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 7,
          height: 7,
          marginTop: -3,
          borderRightWidth: 1.7,
          borderBottomWidth: 1.7,
          borderColor: colors.white,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function SearchBar({ displayedSuggestion, onChangeText, search, sticky = false }: { displayedSuggestion: string; onChangeText: (value: string) => void; search: string; sticky?: boolean }) {
  return (
    <View
      style={{
        height: sticky ? 44 : 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderCurve: 'continuous',
        borderWidth: sticky ? 1 : 0,
        borderColor: colors.mauveTone89,
        backgroundColor: colors.white,
        boxShadow: sticky ? `0 2px 8px ${colors.blackAlpha12}` : undefined,
      }}
    >
      <SearchIcon />
      <View style={{ flex: 1, height: 40, justifyContent: 'center' }}>
        {!search ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' }}>
            {displayedSuggestion ? (
              <>
                <Text style={{ fontSize: fontSizes.size13, color: colors.violetTone57 }}>Search for '</Text>
                <View style={{ height: 20, flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
                  <Text numberOfLines={1} style={{ fontSize: fontSizes.size13, color: colors.violetTone57 }}>{`${displayedSuggestion}'`}</Text>
                </View>
              </>
            ) : (
              <Text style={{ fontSize: fontSizes.size13, color: colors.violetTone57 }}>Search for services</Text>
            )}
          </View>
        ) : null}
        <TextInput
          value={search}
          onChangeText={onChangeText}
          accessibilityLabel="Search for services"
          returnKeyType="search"
          style={{ flex: 1, minHeight: 40, paddingVertical: 6, fontSize: fontSizes.size13, color: colors.violetTone14 }}
        />
      </View>
    </View>
  );
}

type HomeScreenProps = {
  categories: ServiceCategory[];
  errorMessage: string;
  isLoading: boolean;
  locationSubtitle?: string;
  locationTitle?: string;
  onCategoryPress: (category: ServiceCategory) => void;
  onLocationPress: () => void;
  onSpotlightPress: (spotlight: HomeSpotlight) => void;
  onSeeAllCategories: () => void;
  onProfilePress: () => void;
  onRetry: () => void;
};

export function HomeScreen({ categories, errorMessage, isLoading, locationSubtitle, locationTitle, onCategoryPress, onLocationPress, onProfilePress, onRetry, onSpotlightPress }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [searchSuggestionIndex, setSearchSuggestionIndex] = useState(0);
  const [displayedSuggestion, setDisplayedSuggestion] = useState('');
  const [isDeletingSuggestion, setIsDeletingSuggestion] = useState(false);
  const currentLocation = useCurrentLocation();
  const promotionalBanner = useHomePromotionalBanner();
  const spotlights = useHomeSpotlights();
  const [spotlightScrollProgress, setSpotlightScrollProgress] = useState(0);
  const [stickySearchVisible, setStickySearchVisible] = useState(false);
  const [stickyHeaderWhite, setStickyHeaderWhite] = useState(false);
  const scrollY = useSharedValue(0);
  const stickySearchThreshold = useSharedValue(10_000);
  const stickyWhiteThreshold = useSharedValue(10_000);
  const { width } = useWindowDimensions();
  const categoryWidth = Math.min(125, Math.max(88, Math.floor((width - 32 - 24) / 3)));
  const categoryHeight = 64;
  const categoryImageWidth = 64;
  const categoryImageHeight = 48;
  // Keep the field typeable while search/filter behavior is temporarily inactive.
  const normalizedSearch = '';
  const bannerSlides = promotionalBanner?.slides ?? [];
  const headerBackgroundUrl = promotionalBanner?.backgroundImageUrl;
  const stickyBannerColor = lightenHexColor(promotionalBanner?.backgroundColor ?? DEFAULT_OFFER_HEADER_COLOR);
  const visibleCategories = useMemo(
    () =>
      normalizedSearch
        ? categories.filter(
            (category) =>
              category.title.toLowerCase().includes(normalizedSearch) ||
              category.subcategories.some((subcategory) => subcategory.title.toLowerCase().includes(normalizedSearch)),
          )
        : categories,
    [categories, normalizedSearch],
  );

  useEffect(() => {
    const suggestion = SEARCH_SUGGESTIONS[searchSuggestionIndex];
    let delay = isDeletingSuggestion ? 40 : 70;

    if (!isDeletingSuggestion && displayedSuggestion.length === suggestion.length) {
      delay = 1_000;
    } else if (isDeletingSuggestion && displayedSuggestion.length === 0) {
      delay = 250;
    }

    const timer = setTimeout(() => {
      if (!isDeletingSuggestion && displayedSuggestion.length < suggestion.length) {
        setDisplayedSuggestion(suggestion.slice(0, displayedSuggestion.length + 1));
        return;
      }

      if (!isDeletingSuggestion) {
        setIsDeletingSuggestion(true);
        return;
      }

      if (displayedSuggestion.length > 0) {
        setDisplayedSuggestion((current) => current.slice(0, -1));
        return;
      }

      setIsDeletingSuggestion(false);
      setSearchSuggestionIndex((current) => (current + 1) % SEARCH_SUGGESTIONS.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedSuggestion, isDeletingSuggestion, searchSuggestionIndex]);

  const locationHeading = locationTitle || 'In 44 minutes';
  const locationLine = locationSubtitle || currentLocation.label;
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  useAnimatedReaction(
    () => scrollY.get() >= stickySearchThreshold.get(),
    (visible, wasVisible) => {
      if (visible !== wasVisible) scheduleOnRN(setStickySearchVisible, visible);
    },
  );

  useAnimatedReaction(
    () => scrollY.get() >= stickyWhiteThreshold.get(),
    (white, wasWhite) => {
      if (white !== wasWhite) scheduleOnRN(setStickyHeaderWhite, white);
    },
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.violetTone98_2 }}>
    <Animated.ScrollView
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.violetTone98_2 }}
      contentContainerStyle={{ paddingBottom: 126 + insets.bottom }}
    >
      <View
        onLayout={({ nativeEvent }) => {
          const stickyHeaderHeight = Math.max(insets.top, 8) + 54;
          stickyWhiteThreshold.set(Math.max(0, nativeEvent.layout.height - stickyHeaderHeight));
        }}
        style={{
          paddingTop: process.env.EXPO_OS === 'ios' ? 56 : insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 0,
          gap: 14,
          overflow: 'hidden',
          backgroundColor: DEFAULT_OFFER_HEADER_COLOR,
        }}
      >
        {headerBackgroundUrl ? (
          <Image
            source={{ uri: headerBackgroundUrl }}
            contentFit="cover"
            transition={180}
            style={{ position: 'absolute', inset: 0 }}
          />
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${locationLine}`}
            onPress={onLocationPress}
            style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.7 : 1 })}
          >
            <LocationPinIcon />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: fontSizes.size16, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: colors.whiteAlpha90 }}>{locationHeading}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {!locationSubtitle && currentLocation.status === 'loading' && <LoadingDots color={colors.white} gap={5} size={5} />}
                <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1, fontSize: fontSizes.size12, lineHeight: 17, fontFamily: fontFamilies.medium, color: colors.whiteAlpha90 }}>
                  {locationLine}
                </Text>
                <ChevronDownIcon />
              </View>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open account options"
            onPress={onProfilePress}
            style={({ pressed }) => ({ width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: colors.white, opacity: pressed ? 0.7 : 1 })}
          >
            <Image source={require('../../../assets/profile.png')} contentFit="contain" style={{ width: 16, height: 16 }} />
          </Pressable>
        </View>

        <View
          onLayout={({ nativeEvent }) => {
            stickySearchThreshold.set(nativeEvent.layout.y - insets.top);
          }}
        >
          <SearchBar displayedSuggestion={displayedSuggestion} onChangeText={setSearch} search={search} />
        </View>

        {!normalizedSearch && bannerSlides.length > 0 ? <OfferCarousel embeddedOnPurple slides={bannerSlides} /> : null}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 25 }}>
        <View style={{ gap: 15 }}>
          {normalizedSearch ? (
            <Text selectable style={{ fontSize: fontSizes.size19, lineHeight: 25, fontFamily: fontFamilies.semiBold, color: colors.violetTone13 }}>
              Search results
            </Text>
          ) : null}
          {isLoading ? (
            <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <LoadingDots />
              <Text style={{ fontSize: fontSizes.size12, color: colors.violetTone47 }}>Loading categories...</Text>
            </View>
          ) : errorMessage ? (
            <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: fontSizes.size28 }}>⚠️</Text>
              <Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size12, lineHeight: 17, color: colors.violetTone47 }}>{errorMessage}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.violetTone58 }}>
                <Text style={{ fontSize: fontSizes.size12, fontFamily: fontFamilies.semiBold, color: colors.white }}>Try again</Text>
              </Pressable>
            </View>
          ) : visibleCategories.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {visibleCategories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  onPress={() => onCategoryPress(category)}
                  style={({ pressed }) => ({ width: categoryWidth, alignItems: 'center', gap: 6, opacity: pressed ? 0.62 : 1 })}
                >
                  <View style={{ width: categoryWidth, height: categoryHeight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8, borderCurve: 'continuous', backgroundColor: colors.violetTone98_3 }}>
                    <Text style={{ fontSize: fontSizes.size22 }}>{category.icon}</Text>
                    {category.imageUrl ? (
                      <Image
                        source={category.imageUrl}
                        contentFit="contain"
                        transition={180}
                        style={{ position: 'absolute', width: categoryImageWidth, height: categoryImageHeight }}
                      />
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      width: categoryWidth + 8,
                      minHeight: 32,
                      paddingHorizontal: 0,
                      textAlign: 'center',
                      fontSize: fontSizes.size12,
                      lineHeight: 16,
                      fontFamily: fontFamilies.regular,
                      color: colors.black,
                    }}
                  >
                    {formatCategoryLabel(category.title)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center', gap: 7 }}>
              <Text style={{ fontSize: fontSizes.size28 }}>🔎</Text>
              <Text selectable style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.bold, color: colors.violetTone32 }}>No service found</Text>
              <Text style={{ fontSize: fontSizes.size11, color: colors.violetTone54_3 }}>Try searching for cleaning, salon or repairs.</Text>
            </View>
          )}
        </View>

        {!normalizedSearch && spotlights && spotlights.spotlightContent.length > 0 ? (
          <View style={{ marginHorizontal: -16, gap: 18, paddingTop: 10, paddingBottom: 2 }}>
            <View style={{ width: '100%', height: 8, backgroundColor: colors.neutralTone95_2 }} />
            <Text style={{ marginTop: 4, paddingHorizontal: 16, fontSize: fontSizes.size22, lineHeight: 44, fontFamily: fontFamilies.semiBold, color: colors.black }}>
              {spotlights.sectionTitle}
            </Text>
            <ScrollView
              horizontal
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={Math.min(width - 64, 360) + 16}
              scrollEventThrottle={16}
              onScroll={({ nativeEvent }) => {
                const maximumOffset = nativeEvent.contentSize.width - nativeEvent.layoutMeasurement.width;
                setSpotlightScrollProgress(maximumOffset > 0 ? Math.min(1, Math.max(0, nativeEvent.contentOffset.x / maximumOffset)) : 0);
              }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
              {spotlights.spotlightContent.map((spotlight) => (
                <Pressable
                  key={`${spotlight.sortOrder}-${spotlight.redirectType}-${spotlight.redirectId}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Open spotlight offer ${spotlight.sortOrder}`}
                  onPress={() => onSpotlightPress(spotlight)}
                  style={({ pressed }) => ({
                    width: Math.min(width - 64, 360),
                    aspectRatio: 1.80,
                    overflow: 'hidden',
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    backgroundColor: colors.neutralTone95,
                    opacity: pressed ? 0.76 : 1,
                  })}
                >
                  <Image source={{ uri: spotlight.imageUrl }} contentFit="cover" transition={180} style={{ width: '100%', height: '100%' }} />
                </Pressable>
              ))}
            </ScrollView>
            {spotlights.spotlightContent.length > 1 ? (
              <View style={{ width: 46, height: 4, alignSelf: 'center', overflow: 'hidden', borderRadius: 2, backgroundColor: colors.mauveTone86 }}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: spotlightScrollProgress * (46 - Math.max(12, 46 / spotlights.spotlightContent.length)),
                    width: Math.max(12, 46 / spotlights.spotlightContent.length),
                    borderRadius: 2,
                    backgroundColor: colors.mauveTone53,
                  }}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {!normalizedSearch ? <View style={{ marginHorizontal: -16, height: 12, backgroundColor: colors.neutralTone95_2 }} /> : null}
      </View>
    </Animated.ScrollView>
    {stickySearchVisible ? (
      <View
        style={{
          position: 'absolute',
          zIndex: 50,
          top: 0,
          left: 0,
          right: 0,
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 16,
          paddingBottom: 10,
          overflow: 'hidden',
          backgroundColor: stickyHeaderWhite ? colors.white : stickyBannerColor,
        }}
      >
        <SearchBar displayedSuggestion={displayedSuggestion} onChangeText={setSearch} search={search} sticky />
      </View>
    ) : null}
    </View>
  );
}
