import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingDots } from '../../components/loading-dots';
import { useNativeDescription } from '../../hooks/use-native-description';
import { useNativeProducts } from '../../hooks/use-native-products';
import { resolveNativeMediaUrl, type NativeDescriptionMedia, type NativeProduct } from '../../services/native-products-api';
import { NativeProductDetailModal } from './native-product-detail-modal';
import type { NativeCartSelection } from './native-product-detail-modal';

type NativeScreenProps = {
  cart: Record<string, number>;
  onAddToCart: (selections: NativeCartSelection[]) => Promise<boolean>;
  onViewCart: () => void;
};

type Product = { id: string; imageUrl?: string; kind: 'lock' | 'purifier'; name: string; optionsCount?: number; price: string; rating: string };

function compactCount(count = 0): string {
  if (count >= 1_000_000) return `${Math.round(count / 100_000) / 10}M`;
  if (count >= 1_000) return `${Math.round(count / 100) / 10}K`;
  return String(count);
}

function mapNativeProduct(product: NativeProduct): Product {
  const average = product.rating?.average ?? 0;
  return {
    id: product._id,
    imageUrl: product.main_image ? resolveNativeMediaUrl(product.main_image) : undefined,
    kind: product.product_name.toLowerCase().includes('lock') ? 'lock' : 'purifier',
    name: product.product_name,
    optionsCount: product.options_count,
    price: `₹${product.base_price.toLocaleString('en-IN')}`,
    rating: `${average} (${compactCount(product.rating?.count)})`,
  };
}

function ProductArt({ compact, kind }: { compact?: boolean; kind: Product['kind'] }) {
  if (kind === 'lock') {
    return (
      <View style={{ width: compact ? 52 : 112, height: compact ? 72 : 122, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: compact ? 14 : 25, height: compact ? 62 : 108, borderRadius: 4, backgroundColor: '#17191D', boxShadow: '0 7px 14px rgba(21,21,25,.16)' }}>
          <View style={{ width: compact ? 7 : 12, height: compact ? 7 : 12, marginTop: compact ? 12 : 20, alignSelf: 'center', borderRadius: 7, backgroundColor: '#4BA9E8' }} />
          <View style={{ position: 'absolute', right: compact ? -22 : -36, top: compact ? 31 : 53, width: compact ? 26 : 42, height: compact ? 5 : 7, borderRadius: 4, backgroundColor: '#34363B' }} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ width: compact ? 52 : 112, height: compact ? 72 : 122, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: compact ? 42 : 88, height: compact ? 64 : 102, borderRadius: compact ? 5 : 9, backgroundColor: '#1E2025', boxShadow: '0 7px 14px rgba(21,21,25,.17)' }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: compact ? 24 : 39, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: compact ? 5 : 9, borderTopRightRadius: compact ? 5 : 9, backgroundColor: '#383A40' }}>
          <View style={{ width: compact ? 12 : 20, height: compact ? 12 : 20, borderRadius: 10, borderWidth: 2, borderColor: '#A6A7AA' }} />
        </View>
        <View style={{ position: 'absolute', left: '50%', bottom: compact ? 12 : 17, width: compact ? 4 : 6, height: compact ? 9 : 14, marginLeft: compact ? -2 : -3, borderRadius: 2, backgroundColor: '#D4D5D6' }} />
      </View>
    </View>
  );
}

