import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';
import type { ServiceItem } from '../../data/service-catalog';

type ProductDetailScreenProps = {
  cart: Record<string, number>;
  categoryTitle: string;
  item: ServiceItem;
  onAdd: (item: ServiceItem) => void;
  onBack: () => void;
  onRemove: (item: ServiceItem) => void;
  subcategoryTitle: string;
};

export function ProductDetailScreen({ cart, categoryTitle, item, onAdd, onBack, onRemove, subcategoryTitle }: ProductDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = item.variants?.[selectedVariantIndex];
  const galleryImages = useMemo(
    () => Array.from(new Set([selectedVariant?.imageUrl, item.imageUrl, ...(item.images ?? [])].filter((image): image is string => Boolean(image)))),
    [item.imageUrl, item.images, selectedVariant?.imageUrl],
  );
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
  const price = selectedVariant?.price ?? item.price;
  const maxQuantity = item.maxQuantity ?? 99;
  const isAvailable = !item.status || item.status.toLowerCase() === 'active';
  const selectedItem: ServiceItem = {
    ...item,
    id: selectedVariant ? `${item.id}::${selectedVariant.key || selectedVariantIndex}` : item.id,
    imageUrl: selectedVariant?.imageUrl || item.imageUrl,
    price,
    originalPrice: price,
    selectedVariantLabel: selectedVariant?.label,
  };
  const quantity = cart[selectedItem.id] ?? 0;

  const chooseVariant = (index: number) => {
    setSelectedVariantIndex(index);
    const variantImage = item.variants?.[index]?.imageUrl;
    if (variantImage) setSelectedImage(variantImage);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="Product details" subtitle={`${categoryTitle} › ${subcategoryTitle}`} onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 128 + insets.bottom, gap: 22 }}
      >
        <View style={{ gap: 10 }}>
          <View style={{ height: 244, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 26, borderCurve: 'continuous', backgroundColor: item.tint }}>
            {selectedImage ? (
              <Image source={selectedImage} contentFit="cover" transition={180} style={{ width: '100%', height: '100%' }} />
            ) : <Text style={{ fontSize: 12, color: '#8A8490' }}>No image available</Text>}
          </View>
          {galleryImages.length > 1 ? (
            <ScrollView horizontal contentInsetAdjustmentBehavior="automatic" showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {galleryImages.map((image) => {
                const selected = image === selectedImage;
                return (
                  <Pressable
                    key={image}
                    accessibilityRole="button"
                    accessibilityLabel="View product image"
                    onPress={() => setSelectedImage(image)}
                    style={{ width: 62, height: 52, overflow: 'hidden', borderRadius: 12, borderWidth: selected ? 2 : 1, borderColor: selected ? '#6E45E2' : '#E2DEE7' }}
                  >
                    <Image source={image} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Text selectable style={{ flex: 1, fontSize: 24, lineHeight: 30, fontWeight: '800', color: '#211A28' }}>{item.title}</Text>
            <View style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: isAvailable ? '#E7F7EF' : '#FCE8EA' }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: isAvailable ? '#28704F' : '#A33D48' }}>{isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}</Text>
            </View>
          </View>
          {item.rating > 0 || item.duration ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.rating > 0 ? <Text style={{ fontSize: 14, color: '#F19A2A' }}>★</Text> : null}
              <Text selectable style={{ fontSize: 12, fontWeight: '700', color: '#514A58' }}>
                {item.rating > 0 ? `${item.rating} (${item.reviews} reviews)` : ''}{item.rating > 0 && item.duration ? ' · ' : ''}{item.duration}
              </Text>
            </View>
          ) : null}
          <Text selectable style={{ fontSize: 13, lineHeight: 20, color: '#6B6470' }}>{item.fullDescription || item.description}</Text>
        </View>

        {item.includes?.length ? (
          <View style={{ gap: 12 }}>
            <Text selectable style={{ fontSize: 18, fontWeight: '800', color: '#211A28' }}>What’s included</Text>
            <View style={{ gap: 9, padding: 16, borderRadius: 20, borderCurve: 'continuous', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECE9EF' }}>
              {item.includes.map((include) => (
                <View key={include} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}>
                  <Text style={{ color: '#6E45E2', fontWeight: '800' }}>✓</Text>
                  <Text selectable style={{ flex: 1, fontSize: 12, lineHeight: 18, color: '#5F5765' }}>{include}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {item.variants?.length ? (
          <View style={{ gap: 12 }}>
            <View style={{ gap: 3 }}>
              <Text selectable style={{ fontSize: 18, fontWeight: '800', color: '#211A28' }}>{item.variantLabel || 'Choose an option'}</Text>
              <Text selectable style={{ fontSize: 11, color: '#77717D' }}>Select one option before adding this product.</Text>
            </View>
            <View style={{ gap: 9 }}>
              {item.variants.map((variant, index) => {
                const selected = selectedVariantIndex === index;
                return (
                  <Pressable
                    key={variant.key || variant.label}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => chooseVariant(index)}
                    style={({ pressed }) => ({
                      minHeight: 58,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? '#6E45E2' : '#E2DEE7',
                      backgroundColor: selected ? '#F6F2FF' : '#FFFFFF',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 2, borderColor: selected ? '#6E45E2' : '#A29BA7' }}>
                      {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6E45E2' }} /> : null}
                    </View>
                    <Text selectable style={{ flex: 1, fontSize: 12, lineHeight: 17, fontWeight: selected ? '700' : '600', color: '#4F4755' }}>{variant.label}</Text>
                    <Text selectable style={{ fontSize: 13, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>₹{variant.price}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 14), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#ECE9EF', boxShadow: '0 -6px 20px rgba(33, 22, 52, 0.06)' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 10, color: '#77717D' }}>{selectedVariant ? 'Selected price' : 'Price'}</Text>
          <Text selectable style={{ fontSize: 20, fontWeight: '800', color: '#211A28', fontVariant: ['tabular-nums'] }}>₹{price}</Text>
        </View>
        {quantity > 0 ? (
          <View style={{ height: 46, flexDirection: 'row', alignItems: 'center', borderRadius: 14, overflow: 'hidden', backgroundColor: '#6E45E2' }}>
            <Pressable accessibilityRole="button" onPress={() => onRemove(selectedItem)} style={{ width: 42, height: 46, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 21, color: '#FFFFFF' }}>−</Text></Pressable>
            <Text style={{ minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>{quantity}</Text>
            <Pressable disabled={quantity >= maxQuantity} accessibilityRole="button" onPress={() => onAdd(selectedItem)} style={{ width: 42, height: 46, alignItems: 'center', justifyContent: 'center', opacity: quantity >= maxQuantity ? 0.4 : 1 }}><Text style={{ fontSize: 21, color: '#FFFFFF' }}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable
            disabled={!isAvailable}
            accessibilityRole="button"
            onPress={() => onAdd(selectedItem)}
            style={({ pressed }) => ({ minWidth: 142, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#6E45E2', opacity: !isAvailable ? 0.4 : pressed ? 0.75 : 1 })}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Add to cart</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
