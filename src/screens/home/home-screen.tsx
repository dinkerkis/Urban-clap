import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { OfferCarousel } from '../../components/offer-carousel';
import type { ServiceCategory, ServiceItem } from '../../data/service-catalog';
import { featuredServices, serviceCategories } from '../../data/service-catalog';
import { useCurrentLocation } from '../../hooks/use-current-location';

type HomeScreenProps = {
  cart: Record<string, number>;
  onAdd: (item: ServiceItem) => void;
  onCategoryPress: (category: ServiceCategory) => void;
  onLogout: () => void;
  onRemove: (item: ServiceItem) => void;
};

export function HomeScreen({ cart, onAdd, onCategoryPress, onLogout, onRemove }: HomeScreenProps) {
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
      contentContainerStyle={{ paddingBottom: 116 }}
    >
      <View
        style={{
          paddingTop: process.env.EXPO_OS === 'ios' ? 56 : 26,
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
            <Text style={{ fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1.2, color: '#DDD2FF' }}>YOUR LOCATION</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ width: 15, fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#FFFFFF', transform: [{ rotate: '-45deg' }] }}>➤</Text>
              {currentLocation.status === 'loading' && <ActivityIndicator size="small" color="#FFFFFF" />}
              <Text selectable numberOfLines={1} style={{ flexShrink: 1, fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#FFFFFF' }}>
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

        <View style={{ gap: 3 }}>
          <Text selectable style={{ fontSize: 14, lineHeight: 19, color: '#E4DCFF' }}>Good afternoon</Text>
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
          <View style={{ gap: 14 }}>
            <Text selectable style={{ fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>Popular near you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              {featuredServices.map((item) => (
                <View key={item.id} style={{ width: 202, padding: 12, gap: 9, borderRadius: 21, borderCurve: 'continuous', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECE9EF' }}>
                  <View style={{ height: 94, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: item.tint }}>
                    <Text style={{ fontSize: 39 }}>{item.icon}</Text>
                  </View>
                  <Text selectable numberOfLines={1} style={{ fontSize: 13, fontWeight: '800', color: '#211A28' }}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 10, color: '#77717D' }}>★ {item.rating} · {item.duration}</Text>
                      <Text selectable style={{ fontSize: 14, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>₹{item.price}</Text>
                    </View>
                    {(cart[item.id] ?? 0) === 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${item.title}`}
                        onPress={() => onAdd(item)}
                        style={({ pressed }) => ({ width: 58, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: pressed ? '#5933C4' : '#6E45E2' })}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>ADD</Text>
                      </Pressable>
                    ) : (
                      <View style={{ height: 34, flexDirection: 'row', alignItems: 'center', borderRadius: 11, backgroundColor: '#6E45E2', overflow: 'hidden' }}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove one ${item.title}`}
                          onPress={() => onRemove(item)}
                          style={({ pressed }) => ({ width: 28, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
                        >
                          <Text style={{ fontSize: 17, lineHeight: 20, color: '#FFFFFF' }}>−</Text>
                        </Pressable>
                        <Text selectable style={{ minWidth: 24, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>
                          {cart[item.id]}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Add one ${item.title}`}
                          onPress={() => onAdd(item)}
                          style={({ pressed }) => ({ width: 28, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
                        >
                          <Text style={{ fontSize: 17, lineHeight: 20, color: '#FFFFFF' }}>+</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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
