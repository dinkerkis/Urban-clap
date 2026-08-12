import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import type { ServiceCategory } from '../../data/service-catalog';

type CategoriesScreenProps = {
  categories: ServiceCategory[];
  errorMessage: string;
  isLoading: boolean;
  onCategoryPress: (category: ServiceCategory) => void;
  onRetry: () => void;
};

export function CategoriesScreen({ categories, errorMessage, isLoading, onCategoryPress, onRetry }: CategoriesScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="All categories" subtitle="Choose a service for your home" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 116, gap: 12 }}
      >
        {isLoading ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator color="#6E45E2" />
            <Text style={{ fontSize: 12, color: '#77717D' }}>Loading categories...</Text>
          </View>
        ) : errorMessage ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 30 }}>⚠️</Text>
            <Text selectable style={{ textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#77717D' }}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={onRetry} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#6E45E2' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Try again</Text>
            </Pressable>
          </View>
        ) : categories.length === 0 ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 30 }}>📂</Text>
            <Text selectable style={{ fontSize: 13, fontWeight: '700', color: '#514A58' }}>No categories available</Text>
          </View>
        ) : categories.map((category) => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            onPress={() => onCategoryPress(category)}
            style={({ pressed }) => ({
              minHeight: 94,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 15,
              padding: 13,
              borderRadius: 22,
              borderCurve: 'continuous',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#ECE9EF',
              opacity: pressed ? 0.64 : 1,
            })}
          >
            <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 19, borderCurve: 'continuous', backgroundColor: category.tint }}>
              <Text style={{ fontSize: 31 }}>{category.icon}</Text>
              {category.imageUrl ? (
                <Image source={category.imageUrl} contentFit="cover" transition={180} style={{ position: 'absolute', inset: 0, borderRadius: 19 }} />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ fontSize: 15, lineHeight: 20, fontWeight: '800', color: '#211A28' }}>{category.title}</Text>
              <Text selectable style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>{category.subtitle}</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#6E45E2' }}>{category.subcategories.length} service types</Text>
            </View>
            <Text style={{ fontSize: 26, color: '#A39DA8' }}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
