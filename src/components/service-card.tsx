import { Pressable, Text, View } from 'react-native';

import type { ServiceItem } from '../data/service-catalog';

type ServiceCardProps = {
  item: ServiceItem;
  quantity?: number;
  onAdd: (item: ServiceItem) => void;
  onRemove?: (item: ServiceItem) => void;
};

export function ServiceCard({ item, quantity = 0, onAdd, onRemove }: ServiceCardProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        padding: 14,
        borderRadius: 22,
        borderCurve: 'continuous',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#ECE9EF',
        boxShadow: '0 4px 18px rgba(40, 26, 58, 0.06)',
      }}
    >
      <View
        style={{
          width: 92,
          minHeight: 112,
          borderRadius: 18,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: item.tint,
        }}
      >
        <Text style={{ fontSize: 40 }}>{item.icon}</Text>
        <View style={{ position: 'absolute', left: 8, top: 8, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, backgroundColor: '#FFFFFFCC' }}>
          <Text style={{ fontSize: 8, fontWeight: '800', color: '#6E45E2' }}>POPULAR</Text>
        </View>
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <Text selectable numberOfLines={2} style={{ fontSize: 15, lineHeight: 20, fontWeight: '800', color: '#211A28' }}>
          {item.title}
        </Text>
        <Text selectable numberOfLines={2} style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>
          {item.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: 11, color: '#F19A2A' }}>★</Text>
          <Text selectable style={{ fontSize: 10, fontWeight: '700', color: '#514A58' }}>
            {item.rating} ({item.reviews}) · {item.duration}
          </Text>
        </View>
        <View style={{ minHeight: 34, flexDirection: 'row', alignItems: 'flex-end', gap: 7 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text selectable style={{ fontSize: 16, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>
              ₹{item.price}
            </Text>
            <Text selectable style={{ fontSize: 10, color: '#99939D', textDecorationLine: 'line-through', fontVariant: ['tabular-nums'] }}>
              ₹{item.originalPrice}
            </Text>
          </View>
          {quantity === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onAdd(item)}
              style={({ pressed }) => ({
                minWidth: 66,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 11,
                borderWidth: 1.5,
                borderColor: '#6E45E2',
                backgroundColor: pressed ? '#EEE7FF' : '#FAF8FF',
              })}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#6E45E2' }}>ADD</Text>
            </Pressable>
          ) : (
            <View style={{ height: 34, flexDirection: 'row', alignItems: 'center', borderRadius: 11, backgroundColor: '#6E45E2', overflow: 'hidden' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove one ${item.title}`}
                onPress={() => onRemove?.(item)}
                style={({ pressed }) => ({ width: 30, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ fontSize: 18, color: '#FFFFFF' }}>−</Text>
              </Pressable>
              <Text style={{ minWidth: 22, textAlign: 'center', fontSize: 12, fontWeight: '800', color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>
                {quantity}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add one ${item.title}`}
                onPress={() => onAdd(item)}
                style={({ pressed }) => ({ width: 30, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ fontSize: 18, color: '#FFFFFF' }}>+</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
