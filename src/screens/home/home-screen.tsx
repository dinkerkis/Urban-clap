import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfferCarousel } from '../../components/offer-carousel';
import type { ServiceCategory } from '../../data/service-catalog';
import { serviceCategories } from '../../data/service-catalog';
import { useCurrentLocation } from '../../hooks/use-current-location';

type HomeScreenProps = {
  onCategoryPress: (category: ServiceCategory) => void;
  onLogout: () => void;
};

export function HomeScreen({ onCategoryPress, onLogout }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const currentLocation = useCurrentLocation();
  const { width } = useWindowDimensions();
  const categoryWidth = Math.max(70, Math.floor((width - 40 - 30) / 4));
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = useMemo(
    () =>
      normalizedSearch
        ? serviceCategories.filter(
            (category) =>
              category.title.toLowerCase().includes(normalizedSearch) ||
              category.subcategories.some((subcategory) => subcategory.title.toLowerCase().includes(normalizedSearch)),
          )
        : serviceCategories,
    [normalizedSearch],
  );

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
          paddingBottom: 24,
          gap: 17,
          overflow: 'hidden',
          backgroundColor: '#6E45E2',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          borderCurve: 'continuous',
        }}
      >
        <View style={{ position: 'absolute', width: 190, height: 190, right: -70, top: -55, borderRadius: 95, backgroundColor: '#8E70EB' }} />
        <View style={{ position: 'absolute', width: 110, height: 110, right: 74, bottom: -62, borderRadius: 55, backgroundColor: '#5C35C8' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${currentLocation.label}`}
            onPress={handleLocationPress}
            style={({ pressed }) => ({ flex: 1, gap: 2, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: 1.2, color: 'rgba(255, 255, 255, 0.88)' }}>Your Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ width: 15, fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#FFFFFF', transform: [{ rotate: '-45deg' }] }}>➤</Text>
              {currentLocation.status === 'loading' && <ActivityIndicator size="small" color="#FFFFFF" />}
              <Text selectable numberOfLines={2} style={{ flex: 1, fontSize: 15, lineHeight: 20, fontWeight: '600', color: '#FFFFFF' }}>
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

        <View style={{ gap: 0 }}>
          <Text selectable style={{ fontSize: 18, lineHeight: 22, fontWeight: '500', color: 'rgba(255, 255, 255, 0.90)' }}>Good afternoon</Text>
          <Text selectable style={{ fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6, color: '#FFFFFF' }}>
            What can we help with?
          </Text>
        </View>

        <View style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, borderRadius: 17, borderCurve: 'continuous', backgroundColor: '#FFFFFF', boxShadow: '0 8px 22px rgba(28, 14, 60, 0.16)' }}>
          <Text style={{ fontSize: 21, color: '#645C6C' }}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search cleaning, AC, salon..."
            placeholderTextColor="#918A97"
            returnKeyType="search"
            style={{ flex: 1, minHeight: 54, paddingVertical: 12, fontSize: 14, color: '#241D2B' }}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 25 }}>
        {!normalizedSearch && (
          <OfferCarousel />
        )}

        <View style={{ gap: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text selectable style={{ flex: 1, fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>
              {normalizedSearch ? 'Search results' : 'Book a service'}
            </Text>
            {!normalizedSearch && <Text style={{ fontSize: 11, fontWeight: '700', color: '#6E45E2' }}>All categories</Text>}
          </View>
          {visibleCategories.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {visibleCategories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  onPress={() => onCategoryPress(category)}
                  style={({ pressed }) => ({ width: categoryWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}
                >
                  <View style={{ width: categoryWidth, height: categoryWidth, maxHeight: 84, alignItems: 'center', justifyContent: 'center', borderRadius: 21, borderCurve: 'continuous', backgroundColor: category.tint }}>
                    <Text style={{ fontSize: 29 }}>{category.icon}</Text>
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
              <Text selectable style={{ fontSize: 14, fontWeight: '800', color: '#244A3A' }}>Safe & verified professionals</Text>
              <Text style={{ fontSize: 11, lineHeight: 16, color: '#567065' }}>Background checked experts with transparent pricing.</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
