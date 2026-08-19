import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Product = { kind: 'lock' | 'purifier'; name: string; price: string; rating: string };

const newlyLaunched: Product[] = [
  { kind: 'lock', name: 'Native Lock Ultra', rating: '4.67 (1K)', price: '₹24,999' },
  { kind: 'purifier', name: 'Native M2 Pro', rating: '4.83 (120K)', price: '₹17,999' },
  { kind: 'purifier', name: 'Native M1 Pro', rating: '4.85 (7K)', price: '₹15,999' },
];
const purifiers: Product[] = [
  { kind: 'purifier', name: 'Native M2 Pro', rating: '4.83 (120K)', price: '₹17,999' },
  { kind: 'purifier', name: 'Native M1 Pro', rating: '4.85 (7K)', price: '₹15,999' },
  { kind: 'purifier', name: 'Native M1', rating: '4.86 (155K)', price: '₹14,999' },
];
const locks: Product[] = [
  { kind: 'lock', name: 'Native Lock Ultra', rating: '4.67 (1K)', price: '₹24,999' },
  { kind: 'lock', name: 'Native Lock Pro', rating: '4.81 (21K)', price: '₹17,299' },
];

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

function CategoryCard({ kind, title }: { kind: Product['kind']; title: string }) {
  return (
    <Pressable onPress={() => Alert.alert(title, `${title} models are listed below.`)} style={({ pressed }) => ({ width: 122, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}>
      <View style={{ width: 118, height: 92, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F5F5F6' }}><ProductArt compact kind={kind} /></View>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#2E2831' }}>{title}</Text>
    </Pressable>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <View style={{ width: 162, gap: 7 }}>
      <View style={{ width: 162, height: 145, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F4F4F5' }}><ProductArt kind={product.kind} /></View>
      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: '#2C2630' }}>{product.name}</Text>
      <Text style={{ fontSize: 12, color: '#5F5963' }}>★ {product.rating}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <View>
          <Text style={{ fontSize: 11, lineHeight: 14, color: '#8A8A8A' }}>Starts at</Text>
          <Text style={{ fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#1A1A1A' }}>{product.price}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name}, 2 options`}
          onPress={() => Alert.alert(product.name, 'Product options will be available soon.')}
          style={({ pressed }) => ({
            minWidth: 72,
            paddingHorizontal: 11,
            paddingVertical: 5,
            backgroundColor: pressed ? '#FAFAFA' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#D8D8D8',
            borderRadius: 10,
          })}
        >
          <Text
            numberOfLines={2}
            style={{ textAlign: 'center', fontSize: 14, lineHeight: 18, fontWeight: '700', color: '#6E45E2' }}
          >
            {`Add\n`}
            <Text style={{ fontSize: 10, lineHeight: 13, fontWeight: '400', color: '#8A8A8A' }}>2 options</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProductSection({ products, subtitle, title }: { products: Product[]; subtitle?: string; title: string }) {
  return (
    <View style={{ paddingVertical: 24, gap: 16, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
      <View style={{ paddingHorizontal: 20, gap: 4 }}><Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700' }}>{title}</Text>{subtitle ? <Text style={{ fontSize: 13, color: '#68616C' }}>{subtitle}</Text> : null}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{products.map((product) => <ProductCard key={`${title}-${product.name}`} product={product} />)}</ScrollView>
    </View>
  );
}

export function NativeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#FFF' }} contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 18, paddingBottom: 94 + insets.bottom }}>
      <View style={{ paddingHorizontal: 20, gap: 5 }}><Text style={{ fontSize: 25, lineHeight: 32, fontWeight: '700' }}>Native products</Text><Text style={{ fontSize: 14, color: '#655F68' }}>Innovative products. Designed in India for India.</Text></View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 30, flexDirection: 'row', gap: 18 }}><CategoryCard kind="purifier" title="Water Purifiers" /><CategoryCard kind="lock" title="Smart Locks" /></View>
      <ProductSection products={newlyLaunched} title="Newly launched" />
      <ProductSection products={purifiers} subtitle="No service for 2 years" title="Water Purifiers" />
      <Pressable onPress={() => Alert.alert('Compare all models', 'Product comparison will be available soon.')} style={({ pressed }) => ({ minHeight: 66, marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ECE9EE', opacity: pressed ? .6 : 1 })}><Text style={{ fontSize: 24 }}>▦</Text><Text style={{ flex: 1, fontSize: 16, fontWeight: '600' }}>Compare all models</Text><Text style={{ fontSize: 22 }}>›</Text></Pressable>
      <ProductSection products={locks} subtitle="Advanced and secure locks" title="Smart Door Locks" />

      <View style={{ padding: 20, gap: 20, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
        <Text style={{ fontSize: 22, lineHeight: 29, fontWeight: '700' }}>UC app exclusive. Even more reason to buy from here.</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, minHeight: 132, padding: 16, gap: 5, borderRadius: 12, backgroundColor: '#F3F8F5' }}><Text style={{ fontSize: 15, fontWeight: '600' }}>Get extra</Text><Text style={{ fontSize: 20, fontWeight: '700', color: '#16845B' }}>₹1,500 off</Text><Text style={{ fontSize: 12, color: '#716A74' }}>With bank offers</Text><Text style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 31 }}>💳</Text></View>
          <View style={{ flex: 1, minHeight: 132, padding: 16, gap: 5, borderRadius: 12, backgroundColor: '#F5F3FA' }}><Text style={{ fontSize: 15, lineHeight: 21, fontWeight: '600' }}>Exchange your old RO to get up to</Text><Text style={{ fontSize: 20, fontWeight: '700', color: '#16845B' }}>₹800 off</Text><Text style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 31 }}>🔁</Text></View>
        </View>
      </View>

      <View style={{ padding: 20, gap: 18, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
        <Text style={{ fontSize: 21, fontWeight: '700' }}>UC app service advantages</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, minHeight: 190, padding: 16, justifyContent: 'space-between', borderRadius: 12, backgroundColor: '#F4F4F5' }}><View style={{ gap: 5 }}><Text style={{ fontSize: 15, fontWeight: '600' }}>Professional installation</Text><Text style={{ fontSize: 12, lineHeight: 17, color: '#767078' }}>Only top technicians trained by UC.</Text></View><Text style={{ alignSelf: 'center', fontSize: 54 }}>🧑‍🔧</Text></View>
          <View style={{ flex: 1, minHeight: 190, padding: 16, justifyContent: 'space-between', borderRadius: 12, backgroundColor: '#F4F4F5' }}><View style={{ gap: 5 }}><Text style={{ fontSize: 15, fontWeight: '600' }}>24×7 expert support</Text><Text style={{ fontSize: 12, lineHeight: 17, color: '#767078' }}>Talk to experts who understand the product.</Text></View><Text style={{ alignSelf: 'center', fontSize: 54 }}>🎧</Text></View>
        </View>
      </View>

      <View style={{ padding: 20, gap: 8, borderTopWidth: 8, borderTopColor: '#F4F3F5' }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>For business enquiries</Text><Text style={{ fontSize: 14, lineHeight: 21, color: '#605A63' }}>Looking to buy Native products in bulk or become a distributor? Write to us at</Text><Text selectable style={{ fontSize: 14, fontWeight: '600', color: '#0879C7' }}>nativequeries@urbanclap.com</Text>
        <View style={{ minHeight: 180, marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16, borderRadius: 12, backgroundColor: '#F0F0F1' }}><ProductArt kind="purifier" /><ProductArt kind="lock" /></View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 30, gap: 15, backgroundColor: '#171719' }}>
        <Text style={{ fontSize: 26, lineHeight: 33, fontWeight: '700', color: '#FFF' }}>Designed in India.{`\n`}For Indian homes.</Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: '#E2E0E4' }}>At Urban Clap, we spent years inside Indian homes, servicing products across brands. We saw that the smart-home industry was not built around everyday consumers.</Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: '#E2E0E4' }}>So we asked a different question: what if we built products people never had to think about? Products that worked quietly and reliably for years.</Text>
        <Text style={{ fontSize: 14, lineHeight: 22, fontWeight: '600', color: '#FFF' }}>Today, Native builds beautiful smart water purifiers and smart door locks—designed, engineered and built in India.</Text>
      </View>
    </ScrollView>
  );
}
