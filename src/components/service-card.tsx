import { colors, fontFamilies, fontSizes } from '../theme';
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
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.violetTone93,
        boxShadow: `0 4px 18px ${colors.violetTone16Alpha6}`,
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
        ) : <Text style={{ fontSize: fontSizes.size10, color: colors.violetTone54_2 }}>No image</Text>}
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <Text selectable numberOfLines={2} style={{ fontSize: fontSizes.size15, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.violetTone13 }}>
          {item.title}
        </Text>
        <Text selectable numberOfLines={2} style={{ fontSize: fontSizes.size11, lineHeight: 16, color: colors.violetTone47 }}>
          {item.description}
        </Text>
        {item.rating > 0 || item.duration ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {item.rating > 0 ? <Text style={{ fontSize: fontSizes.size11, color: colors.orangeTone55 }}>★</Text> : null}
            <Text selectable style={{ fontSize: fontSizes.size10, fontFamily: fontFamilies.bold, color: colors.violetTone32 }}>
              {item.rating > 0 ? `${item.rating} (${item.reviews})` : ''}
              {item.rating > 0 && item.duration ? ' · ' : ''}
              {item.duration}
            </Text>
          </View>
        ) : null}
        {item.selectedVariantLabel ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.violetTone96_2 }}>
            <Text selectable style={{ fontSize: fontSizes.size9, fontFamily: fontFamilies.bold, color: colors.violetTone38 }}>{item.selectedVariantLabel}</Text>
          </View>
        ) : item.variants?.length ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.violetTone96_2 }}>
            <Text selectable style={{ fontSize: fontSizes.size9, fontFamily: fontFamilies.bold, color: colors.violetTone38 }}>
              {item.variantLabel || 'Choose an option'} · {item.variants.length} options
            </Text>
          </View>
        ) : null}
        <View style={{ minHeight: 34, flexDirection: 'row', alignItems: 'flex-end', gap: 7 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text selectable style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.semiBold, color: colors.violetTone13, fontVariant: ['tabular-nums'] }}>
              {item.variants?.length ? 'From ' : ''}₹{item.price}
            </Text>
            {item.originalPrice > item.price ? (
              <Text selectable style={{ fontSize: fontSizes.size10, color: colors.mauveTone60, textDecorationLine: 'line-through', fontVariant: ['tabular-nums'] }}>
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
                borderColor: colors.violetTone58,
                backgroundColor: pressed ? colors.violetTone95 : colors.violetTone99,
              })}
            >
              <Text style={{ fontSize: fontSizes.size12, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>{item.variants?.length && onPress ? 'OPTIONS' : 'ADD'}</Text>
            </Pressable>
          ) : (
            <View style={{ height: 34, flexDirection: 'row', alignItems: 'center', borderRadius: 11, backgroundColor: colors.violetTone58, overflow: 'hidden' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove one ${item.title}`}
                onPress={(event) => {
                  event.stopPropagation();
                  onRemove?.(item);
                }}
                style={({ pressed }) => ({ width: 30, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ fontSize: fontSizes.size18, color: colors.white }}>−</Text>
              </Pressable>
              <Text style={{ minWidth: 22, textAlign: 'center', fontSize: fontSizes.size12, fontFamily: fontFamilies.semiBold, color: colors.white, fontVariant: ['tabular-nums'] }}>
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
                <Text style={{ fontSize: fontSizes.size18, color: colors.white }}>+</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
