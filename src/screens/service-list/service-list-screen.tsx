import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import { ServiceCard } from '../../components/service-card';
import type { ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCategoryProducts } from '../../hooks/use-category-products';

type ServiceListScreenProps = {
  cart: Record<string, number>;
  categoryTitle: string;
  subcategory: ServiceSubcategory;
  onAdd: (item: ServiceItem) => void;
  onBack: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => void;
};

export function ServiceListScreen({ cart, categoryTitle, subcategory, onAdd, onBack, onProductPress, onRemove }: ServiceListScreenProps) {
  const { errorMessage, isLoading, retry, sections } = useCategoryProducts(subcategory.id);
  const productCount = sections.reduce((total, section) => total + section.products.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader
        title={subcategory.title}
        subtitle={isLoading ? 'Step 2 of 2 · Loading products...' : `Step 2 of 2 · ${productCount} product${productCount === 1 ? '' : 's'}`}
        onBack={onBack}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 18 }}
      >
        <View style={{ gap: 5 }}>
          <Text selectable style={{ fontSize: 11, fontWeight: '700', color: '#6E45E2' }}>{categoryTitle} › {subcategory.title}</Text>
          <Text selectable style={{ fontSize: 20, lineHeight: 26, fontWeight: '800', color: '#211A28' }}>Choose a product</Text>
          <Text selectable style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>Review available options, pricing and service details.</Text>
        </View>

        {isLoading ? (
          <View style={{ minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator color="#6E45E2" />
            <Text style={{ fontSize: 12, color: '#77717D' }}>Loading products...</Text>
          </View>
        ) : errorMessage ? (
          <View style={{ minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 30 }}>⚠️</Text>
            <Text selectable style={{ textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#77717D' }}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#6E45E2' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Try again</Text>
            </Pressable>
          </View>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.id} style={{ gap: 12, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 5 }}>
                {section.imageUrl ? (
                  <Image source={section.imageUrl} contentFit="cover" transition={180} style={{ width: 42, height: 42, borderRadius: 13 }} />
                ) : null}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text selectable style={{ fontSize: 16, lineHeight: 21, fontWeight: '800', color: '#211A28' }}>{section.title}</Text>
                  <Text style={{ fontSize: 10, color: '#77717D' }}>{section.products.length} product{section.products.length === 1 ? '' : 's'}</Text>
                </View>
              </View>

              {section.products.length > 0 ? (
                section.products.map((item) => (
                  <ServiceCard key={item.id} item={item} quantity={cart[item.id] ?? 0} onAdd={onAdd} onPress={onProductPress} onRemove={onRemove} />
                ))
              ) : (
                <View style={{ padding: 16, borderRadius: 18, backgroundColor: '#F2EFF5' }}>
                  <Text selectable style={{ textAlign: 'center', fontSize: 11, color: '#77717D' }}>Products coming soon</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={{ minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 31 }}>📂</Text>
            <Text selectable style={{ fontSize: 13, fontWeight: '700', color: '#514A58' }}>No products available yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
