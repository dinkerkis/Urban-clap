import { colors, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import { LoadingDots } from '../../components/loading-dots';
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
    <View style={{ flex: 1, backgroundColor: colors.violetTone98_2 }}>
      <DashboardScreenHeader title="All categories" subtitle="Choose a service for your home" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 116, gap: 12 }}
      >
        {isLoading ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <LoadingDots />
            <Text style={{ fontSize: fontSizes.size12, color: colors.violetTone47 }}>Loading categories...</Text>
          </View>
        ) : errorMessage ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: fontSizes.size30 }}>⚠️</Text>
            <Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size12, lineHeight: 18, color: colors.violetTone47 }}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={onRetry} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.violetTone58 }}>
              <Text style={{ fontSize: fontSizes.size12, fontWeight: '600', color: colors.white }}>Try again</Text>
            </Pressable>
          </View>
        ) : categories.length === 0 ? (
          <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: fontSizes.size30 }}>📂</Text>
            <Text selectable style={{ fontSize: fontSizes.size13, fontWeight: '700', color: colors.violetTone32 }}>No categories available</Text>
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
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.violetTone93,
              opacity: pressed ? 0.64 : 1,
            })}
          >
            <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 19, borderCurve: 'continuous', backgroundColor: category.tint }}>
              <Text style={{ fontSize: fontSizes.size31 }}>{category.icon}</Text>
              {category.imageUrl ? (
                <Image source={category.imageUrl} contentFit="cover" transition={180} style={{ position: 'absolute', inset: 0, borderRadius: 19 }} />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ fontSize: fontSizes.size15, lineHeight: 20, fontWeight: '600', color: colors.violetTone13 }}>{category.title}</Text>
              <Text selectable style={{ fontSize: fontSizes.size11, lineHeight: 16, color: colors.violetTone47 }}>{category.subtitle}</Text>
              <Text style={{ fontSize: fontSizes.size10, fontWeight: '700', color: colors.violetTone58 }}>{category.subcategories.length} service types</Text>
            </View>
            <Text style={{ fontSize: fontSizes.size26, color: colors.violetTone64 }}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