function CategoryCard({ imageUrl, kind, title }: { imageUrl?: string; kind: Product['kind']; title: string }) {
  return (
    <Pressable onPress={() => Alert.alert(title, `${title} models are listed below.`)} style={({ pressed }) => ({ width: 118, height: 120, alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 9, borderRadius: 6, backgroundColor: '#F5F5F6', opacity: pressed ? 0.62 : 1 })}>
      <View style={{ width: 100, height: 78, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? <Image source={{ uri: imageUrl }} contentFit="contain" transition={180} style={{ width: 120, height: 120 }} /> : <ProductArt compact kind={kind} />}
      </View>
      <Text numberOfLines={1} style={{ transform: [{ translateY: -4 }], fontSize: 14, lineHeight: 18, fontWeight: '600', color: '#2E2831' }}>{title}</Text>
    </Pressable>
  );
}

function ProductCard({ onOpen, product }: { onOpen: (productId: string) => void; product: Product }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name} details`} onPress={() => onOpen(product.id)} style={({ pressed }) => ({ width: 162, gap: 7, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ width: 162, height: 145, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10, backgroundColor: '#F4F4F5' }}>{product.imageUrl ? <Image source={{ uri: product.imageUrl }} contentFit="contain" transition={180} style={{ width: '100%', height: '100%' }} /> : <ProductArt kind={product.kind} />}</View>
      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: '#2C2630' }}>{product.name}</Text>
      <Text style={{ fontSize: 12, color: '#5F5963' }}>★ {product.rating}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <View>
          <Text style={{ fontSize: 11, lineHeight: 14, color: '#8A8A8A' }}>Starts at</Text>
          <Text style={{ fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#1A1A1A' }}>{product.price}</Text>
        </View>
        <View style={{ width: 72, height: 40, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name}, ${product.optionsCount ?? 2} options`}
            onPress={() => onOpen(product.id)}
            style={({ pressed }) => ({
              width: 72,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#FAFAFA' : '#FFFFFF',
              borderWidth: 1,
              borderColor: '#D8D8D8',
              borderRadius: 6,
            })}
          >
            <Text style={{ fontSize: 14, lineHeight: 18, fontWeight: '700', color: '#6E45E2' }}>Add</Text>
          </Pressable>
          <Text style={{ marginTop: -7, paddingHorizontal: 4, fontSize: 10, lineHeight: 13, fontWeight: '400', color: '#8A8A8A', backgroundColor: '#FFFFFF' }}>{product.optionsCount ?? 2} options</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ProductSection({ onOpen, products, subtitle, title }: { onOpen: (productId: string) => void; products: Product[]; subtitle?: string; title: string }) {
  return (
    <View style={{ paddingVertical: 24, gap: 16, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
      <View style={{ paddingHorizontal: 20, gap: 4 }}><Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700' }}>{title}</Text>{subtitle ? <Text style={{ fontSize: 13, color: '#68616C' }}>{subtitle}</Text> : null}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{products.map((product) => <ProductCard key={`${title}-${product.name}`} onOpen={onOpen} product={product} />)}</ScrollView>
    </View>
  );
}

function DescriptionImage({ path, slider = false }: { path: string; slider?: boolean }) {
  const [aspectRatio, setAspectRatio] = useState(slider ? 0.78 : 1);
  return (
    <Image
      source={{ uri: resolveNativeMediaUrl(path) }}
      contentFit="contain"
      transition={180}
      onLoad={(event) => {
        const { height, width } = event.source;
        if (width > 0 && height > 0) setAspectRatio(width / height);
      }}
      style={{ width: slider ? 200 : '100%', aspectRatio, borderRadius: slider ? 8 : 0, backgroundColor: '#F5F4F6' }}
    />
  );
}

function DescriptionSection({ media, showTopSeparator = true }: { media: NativeDescriptionMedia; showTopSeparator?: boolean }) {
  if (media.type === 'image') {
    return <View style={{ borderTopWidth: showTopSeparator ? 8 : 0, borderTopColor: '#F4F3F5' }}><DescriptionImage path={media.url} /></View>;
  }

  return (
    <View style={{ paddingVertical: 22, gap: 16, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
      {media.slider_title ? <Text style={{ paddingHorizontal: 20, fontSize: 21, lineHeight: 28, fontWeight: '700', color: '#1A171B' }}>{media.slider_title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {media.slider_images.map((image, index) => <DescriptionImage key={`${media.sort_order}-${index}-${image}`} path={image} slider />)}
      </ScrollView>
    </View>
  );
}

export function NativeScreen({ cart, onAddToCart, onViewCart }: NativeScreenProps) {
  const insets = useSafeAreaInsets();
  const { errorMessage, isLoading, media, retry } = useNativeDescription();
  const { data: productsData, errorMessage: productsError, isLoading: productsLoading, retry: retryProducts } = useNativeProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const showPageLoader = productsLoading || isLoading;
  const nativeCartSummary = useMemo(() => {
    const categoryByProductId = new Map<string, string>();
    productsData.categorySections.forEach((section) => {
      section.products.forEach((product) => categoryByProductId.set(product._id, section.title));
    });
    productsData.newlyLaunched?.products.forEach((product) => {
      if (categoryByProductId.has(product._id)) return;
      const isLock = product.product_name.toLowerCase().includes('lock');
      const matchedCategory = productsData.categories.find((category) => category.name.toLowerCase().includes(isLock ? 'lock' : 'purifier'));
      categoryByProductId.set(product._id, matchedCategory?.name ?? (isLock ? 'Smart Locks' : 'Water Purifiers'));
    });
    const categories = new Set<string>();
    let items = 0;
    Object.entries(cart).forEach(([key, quantity]) => {
      if (quantity <= 0) return;
      const productId = key.split('::')[0];
      const category = categoryByProductId.get(productId);
      if (!category) return;
      items += quantity;
      categories.add(category);
    });
    return { categories: categories.size, items };
  }, [cart, productsData.categories, productsData.categorySections, productsData.newlyLaunched]);
  const showCartBar = nativeCartSummary.items > 0;
  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#FFF' }} contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 18, paddingBottom: showCartBar ? 94 : 0 }}>
      <View style={{ paddingHorizontal: 20, gap: 5 }}><Text style={{ fontSize: 25, lineHeight: 32, fontWeight: '700' }}>Native products</Text><Text style={{ fontSize: 16, lineHeight: 22, fontWeight: '700', color: '#655F68' }}>Innovative products. Designed in India for India.</Text></View>
      {!productsLoading && productsError ? <View style={{ minHeight: 220, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Text style={{ textAlign: 'center', fontSize: 14, lineHeight: 21, color: '#655F68' }}>{productsError}</Text><Pressable accessibilityRole="button" onPress={retryProducts} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: '#6E45E2', opacity: pressed ? 0.7 : 1 })}><Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Retry</Text></Pressable></View> : null}
      {!productsLoading && !productsError ? <>
        <View style={{ paddingHorizontal: 20, paddingVertical: 30, flexDirection: 'row', gap: 18 }}>{productsData.categories.map((category) => <CategoryCard key={category._id} imageUrl={category.category_image ? resolveNativeMediaUrl(category.category_image) : undefined} kind={category.name.toLowerCase().includes('lock') ? 'lock' : 'purifier'} title={category.name} />)}</View>
        {productsData.newlyLaunched ? <ProductSection onOpen={setSelectedProductId} products={productsData.newlyLaunched.products.map(mapNativeProduct)} title={productsData.newlyLaunched.title} /> : null}
        {productsData.categorySections.map((section, index) => <View key={`${section.title}-${index}`}>
          <ProductSection onOpen={setSelectedProductId} products={section.products.map(mapNativeProduct)} subtitle={section.description} title={section.title} />
          {index === 0 ? <Pressable onPress={() => Alert.alert('Compare all models', 'Product comparison will be available soon.')} style={({ pressed }) => ({ minHeight: 66, marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ECE9EE', opacity: pressed ? .6 : 1 })}><Image source={require('../../../assets/compare.png')} contentFit="contain" tintColor="#000000" style={{ width: 23, height: 23 }} /><Text style={{ flex: 1, fontSize: 16, fontWeight: '600' }}>Compare all models</Text><Text style={{ fontSize: 22 }}>›</Text></Pressable> : null}
        </View>)}
      </> : null}
      {!isLoading && errorMessage ? <View style={{ minHeight: 180, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}><Text style={{ textAlign: 'center', fontSize: 14, lineHeight: 21, color: '#655F68' }}>{errorMessage}</Text><Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: '#6E45E2', opacity: pressed ? 0.7 : 1 })}><Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Retry</Text></Pressable></View> : null}
      {!isLoading && !errorMessage ? media.map((item, index) => <DescriptionSection key={`${item.type}-${item.sort_order}`} media={item} showTopSeparator={index !== media.length - 1} />) : null}
    </ScrollView>
    {showPageLoader ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}><LoadingDots /></View> : null}
    {showCartBar ? (
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 88, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: '#E8E5EA', backgroundColor: '#FFFFFF', boxShadow: '0 -5px 16px rgba(20,16,24,0.07)' }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 16, lineHeight: 21, fontWeight: '700', color: '#171419' }}>{nativeCartSummary.items} {nativeCartSummary.items === 1 ? 'item' : 'items'} added</Text>
          <Text style={{ fontSize: 13, lineHeight: 18, color: '#655F68' }}>From {nativeCartSummary.categories} {nativeCartSummary.categories === 1 ? 'category' : 'categories'}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onViewCart} style={({ pressed }) => ({ width: '48%', height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: pressed ? '#5B36CB' : '#6E45E2' })}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>View cart</Text>
        </Pressable>
      </View>
    ) : null}
    <NativeProductDetailModal onAddToCart={onAddToCart} onClose={() => setSelectedProductId(undefined)} productId={selectedProductId} />
    </View>
  );
}
