import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import type { ServiceCategory } from '../../data/service-catalog';
import { serviceCategories } from '../../data/service-catalog';

type CategoriesScreenProps = {
  onCategoryPress: (category: ServiceCategory) => void;
};

export function CategoriesScreen({ onCategoryPress }: CategoriesScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="All categories" subtitle="Choose a service for your home" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 116, gap: 12 }}
      >
        {serviceCategories.map((category) => (
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
