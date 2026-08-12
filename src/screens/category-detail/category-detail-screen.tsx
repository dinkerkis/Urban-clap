import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import type { ServiceCategory, ServiceSubcategory } from '../../data/service-catalog';

type CategoryDetailScreenProps = {
  category: ServiceCategory;
  onBack: () => void;
  onSubcategoryPress: (subcategory: ServiceSubcategory) => void;
};

export function CategoryDetailScreen({ category, onBack, onSubcategoryPress }: CategoryDetailScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="Choose a category" subtitle="Step 1 of 2" onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 20 }}
      >
        <View style={{ minHeight: 134, overflow: 'hidden', padding: 20, justifyContent: 'center', gap: 5, borderRadius: 25, borderCurve: 'continuous', backgroundColor: category.tint }}>
          <View style={{ position: 'absolute', width: 118, height: 118, right: -18, top: 8, borderRadius: 59, backgroundColor: '#FFFFFF70' }} />
          <Text selectable style={{ maxWidth: 235, fontSize: 22, lineHeight: 28, fontWeight: '800', color: '#211A28' }}>{category.title}</Text>
          {category.subtitle ? (
            <Text selectable numberOfLines={3} style={{ maxWidth: 235, fontSize: 11, lineHeight: 16, color: '#655D6B' }}>{category.subtitle}</Text>
          ) : null}
          {category.imageUrl ? (
            <Image
              source={category.imageUrl}
              contentFit="cover"
              transition={180}
              style={{ position: 'absolute', right: 18, top: 25, width: 88, height: 88, borderRadius: 22 }}
            />
          ) : <Text style={{ position: 'absolute', right: 34, top: 61, fontSize: 10, color: '#8A8490' }}>No image</Text>}
        </View>

        <View style={{ gap: 4 }}>
          <Text selectable style={{ fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>Available categories</Text>
          <Text selectable style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>Select one to view products and prices.</Text>
        </View>

        {category.subcategories.length > 0 ? (
          <View style={{ gap: 12 }}>
            {category.subcategories.map((subcategory) => (
            <Pressable
              key={subcategory.id}
              accessibilityRole="button"
              onPress={() => onSubcategoryPress(subcategory)}
              style={({ pressed }) => ({
                minHeight: 106,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                gap: 14,
                borderRadius: 22,
                borderCurve: 'continuous',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#ECE9EF',
                opacity: pressed ? 0.62 : 1,
              })}
            >
              <View style={{ width: 82, height: 82, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 17, borderCurve: 'continuous', backgroundColor: subcategory.tint }}>
                {subcategory.imageUrl ? (
                  <Image source={subcategory.imageUrl} contentFit="cover" transition={180} style={{ position: 'absolute', inset: 0, borderRadius: 17 }} />
                ) : <Text style={{ fontSize: 10, color: '#8A8490' }}>No image</Text>}
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text selectable numberOfLines={2} style={{ fontSize: 15, lineHeight: 20, fontWeight: '800', color: '#211A28' }}>{subcategory.title}</Text>
                {subcategory.subtitle ? <Text selectable numberOfLines={2} style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>{subcategory.subtitle}</Text> : null}
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#6E45E2' }}>View products</Text>
              </View>
              <Text style={{ fontSize: 25, color: '#A39DA8' }}>›</Text>
            </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 31 }}>📂</Text>
            <Text selectable style={{ fontSize: 13, fontWeight: '700', color: '#514A58' }}>No services available yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
