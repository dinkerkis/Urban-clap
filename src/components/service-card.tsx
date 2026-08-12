import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { ServiceItem } from '../data/service-catalog';

type ServiceCardProps = {
  item: ServiceItem;
  quantity?: number;
  onAdd: (item: ServiceItem) => void;
  onPress?: (item: ServiceItem) => void;
  onRemove?: (item: ServiceItem) => void;
};

export function ServiceCard({ item, quantity = 0, onAdd, onPress, onRemove }: ServiceCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `View ${item.title} details` : undefined}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 22,
        borderCurve: 'continuous',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#ECE9EF',
        boxShadow: '0 4px 18px rgba(40, 26, 58, 0.06)',
        opacity: pressed && onPress ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 94,
          height: 112,
          flexShrink: 0,
          overflow: 'hidden',
          borderRadius: 18,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: item.tint,
        }}
      >
        {item.imageUrl ? (
          <Image
            source={item.imageUrl}
            contentFit="cover"
            transition={180}
            onError={(event) => {
              if (__DEV__) console.log('[Product Image] Failed', item.imageUrl, event.error);
            }}
            style={{ position: 'absolute', inset: 0, borderRadius: 18 }}
          />
        ) : <Text style={{ fontSize: 10, color: '#8A8490' }}>No image</Text>}
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <Text selectable numberOfLines={2} style={{ fontSize: 15, lineHeight: 20, fontWeight: '800', color: '#211A28' }}>
          {item.title}
        </Text>
        <Text selectable numberOfLines={2} style={{ fontSize: 11, lineHeight: 16, color: '#77717D' }}>
          {item.description}
        </Text>
        {item.rating > 0 || item.duration ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {item.rating > 0 ? <Text style={{ fontSize: 11, color: '#F19A2A' }}>★</Text> : null}
            <Text selectable style={{ fontSize: 10, fontWeight: '700', color: '#514A58' }}>
              {item.rating > 0 ? `${item.rating} (${item.reviews})` : ''}
              {item.rating > 0 && item.duration ? ' · ' : ''}
              {item.duration}
            </Text>
          </View>
        ) : null}
        {item.selectedVariantLabel ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3EFFB' }}>
            <Text selectable style={{ fontSize: 9, fontWeight: '700', color: '#625A68' }}>{item.selectedVariantLabel}</Text>
          </View>
        ) : item.variants?.length ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3EFFB' }}>
            <Text selectable style={{ fontSize: 9, fontWeight: '700', color: '#625A68' }}>
              {item.variantLabel || 'Choose an option'} · {item.variants.length} options
            </Text>
          </View>
        ) : null}
        <View style={{ minHeight: 34, flexDirection: 'row', alignItems: 'flex-end', gap: 7 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text selectable style={{ fontSize: 16, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>
              {item.variants?.length ? 'From ' : ''}₹{item.price}
            </Text>
            {item.originalPrice > item.price ? (
              <Text selectable style={{ fontSize: 10, color: '#99939D', textDecorationLine: 'line-through', fontVariant: ['tabular-nums'] }}>
                ₹{item.originalPrice}
              </Text>
            ) : null}
          </View>
          {quantity === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                if (item.variants?.length && onPress) onPress(item);
                else onAdd(item);
              }}
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
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#6E45E2' }}>{item.variants?.length && onPress ? 'OPTIONS' : 'ADD'}</Text>
            </Pressable>
          ) : (
            <View style={{ height: 34, flexDirection: 'row', alignItems: 'center', borderRadius: 11, backgroundColor: '#6E45E2', overflow: 'hidden' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove one ${item.title}`}
                onPress={(event) => {
                  event.stopPropagation();
                  onRemove?.(item);
                }}
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
                onPress={(event) => {
                  event.stopPropagation();
                  onAdd(item);
                }}
                style={({ pressed }) => ({ width: 30, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ fontSize: 18, color: '#FFFFFF' }}>+</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
