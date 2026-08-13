import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_OFFER_HEADER_COLOR, OfferCarousel } from '../../components/offer-carousel';
import type { ServiceCategory } from '../../data/service-catalog';
import { useCurrentLocation } from '../../hooks/use-current-location';

const SEARCH_SUGGESTIONS = ['AC service', 'Facial', 'Kitchen cleaning'];

type HomeScreenProps = {
  categories: ServiceCategory[];
  errorMessage: string;
  isLoading: boolean;
  onCategoryPress: (category: ServiceCategory) => void;
  onSeeAllCategories: () => void;
  onLogout: () => void;
  onRetry: () => void;
};

export function HomeScreen({ categories, errorMessage, isLoading, onCategoryPress, onLogout, onRetry }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [searchSuggestionIndex, setSearchSuggestionIndex] = useState(0);
  const [displayedSuggestion, setDisplayedSuggestion] = useState('');
  const [isDeletingSuggestion, setIsDeletingSuggestion] = useState(false);
  const [headerColor, setHeaderColor] = useState(DEFAULT_OFFER_HEADER_COLOR);
  const currentLocation = useCurrentLocation();
  const { width } = useWindowDimensions();
  const categoryWidth = Math.max(92, Math.floor((width - 40 - 20) / 3));
  const normalizedSearch = search.trim().toLowerCase();
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

  const handleLocationPress = () => {
    if ((currentLocation.status === 'denied' && !currentLocation.canAskAgain) || currentLocation.status === 'approximate') {
      Alert.alert('Precise location needed', 'Enable precise location in Settings to show your nearest street or locality.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }

    void currentLocation.refresh();
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#FAF9FB' }}
      contentContainerStyle={{ paddingBottom: 126 + insets.bottom }}
    >
      <View
        style={{
          paddingTop: process.env.EXPO_OS === 'ios' ? 56 : insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 0,
          gap: 14,
          overflow: 'hidden',
          backgroundColor: headerColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${currentLocation.label}`}
            onPress={handleLocationPress}
            style={({ pressed }) => ({ flex: 1, gap: 2, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 15, lineHeight: 20, fontWeight: '600', color: 'rgba(255, 255, 255, 0.90)' }}>Your location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ width: 15, fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#FFFFFF', transform: [{ rotate: '-45deg' }] }}>➤</Text>
              {currentLocation.status === 'loading' && <ActivityIndicator size="small" color="#FFFFFF" />}
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500', color: 'rgba(255, 255, 255, 0.90)' }}>
                {currentLocation.label}
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open account options"
            onPress={() =>
              Alert.alert('Account', 'You are currently signed in.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: onLogout },
              ])
            }
            style={({ pressed }) => ({ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#FFFFFFE8', opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </Pressable>
        </View>

        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#FFFFFF' }}>
          <View style={{ width: 17, height: 17 }}>
            <View style={{ position: 'absolute', left: 1, top: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 1.7, borderColor: '#645C6C' }} />
            <View style={{ position: 'absolute', width: 7, height: 1.7, right: 0, bottom: 2, borderRadius: 1, backgroundColor: '#645C6C', transform: [{ rotate: '45deg' }] }} />
          </View>
          <View style={{ flex: 1, height: 44, justifyContent: 'center' }}>
            {!search ? (
              <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#918A97' }}>Search for '</Text>
                <View style={{ height: 20, flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, color: '#918A97' }}>
                    {`${displayedSuggestion}'`}
                  </Text>
                </View>
              </View>
            ) : null}
            <TextInput
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search for services"
              returnKeyType="search"
              style={{ flex: 1, minHeight: 44, paddingVertical: 8, fontSize: 13, color: '#241D2B' }}
            />
          </View>
        </View>

        {!normalizedSearch && <OfferCarousel embeddedOnPurple onHeaderColorChange={setHeaderColor} />}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 25 }}>
        <View style={{ gap: 15 }}>
          {normalizedSearch ? (
            <Text selectable style={{ fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#211A28' }}>
              Search results
            </Text>
          ) : null}
          {isLoading ? (
            <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <ActivityIndicator color="#6E45E2" />
              <Text style={{ fontSize: 12, color: '#77717D' }}>Loading categories...</Text>
            </View>
          ) : errorMessage ? (
            <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
              <Text selectable style={{ textAlign: 'center', fontSize: 12, lineHeight: 17, color: '#77717D' }}>{errorMessage}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: '#6E45E2' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>Try again</Text>
              </Pressable>
            </View>
          ) : visibleCategories.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {visibleCategories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  onPress={() => onCategoryPress(category)}
                  style={({ pressed }) => ({ width: categoryWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}
                >
                  <View style={{ width: categoryWidth, height: 76, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#EEEEEE' }}>
                    <Text style={{ fontSize: 29 }}>{category.icon}</Text>
                    {category.imageUrl ? (
                      <Image
                        source={category.imageUrl}
                        contentFit="contain"
                        transition={180}
                        style={{ position: 'absolute', inset: 8 }}
                      />
                    ) : null}
                  </View>
                  <Text numberOfLines={2} style={{ minHeight: 30, textAlign: 'center', fontSize: 10, lineHeight: 14, fontWeight: '700', color: '#49414F' }}>
                    {category.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center', gap: 7 }}>
              <Text style={{ fontSize: 28 }}>🔎</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#514A58' }}>No service found</Text>
              <Text style={{ fontSize: 11, color: '#8B8590' }}>Try searching for cleaning, salon or repairs.</Text>
            </View>
          )}
        </View>

        {!normalizedSearch && (
          <View style={{ padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 22, borderCurve: 'continuous', backgroundColor: '#EAF7F1' }}>
            <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' }}><Text style={{ fontSize: 23 }}>🛡️</Text></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text selectable style={{ fontSize: 14, fontWeight: '600', color: '#244A3A' }}>Safe & verified professionals</Text>
              <Text style={{ fontSize: 11, lineHeight: 16, color: '#567065' }}>Background checked experts with transparent pricing.</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
