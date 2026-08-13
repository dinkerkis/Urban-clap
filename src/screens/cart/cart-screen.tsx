import { useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ServiceItem } from '../../data/service-catalog';

type CartScreenProps = {
  cart: Record<string, number>;
  categoryTitle?: string;
  errorMessage: string;
  isLoading: boolean;
  items: ServiceItem[];
  onAdd: (item: ServiceItem) => void;
  onBack?: () => void;
  onExplore: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => void;
  onRetry: () => void;
  showBottomTab?: boolean;
  totalItems: number;
  totalPrice: number;
};

const formatPrice = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`;

export function CartScreen({
  cart,
  categoryTitle,
  errorMessage,
  isLoading,
  items,
  onAdd,
  onBack,
  onExplore,
  onProductPress,
  onRemove,
  onRetry,
  showBottomTab = false,
  totalItems,
  totalPrice,
}: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const [showBillSummary, setShowBillSummary] = useState(false);
  const cartItems = items.filter((item) => (cart[item.id] ?? 0) > 0);
  const actionBottom = showBottomTab ? (process.env.EXPO_OS === 'ios' ? 112 : insets.bottom + 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 17,
          paddingHorizontal: 20,
          minHeight: insets.top + 72,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 17,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E8E8',
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onBack}
            style={({ pressed }) => ({ width: 30, height: 36, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: 31, lineHeight: 34, fontWeight: '400', color: '#171319' }}>‹</Text>
          </Pressable>
        ) : null}
        <Text selectable style={{ fontSize: 22, lineHeight: 28, fontWeight: '600', color: '#171319' }}>Your cart</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: actionBottom + 112 }}
      >
        {isLoading ? (
          <View style={{ flex: 1, minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator color="#6E45E2" />
            <Text selectable style={{ fontSize: 13, color: '#77717D' }}>Loading your cart...</Text>
          </View>
        ) : errorMessage && cartItems.length === 0 ? (
          <View style={{ flex: 1, minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 26 }}>
            <Text style={{ fontSize: 30 }}>⚠️</Text>
            <Text selectable style={{ textAlign: 'center', fontSize: 13, lineHeight: 19, color: '#77717D' }}>{errorMessage}</Text>
            <Pressable onPress={onRetry} style={{ minWidth: 132, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#6E45E2' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Try again</Text>
            </Pressable>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={{ flex: 1, minHeight: 460, alignItems: 'center', justifyContent: 'center', gap: 11, paddingHorizontal: 24 }}>
            <View style={{ width: 86, height: 86, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: '#F0EBFF' }}>
              <Text style={{ fontSize: 39 }}>🛒</Text>
            </View>
            <Text selectable style={{ paddingTop: 4, fontSize: 20, fontWeight: '600', color: '#211A28' }}>Your cart is empty</Text>
            <Text selectable style={{ maxWidth: 280, textAlign: 'center', fontSize: 13, lineHeight: 19, color: '#77717D' }}>
              Add a service package and it will appear here.
            </Text>
            <Pressable onPress={onExplore} style={{ minWidth: 170, height: 46, marginTop: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#6E45E2' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Browse categories</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 18, gap: 16, backgroundColor: '#FFFFFF' }}>
              <Text selectable style={{ fontSize: 23, lineHeight: 30, fontWeight: '600', color: '#171319' }}>
                {categoryTitle || 'Selected services'}
              </Text>

              {cartItems.map((item, index) => {
                const quantity = cart[item.id] ?? 0;
                return (
                  <View key={item.id}>
                    {index > 0 ? <View style={{ height: 1, marginBottom: 18, backgroundColor: '#ECEAEC' }} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onProductPress(item)}
                      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, opacity: pressed ? 0.72 : 1 })}
                    >
                      {item.imageUrl ? (
                        <View style={{ width: 84, height: 84, overflow: 'hidden', borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#F3F1F4' }}>
                          <Image
                            accessibilityLabel={item.title}
                            contentFit="cover"
                            source={{ uri: item.imageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            transition={180}
                          />
                        </View>
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <Text selectable style={{ fontSize: 17, lineHeight: 23, fontWeight: '600', color: '#211A28' }}>{item.title}</Text>
                        <Text selectable numberOfLines={2} style={{ paddingTop: 5, fontSize: 13, lineHeight: 18, color: '#716A76' }}>
                          {item.selectedVariantLabel || item.description || 'At home service'}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={{ paddingTop: 16, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ minWidth: 126, height: 46, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: '#CDBCFB', backgroundColor: '#F7F3FF' }}>
                        <Pressable accessibilityLabel={`Remove one ${item.title}`} hitSlop={10} onPress={() => onRemove(item)} style={{ width: 31, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 25, lineHeight: 28, fontWeight: '400', color: '#6E45E2' }}>−</Text>
                        </Pressable>
                        <Text selectable style={{ minWidth: 22, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#6E45E2', fontVariant: ['tabular-nums'] }}>{quantity}</Text>
                        <Pressable accessibilityLabel={`Add one ${item.title}`} hitSlop={10} onPress={() => onAdd(item)} style={{ width: 31, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 24, lineHeight: 28, fontWeight: '400', color: '#6E45E2' }}>＋</Text>
                        </Pressable>
                      </View>
                      <Text selectable style={{ marginLeft: 'auto', fontSize: 17, fontWeight: '600', color: '#171319', fontVariant: ['tabular-nums'] }}>
                        {formatPrice(item.serverLineTotal ?? item.price * quantity)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowBillSummary(true)}
              style={({ pressed }) => ({
                marginTop: 10,
                minHeight: 108,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? '#FBF9FD' : '#FFFFFF',
              })}
            >
              <View style={{ width: 35, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 27 }}>▤</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 13 }}>
                <Text selectable style={{ fontSize: 17, lineHeight: 23, color: '#211A28' }}>
                  Total bill <Text style={{ fontWeight: '600' }}>{formatPrice(totalPrice)}</Text>
                </Text>
                <Text selectable style={{ paddingTop: 4, fontSize: 13, lineHeight: 18, color: '#716A76' }}>Incl. govt. taxes &amp; charges</Text>
              </View>
              <Text style={{ fontSize: 30, color: '#171319' }}>›</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && !isLoading ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: actionBottom, paddingHorizontal: 20, paddingTop: 12, paddingBottom: showBottomTab ? 10 : Math.max(insets.bottom, 12), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E7E4E8' }}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => ({ height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}
          >
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Add address and slot</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal animationType="fade" transparent visible={showBillSummary} onRequestClose={() => setShowBillSummary(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 18, 21, 0.80)' }}>
          <Pressable accessibilityLabel="Close bill summary" onPress={() => setShowBillSummary(false)} style={{ position: 'absolute', right: 24, bottom: 448, zIndex: 2, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 31, lineHeight: 34, fontWeight: '300', color: '#171319' }}>×</Text>
          </Pressable>
          <View style={{ paddingTop: 28, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12), borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#FFFFFF' }}>
            <Text selectable style={{ fontSize: 28, lineHeight: 35, fontWeight: '600', color: '#171319' }}>Bill summary</Text>
            <BillRow label="Item total" value={totalPrice} />
            <View style={{ height: 1, backgroundColor: '#E4E2E4' }} />
            <BillRow bold label="Total bill" value={totalPrice} />
            <View style={{ height: 1, backgroundColor: '#E4E2E4' }} />
            <BillRow bold label="Amount to pay" value={totalPrice} />
            <Pressable onPress={() => setShowBillSummary(false)} style={({ pressed }) => ({ height: 56, marginTop: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Okay, got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BillRow({ bold = false, label, value }: { bold?: boolean; label: string; value: number }) {
  return (
    <View style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center' }}>
      <Text selectable style={{ flex: 1, fontSize: 17, fontWeight: bold ? '800' : '500', color: '#171319' }}>{label}</Text>
      <Text selectable style={{ fontSize: 17, fontWeight: '600', color: '#171319', fontVariant: ['tabular-nums'] }}>{formatPrice(value)}</Text>
    </View>
  );
}
