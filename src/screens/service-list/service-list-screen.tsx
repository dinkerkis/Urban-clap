import { ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import { ServiceCard } from '../../components/service-card';
import type { ServiceItem, ServiceSubcategory } from '../../data/service-catalog';

type ServiceListScreenProps = {
  cart: Record<string, number>;
  subcategory: ServiceSubcategory;
  onAdd: (item: ServiceItem) => void;
  onBack: () => void;
  onRemove: (item: ServiceItem) => void;
};

export function ServiceListScreen({ cart, subcategory, onAdd, onBack, onRemove }: ServiceListScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title={subcategory.title} subtitle={`${subcategory.services.length} packages available`} onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 116, gap: 14 }}
      >
        <View style={{ minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 22, borderCurve: 'continuous', backgroundColor: subcategory.tint }}>
          <View style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFFB8' }}>
            <Text style={{ fontSize: 30 }}>{subcategory.icon}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text selectable style={{ fontSize: 15, fontWeight: '800', color: '#211A28' }}>Quality service, guaranteed</Text>
            <Text selectable style={{ fontSize: 11, lineHeight: 16, color: '#665F6C' }}>Upfront pricing with verified and trained professionals.</Text>
          </View>
        </View>

        <View style={{ paddingTop: 5, gap: 3 }}>
          <Text selectable style={{ fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>Choose a package</Text>
          <Text style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>Add a service to your cart and book your preferred time.</Text>
        </View>

        {subcategory.services.map((item) => (
          <ServiceCard key={item.id} item={item} quantity={cart[item.id] ?? 0} onAdd={onAdd} onRemove={onRemove} />
        ))}

        <View style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 20, backgroundColor: '#F1EDF9' }}>
          <Text style={{ fontSize: 25 }}>✓</Text>
          <Text selectable style={{ flex: 1, fontSize: 11, lineHeight: 16, color: '#5D5367' }}>Free cancellation up to 2 hours before your scheduled service.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
