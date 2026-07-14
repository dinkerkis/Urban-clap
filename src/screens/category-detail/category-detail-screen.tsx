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
      <DashboardScreenHeader title={category.title} subtitle={category.subtitle} onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 116, gap: 20 }}
      >
        <View style={{ minHeight: 134, overflow: 'hidden', padding: 20, justifyContent: 'center', gap: 5, borderRadius: 25, borderCurve: 'continuous', backgroundColor: category.tint }}>
          <View style={{ position: 'absolute', width: 118, height: 118, right: -18, top: 8, borderRadius: 59, backgroundColor: '#FFFFFF70' }} />
          <Text selectable style={{ maxWidth: 235, fontSize: 22, lineHeight: 28, fontWeight: '800', color: '#211A28' }}>Professional {category.title.toLowerCase()} at your doorstep</Text>
          <Text style={{ fontSize: 11, lineHeight: 16, color: '#655D6B' }}>Verified experts · transparent prices</Text>
          <Text style={{ position: 'absolute', right: 25, top: 40, fontSize: 48 }}>{category.icon}</Text>
        </View>

        <View style={{ gap: 5 }}>
          <Text selectable style={{ fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>What do you need?</Text>
          <Text style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>Select a service type to see packages and pricing.</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {category.subcategories.map((subcategory) => (
            <Pressable
              key={subcategory.id}
              accessibilityRole="button"
              onPress={() => onSubcategoryPress(subcategory)}
              style={({ pressed }) => ({
                width: '48%',
                minHeight: 172,
                padding: 12,
                gap: 10,
                borderRadius: 22,
                borderCurve: 'continuous',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#ECE9EF',
                opacity: pressed ? 0.62 : 1,
              })}
            >
              <View style={{ height: 91, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderCurve: 'continuous', backgroundColor: subcategory.tint }}>
                <Text style={{ fontSize: 39 }}>{subcategory.icon}</Text>
              </View>
              <View style={{ gap: 3 }}>
                <Text selectable numberOfLines={2} style={{ fontSize: 13, lineHeight: 18, fontWeight: '800', color: '#211A28' }}>{subcategory.title}</Text>
                <Text selectable numberOfLines={2} style={{ fontSize: 10, lineHeight: 14, color: '#77717D' }}>{subcategory.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
