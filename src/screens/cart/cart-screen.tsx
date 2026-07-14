import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import { ServiceCard } from '../../components/service-card';
import { allServices, type ServiceItem } from '../../data/service-catalog';

type CartScreenProps = {
  cart: Record<string, number>;
  onAdd: (item: ServiceItem) => void;
  onExplore: () => void;
  onRemove: (item: ServiceItem) => void;
};

export function CartScreen({ cart, onAdd, onExplore, onRemove }: CartScreenProps) {
  const cartItems = allServices.filter((item) => (cart[item.id] ?? 0) > 0);
  const subtotal = cartItems.reduce((total, item) => total + item.price * (cart[item.id] ?? 0), 0);
  const taxes = cartItems.length > 0 ? 49 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="Your cart" subtitle={cartItems.length ? `${cartItems.length} service${cartItems.length === 1 ? '' : 's'} selected` : 'Ready when you are'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 116, gap: 14 }}
      >
        {cartItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22 }}>
            <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderCurve: 'continuous', backgroundColor: '#F0EBFF' }}>
              <Text style={{ fontSize: 42 }}>🛒</Text>
            </View>
            <Text selectable style={{ paddingTop: 5, fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>Your cart is empty</Text>
            <Text selectable style={{ maxWidth: 280, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#77717D' }}>
              Add a service package and it will appear here.
            </Text>
            <Pressable onPress={onExplore} style={({ pressed }) => ({ minWidth: 170, height: 46, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: pressed ? '#5933C4' : '#6E45E2' })}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Browse categories</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <ServiceCard key={item.id} item={item} quantity={cart[item.id] ?? 0} onAdd={onAdd} onRemove={onRemove} />
            ))}

            <View style={{ marginTop: 6, padding: 18, gap: 11, borderRadius: 22, borderCurve: 'continuous', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECE9EF' }}>
              <Text selectable style={{ fontSize: 16, fontWeight: '800', color: '#211A28' }}>Payment summary</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#77717D' }}>Service total</Text>
                <Text selectable style={{ fontSize: 12, fontWeight: '700', color: '#514A58', fontVariant: ['tabular-nums'] }}>₹{subtotal}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#77717D' }}>Taxes & convenience fee</Text>
                <Text selectable style={{ fontSize: 12, fontWeight: '700', color: '#514A58', fontVariant: ['tabular-nums'] }}>₹{taxes}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#EEEAF0' }} />
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '800', color: '#211A28' }}>Total</Text>
                <Text selectable style={{ fontSize: 16, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>₹{subtotal + taxes}</Text>
              </View>
              <Pressable style={({ pressed }) => ({ height: 48, marginTop: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: pressed ? '#5933C4' : '#6E45E2' })}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Choose date & time</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
