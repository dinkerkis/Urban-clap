import { colors, fontFamilies, fontSizes } from '../../theme';
import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { CloseButton } from '../../components/close-icon';
import { DottedUnderline } from '../../components/dotted-underline';
import { EditIcon } from '../../components/edit-icon';
import { LoadingDots } from '../../components/loading-dots';
import type { ServiceItem } from '../../data/service-catalog';
import { useAddresses } from '../../hooks/use-addresses';
import { formatAddressLabel, formatSavedAddress, setDefaultAddress, type UserAddress } from '../../services/address-api';
import type { CartCategoryGroup } from '../../services/cart-api';
import { AddressDetailsSheet, ContactDetailsModal, formatContactPhone, LocationSearchSheet, type SelectedPlace } from '../manage-addresses/manage-addresses-screen';

type CartScreenProps = {
  authToken?: string;
  cart: Record<string, number>;
  categoryGroups?: CartCategoryGroup[];
  categoryTitle?: string;
  consultationMode?: boolean;
  errorMessage: string;
  isLoading: boolean;
  itemsSubtotal?: number;
  items: ServiceItem[];
  name?: string;
  onAdd: (item: ServiceItem) => void;
  onAddMoreItems?: (categoryId: string) => void;
  onBack?: () => void;
  onExplore: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => Promise<void> | void;
  onRetry: () => void;
  phone?: string;
  showBottomTab?: boolean;
  totalItems: number;
  totalPrice: number;
  grandTotal?: number;
};

const formatPrice = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`;

export function CartScreen({
  authToken,
  cart,
  categoryGroups = [],
  categoryTitle,
  consultationMode = false,
  errorMessage,
  isLoading,
  itemsSubtotal,
  items,
  name,
  onAdd,
  onAddMoreItems,
  onBack,
  onExplore,
  onProductPress,
  onRemove,
  onRetry,
  phone,
  showBottomTab = false,
  totalItems,
  totalPrice,
  grandTotal,
}: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const [showBillSummary, setShowBillSummary] = useState(false);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<CartCategoryGroup | null>(null);
  const [addressSheet, setAddressSheet] = useState<'saved' | 'search' | 'details' | 'slot' | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<string | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState<UserAddress | null>(null);
  const [contactEditorVisible, setContactEditorVisible] = useState(false);
  const [contactOverride, setContactOverride] = useState<{ name: string; phone: string } | null>(null);
  const [isSettingDefaultAddress, setIsSettingDefaultAddress] = useState(false);
  const addressState = useAddresses(authToken);
  const cartItems = items.filter((item) => (cart[item.id] ?? 0) > 0);
  const displayedCartItems = consultationMode ? cartItems.slice(0, 1) : cartItems;
  const displayedItemsSubtotal = consultationMode ? (cartItems.length > 0 ? 49 : 0) : (itemsSubtotal ?? totalPrice);
  const displayedTotalPrice = consultationMode ? displayedItemsSubtotal : (grandTotal ?? totalPrice);
  const displayedTaxesAndCharges = Math.max(0, displayedTotalPrice - displayedItemsSubtotal);
  const groupedCartItems = displayedCartItems.reduce<Array<{ id: string; name: string; items: ServiceItem[]; total?: number }>>((groups, item) => {
    const id = item.cartCategoryId || 'selected-services';
    const existing = groups.find((group) => group.id === id);
    if (existing) existing.items.push(item);
    else groups.push({ id, name: item.cartCategoryName || categoryTitle || 'Selected services', items: [item], total: item.cartCategoryTotal });
    return groups;
  }, []);
  const hasMultipleCategories = groupedCartItems.length > 1;
  const billCategoryGroups = categoryGroups.length > 0
    ? categoryGroups
    : groupedCartItems.map((group) => {
        const subtotal = group.items.reduce((total, item) => total + (item.serverLineTotal ?? item.price * (cart[item.id] ?? 0)), 0);
        return {
          category_id: group.id,
          category_name: group.name,
          categoryTotal: group.total ?? subtotal,
          charges: { govtTax: 0, platformFee: 0, visitationFee: 0 },
          items: [],
          subtotal,
        };
      });
  const displayedContactName = contactOverride?.name || checkoutAddress?.contactName?.trim() || name?.trim() || 'User';
  const rawContactPhone = contactOverride?.phone || checkoutAddress?.contactPhone?.trim() || phone?.trim() || '';
  const displayedContactPhone = formatContactPhone(rawContactPhone);
  const checkoutReady = Boolean(checkoutAddress && selectedSlotDate && selectedSlotTime);
  const actionBottom = showBottomTab ? 64 + insets.bottom : 0;
  const actionHeight = checkoutReady ? 226 : checkoutAddress ? 168 : 112;
  const removeConsultation = async (item: ServiceItem, quantity: number) => {
    for (let count = 0; count < quantity; count += 1) await onRemove(item);
  };
  const clearConsultation = async () => {
    for (const item of cartItems) {
      await removeConsultation(item, cart[item.id] ?? 0);
    }
  };

  const openNewAddressFlow = () => {
    setSelectedPlace(null);
    setAddressSheet('search');
  };

  const openAddressAndSlot = () => {
    if (addressState.isLoading) return;
    if (addressState.addresses.length > 0) {
      const preferred = addressState.addresses.find((address) => address.isDefault) ?? addressState.addresses[0];
      setSelectedAddressId(preferred._id);
      setAddressSheet('saved');
      return;
    }
    openNewAddressFlow();
  };

  const openSlotSheet = () => {
    setSelectedSlotDate(null);
    setSelectedSlotTime(null);
    setAddressSheet('slot');
  };

  const selectCheckoutAddress = async (address: UserAddress) => {
    if (isSettingDefaultAddress) return;
    setIsSettingDefaultAddress(true);
    let selectedAddress = address;

    try {
      if (authToken && !address.isDefault) {
        selectedAddress = await setDefaultAddress(authToken, address._id);
        addressState.retry();
      }
    } catch {
      Alert.alert(
        'Address selected',
        'This address could not be made your default, but you can continue with this booking.',
      );
    } finally {
      setIsSettingDefaultAddress(false);
    }

    setCheckoutAddress(selectedAddress);
    setSelectedAddressId(selectedAddress._id);
    openSlotSheet();
  };

  const proceedWithSavedAddress = () => {
    const address = addressState.addresses.find((item) => item._id === selectedAddressId);
    if (!address) return;
    void selectCheckoutAddress(address);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutralTone96 }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 17,
          paddingHorizontal: 20,
          minHeight: insets.top + 72,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.violetTone98_3,
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onBack}
            style={({ pressed }) => ({ width: 30, height: 36, alignItems: 'flex-start', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
          >
            <BackIcon color={colors.mauveTone9} />
          </Pressable>
        ) : null}
        <Text selectable style={{ fontSize: fontSizes.size20, lineHeight: 26, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>Your cart</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: isLoading ? 0 : actionBottom + actionHeight }}
      >
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LoadingDots />
          </View>
        ) : errorMessage && cartItems.length === 0 ? (
          <View style={{ flex: 1, minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 26 }}>
            <Text style={{ fontSize: fontSizes.size30 }}>⚠️</Text>
            <Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 19, color: colors.violetTone47 }}>{errorMessage}</Text>
            <Pressable onPress={onRetry} style={{ minWidth: 132, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.violetTone58 }}>
              <Text style={{ fontSize: fontSizes.size13, fontFamily: fontFamilies.semiBold, color: colors.white }}>Try again</Text>
            </Pressable>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={{ flex: 1, minHeight: 500, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.white }}>
            <Text accessibilityLabel="Empty shopping cart" style={{ fontSize: fontSizes.size62, lineHeight: 72 }}>🛒</Text>
            <Text selectable style={{ paddingTop: 28, fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.semiBold, color: colors.violetTone13 }}>Hey, it feels so empty here.</Text>
            <Text selectable style={{ paddingTop: 12, fontSize: fontSizes.size14, lineHeight: 20, color: colors.violetTone44 }}>Lets add some services</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onExplore}
              style={({ pressed }) => ({ minWidth: 132, height: 38, marginTop: 16, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 0.5, borderColor: colors.violetTone85, backgroundColor: pressed ? colors.violetTone98 : colors.white })}
            >
              <Text style={{ fontSize: fontSizes.size13, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>Explore services</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: colors.white }}>
              {groupedCartItems.map((group, groupIndex) => (
                <View key={group.id} style={{ paddingHorizontal: 20, paddingTop: groupIndex === 0 ? 30 : 24, paddingBottom: 22, gap: 16, borderTopWidth: groupIndex === 0 ? 0 : 8, borderTopColor: colors.violetTone98_3 }}>
                  <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 25, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>
                    {group.name}
                  </Text>

                  {group.items.map((item, index) => {
                const quantity = cart[item.id] ?? 0;
                if (consultationMode) {
                  return (
                    <View key={item.id}>
                      {index > 0 ? <View style={{ height: 1, marginBottom: 14, backgroundColor: colors.violetTone98_3 }} /> : null}
                      <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center' }}>
                        <Text selectable style={{ flex: 1, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone30 }}>At home consultation</Text>
                        <View style={{ width: 94, height: 36, marginHorizontal: 14, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 9, borderWidth: 1, borderColor: colors.violetTone86, backgroundColor: colors.violetTone98 }}>
                          <Pressable accessibilityLabel="Remove consultation" hitSlop={11} onPress={() => void clearConsultation()} style={{ width: 24, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: fontSizes.size18, lineHeight: 21, color: colors.violetTone58 }}>−</Text>
                          </Pressable>
                          <Text selectable style={{ minWidth: 16, textAlign: 'center', fontSize: fontSizes.size14, fontFamily: fontFamilies.bold, color: colors.violetTone58, fontVariant: ['tabular-nums'] }}>1</Text>
                          <Pressable accessibilityLabel="Consultation quantity is limited to one" accessibilityState={{ disabled: true }} disabled style={{ width: 24, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: fontSizes.size17, lineHeight: 21, color: colors.violetTone77 }}>＋</Text>
                          </Pressable>
                        </View>
                        <Text selectable style={{ minWidth: 38, textAlign: 'right', fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9, fontVariant: ['tabular-nums'] }}>₹49</Text>
                      </View>
                    </View>
                  );
                }
                return (
                  <View key={item.id}>
                    <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Pressable accessibilityRole="button" onPress={() => onProductPress(item)} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.65 : 1 })}>
                        <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 20, color: colors.black }}>{item.title}</Text>
                      </Pressable>
                      <View style={{ width: 78, height: 32, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 8, borderWidth: 1, borderColor: colors.violetTone86, backgroundColor: colors.violetTone98 }}>
                        <Pressable accessibilityLabel={`Remove one ${item.title}`} hitSlop={11} onPress={() => onRemove(item)} style={{ width: 22, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: fontSizes.size15, lineHeight: 18, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>−</Text>
                        </Pressable>
                        <Text selectable style={{ minWidth: 18, textAlign: 'center', fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.violetTone58, fontVariant: ['tabular-nums'] }}>{quantity}</Text>
                        <Pressable accessibilityLabel={`Add one ${item.title}`} hitSlop={11} onPress={() => onAdd(item)} style={{ width: 22, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: fontSizes.size15, lineHeight: 18, fontFamily: fontFamilies.regular, color: colors.violetTone58 }}>＋</Text>
                        </Pressable>
                      </View>
                      <Text selectable style={{ minWidth: 70, textAlign: 'right', fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9, fontVariant: ['tabular-nums'] }}>
                        {formatPrice(item.serverLineTotal ?? item.price * quantity)}
                      </Text>
                    </View>
                    {item.selectedVariantLabel ? (
                      <View style={{ paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.black }} />
                        <Text selectable style={{ flex: 1, fontSize: fontSizes.size13, lineHeight: 19, color: colors.black }}>
                          {item.selectedVariantLabel} ×{quantity}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
                  })}

                  {!consultationMode ? (
                    <>
                      <DottedUnderline fullWidth lineMarginTop={0} dotColor={colors.mauveTone86}>
                        <View />
                      </DottedUnderline>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          if (onAddMoreItems) {
                            onAddMoreItems(group.id);
                            return;
                          }
                          onExplore();
                        }}
                        style={({ pressed }) => ({ minHeight: 36, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1 })}
                      >
                        <Image source={require('../../../assets/add.png')} contentFit="contain" tintColor={colors.violetTone58} style={{ width: 18, height: 18, marginRight: 7 }} />
                        <Text style={{ fontSize: fontSizes.size14, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>Add more items</Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Coupons and offers', 'No coupons are available right now.')}
              style={({ pressed }) => ({
                minHeight: 64,
                marginTop: 8,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? colors.violetTone98_3 : colors.white,
              })}
            >
              <View style={{ width: 28, alignItems: 'flex-start' }}>
                <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.tealTone26 }}>
                  <Text style={{ fontSize: fontSizes.size10, lineHeight: 12, fontFamily: fontFamilies.bold, color: colors.white }}>%</Text>
                </View>
              </View>
              <Text selectable style={{ flex: 1, paddingLeft: 7, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone15_3 }}>Coupons and offers</Text>
              <Text style={{ fontSize: fontSizes.size14, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>View all</Text>
              <Text style={{ marginLeft: 8, fontSize: fontSizes.size22, lineHeight: 24, color: colors.violetTone58 }}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setContactEditorVisible(true)}
              style={({ pressed }) => ({
                minHeight: 64,
                marginTop: 8,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? colors.violetTone98_3 : colors.white,
              })}
            >
              <View style={{ width: 28, alignItems: 'flex-start' }}>
                <Image source={require('../../../assets/voice_calls.png')} contentFit="contain" tintColor={colors.violetTone13} style={{ width: 18, height: 18 }} />
              </View>
              <Text numberOfLines={1} selectable style={{ flex: 1, paddingLeft: 7, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone15_3 }}>
                {displayedContactName}, {displayedContactPhone}
              </Text>
              <Text style={{ marginLeft: 12, fontSize: fontSizes.size14, lineHeight: 20, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>Change</Text>
            </Pressable>

            {hasMultipleCategories ? (
              <View style={{ marginTop: 8, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 18, backgroundColor: colors.white }}>
                <Text selectable style={{ fontSize: fontSizes.size22, lineHeight: 29, fontFamily: fontFamilies.bold, color: colors.mauveTone9 }}>Bill summary</Text>
                <View style={{ paddingTop: 16, gap: 14 }}>
                  {billCategoryGroups.map((group) => {
                    return (
                      <Pressable
                        key={group.category_id}
                        accessibilityRole="button"
                        accessibilityLabel={`View ${group.category_name} bill details`}
                        onPress={() => setSelectedCategoryGroup(group)}
                        style={({ pressed }) => ({ minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.6 : 1 })}
                      >
                        <View style={{ flex: 1 }}>
                          <DottedUnderline dotColor={colors.mauveTone77}>
                            <Text selectable numberOfLines={1} style={{ fontSize: fontSizes.size14, lineHeight: 20, color: colors.black }}>{group.category_name}</Text>
                          </DottedUnderline>
                        </View>
                        <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone15_3, fontVariant: ['tabular-nums'] }}>{formatPrice(group.categoryTotal)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={{ height: 1, marginTop: 14, backgroundColor: colors.violetTone98_3 }} />
                <BillRow bold label="Total bill" value={displayedTotalPrice} />
                <Text selectable style={{ marginTop: -14, paddingBottom: 12, fontSize: fontSizes.size12, lineHeight: 17, color: colors.violetTone44 }}>Incl. govt. taxes &amp; charges</Text>
                <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />
                <BillRow bold label="Amount to pay" value={displayedTotalPrice} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowBillSummary(true)}
                style={({ pressed }) => ({
                  marginTop: 8,
                  minHeight: 94,
                  paddingHorizontal: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: pressed ? colors.violetTone98_3 : colors.white,
                })}
              >
                <View style={{ width: 32, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={require('../../../assets/receipt.png')} contentFit="contain" style={{ width: 22, height: 22 }} />
                </View>
                <View style={{ flex: 1, paddingLeft: 11 }}>
                  <Text selectable style={{ fontSize: fontSizes.size15, lineHeight: 21, color: colors.violetTone13 }}>
                    Total bill <Text style={{ fontFamily: fontFamilies.semiBold }}>{formatPrice(displayedTotalPrice)}</Text>
                  </Text>
                  <Text selectable style={{ paddingTop: 3, fontSize: fontSizes.size12, lineHeight: 17, color: colors.violetTone44 }}>Incl. govt. taxes &amp; charges</Text>
                </View>
                <Text style={{ fontSize: fontSizes.size26, color: colors.mauveTone9 }}>›</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && !isLoading && !contactEditorVisible ? (
        <View
          style={{
            position: 'absolute',
            zIndex: 30,
            opacity: 1,
            left: 0,
            right: 0,
            bottom: actionBottom,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: showBottomTab ? 9 : Math.max(insets.bottom, 10),
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: colors.violetTone98_3,
            boxShadow: `0 -3px 10px ${colors.mauveTone9Alpha6}`,
          }}
        >
          {checkoutAddress ? (
            <>
              <CheckoutDetailRow icon={<Image source={require('../../../assets/addresses.png')} contentFit="contain" style={{ width: 18, height: 18 }} />} label={`${formatAddressLabel(checkoutAddress.label)} - ${formatSavedAddress(checkoutAddress)}`} onPress={() => void openAddressAndSlot()} />
              {checkoutReady && selectedSlotDate && selectedSlotTime ? (
                <>
                  <CheckoutDetailRow icon={<Image source={require('../../../assets/time.png')} contentFit="contain" style={{ width: 16, height: 16 }} />} label={formatCheckoutSlot(selectedSlotDate, selectedSlotTime)} onPress={() => setAddressSheet('slot')} />
                  <Pressable accessibilityRole="button" onPress={() => Alert.alert('Payment', 'Payment flow will be connected here.')} style={({ pressed }) => ({ height: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? colors.violetTone51 : colors.violetTone58 })}>
                    <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.white }}>Proceed to pay</Text>
                  </Pressable>
                  <Text style={{ marginTop: 8, textAlign: 'center', fontSize: fontSizes.size10_5, lineHeight: 15, color: colors.mauveTone38_2 }}>By proceeding, you agree to our <Text style={{ fontFamily: fontFamilies.bold, textDecorationLine: 'underline' }}>T&amp;C</Text>, <Text style={{ fontFamily: fontFamilies.bold, textDecorationLine: 'underline' }}>Privacy</Text> and <Text style={{ fontFamily: fontFamilies.bold, textDecorationLine: 'underline' }}>Cancellation Policy</Text>.</Text>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAddressSheet('slot')}
                  style={({ pressed }) => ({ height: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? colors.violetTone51 : colors.violetTone58 })}
                >
                  <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.white }}>Select slot</Text>
                </Pressable>
              )}
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={addressState.isLoading}
              onPress={() => void openAddressAndSlot()}
              style={({ pressed }) => ({ height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? colors.violetTone51 : colors.violetTone58 })}
            >
              {addressState.isLoading ? <LoadingDots color={colors.white} gap={6} size={5} /> : <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.white }}>Add address and slot</Text>}
            </Pressable>
          )}
        </View>
      ) : null}

      <Modal animationType="slide" transparent visible={showBillSummary} onRequestClose={() => setShowBillSummary(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.mauveTone8Alpha80 }}>
          <CloseButton accessibilityLabel="Close bill summary" color={colors.mauveTone9} floating onPress={() => setShowBillSummary(false)} />
          <View style={{ paddingTop: 24, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12), borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: colors.white }}>
            <Text selectable style={{ fontSize: fontSizes.size24, lineHeight: 31, fontFamily: fontFamilies.bold, color: colors.mauveTone9 }}>Bill summary</Text>
            <BillRow label="Item total" value={displayedItemsSubtotal} />
            {displayedTaxesAndCharges > 0 ? <BillRow label="Taxes & charges" value={displayedTaxesAndCharges} /> : null}
            <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />
            <BillRow bold label="Total bill" value={displayedTotalPrice} />
            <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />
            <BillRow bold label="Amount to pay" value={displayedTotalPrice} />
            <Pressable onPress={() => setShowBillSummary(false)} style={({ pressed }) => ({ height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? colors.violetTone51 : colors.violetTone58 })}>
              <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.white }}>Okay, got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={Boolean(selectedCategoryGroup)} onRequestClose={() => setSelectedCategoryGroup(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.mauveTone8Alpha80 }}>
          <CloseButton accessibilityLabel="Close category bill details" color={colors.mauveTone9} floating onPress={() => setSelectedCategoryGroup(null)} />
          {selectedCategoryGroup ? (
            <View style={{ paddingTop: 24, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12), borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: colors.white }}>
              <Text selectable style={{ fontSize: fontSizes.size24, lineHeight: 31, fontFamily: fontFamilies.bold, color: colors.mauveTone9 }}>{selectedCategoryGroup.category_name}</Text>
              <View style={{ paddingTop: 8 }}>
                <BillRow compact label="Item total" minHeight={36} value={selectedCategoryGroup.subtotal} />
              </View>
              {selectedCategoryGroup.charges.visitationFee > 0 ? <BillRow compact label="Visitation fee" value={selectedCategoryGroup.charges.visitationFee} /> : null}
              {selectedCategoryGroup.charges.platformFee > 0 ? <BillRow compact dottedLabel label="Platform fee" minHeight={36} value={selectedCategoryGroup.charges.platformFee} /> : null}
              {selectedCategoryGroup.charges.govtTax > 0 ? (
                <View style={{ paddingBottom: 6 }}>
                  <BillRow compact dottedLabel label="Est. Govt. taxes" minHeight={36} value={selectedCategoryGroup.charges.govtTax} />
                </View>
              ) : null}
              <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />
              <BillRow bold compact label="Total bill" value={selectedCategoryGroup.categoryTotal} />
              <View style={{ height: 1, backgroundColor: colors.violetTone98_3 }} />
              <BillRow bold compact label="Amount to pay" value={selectedCategoryGroup.categoryTotal} />
              <Pressable accessibilityRole="button" onPress={() => setSelectedCategoryGroup(null)} style={({ pressed }) => ({ height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: pressed ? colors.violetTone51 : colors.violetTone58 })}>
                <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.white }}>Okay, got it</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>

      {contactEditorVisible ? (
        <ContactDetailsModal
          initialName={displayedContactName}
          initialPhone={rawContactPhone}
          onClose={() => setContactEditorVisible(false)}
          onSave={(nextName, nextPhone) => {
            setContactOverride({ name: nextName, phone: nextPhone });
            setContactEditorVisible(false);
          }}
        />
      ) : null}

      <Modal animationType="slide" transparent visible={addressSheet === 'saved'} onRequestClose={() => setAddressSheet(null)}>
        <SavedAddressSheet
          addresses={addressState.addresses}
          isProceeding={isSettingDefaultAddress}
          selectedAddressId={selectedAddressId}
          onAddAnother={openNewAddressFlow}
          onClose={() => setAddressSheet(null)}
          onProceed={proceedWithSavedAddress}
          onSelect={setSelectedAddressId}
        />
      </Modal>
      <Modal animationType="slide" transparent visible={addressSheet === 'search'} onRequestClose={() => setAddressSheet(null)}>
        <LocationSearchSheet
          addresses={addressState.addresses}
          onClose={() => setAddressSheet(null)}
          onSelect={(place) => {
            setSelectedPlace(place);
            setAddressSheet('details');
          }}
        />
      </Modal>
      <Modal animationType="slide" transparent visible={addressSheet === 'details' && Boolean(selectedPlace)} onRequestClose={() => setAddressSheet(null)}>
        {selectedPlace ? (
          <AddressDetailsSheet
            authToken={authToken}
            name={name}
            phone={phone}
            place={selectedPlace}
            saveLabel="Save and proceed to slots"
            onChange={() => setAddressSheet('search')}
            onClose={() => setAddressSheet(null)}
            onSaved={(savedAddress) => {
              setSelectedPlace(null);
              addressState.retry();
              void selectCheckoutAddress(savedAddress);
            }}
          />
        ) : null}
      </Modal>
      <Modal animationType="slide" transparent visible={addressSheet === 'slot'} onRequestClose={() => setAddressSheet(null)}>
        <SlotSelectionSheet
          selectedDate={selectedSlotDate}
          selectedTime={selectedSlotTime}
          onClose={() => setAddressSheet(null)}
          onDateSelect={setSelectedSlotDate}
          onTimeSelect={setSelectedSlotTime}
          onProceed={() => setAddressSheet(null)}
        />
      </Modal>
    </View>
  );
}

function formatCheckoutSlot(dateValue: string, time: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} - ${time}`;
}

function CheckoutDetailRow({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3, opacity: pressed ? 0.65 : 1 })}>
      <View style={{ width: 30, alignItems: 'flex-start', justifyContent: 'center' }}>{typeof icon === 'string' ? <Text style={{ fontSize: fontSizes.size20, color: colors.mauveTone14 }}>{icon}</Text> : icon}</View>
      <Text numberOfLines={1} style={{ flex: 1, fontSize: fontSizes.size13, color: colors.mauveTone24 }}>{label}</Text>
      <View style={{ width: 32, alignItems: 'flex-end' }}>
        <EditIcon size={15} />
      </View>
    </Pressable>
  );
}

function SlotSelectionSheet({ selectedDate, selectedTime, onClose, onDateSelect, onProceed, onTimeSelect }: { selectedDate: string | null; selectedTime: string | null; onClose: () => void; onDateSelect: (value: string) => void; onProceed: () => void; onTimeSelect: (value: string) => void }) {
  const insets = useSafeAreaInsets();
  const dates = Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: index === 0 ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: date.getDate().toString(),
      value: date.toISOString().slice(0, 10),
    };
  });
  const times = ['04:00 PM', '07:00 PM'];
  const canProceed = Boolean(selectedDate && selectedTime);

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.mauveTone8Alpha80 }}>
      <CloseButton accessibilityLabel="Close slot selection" color={colors.mauveTone9} floating onPress={onClose} />
      <View style={{ paddingTop: 22, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 8, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: colors.white }}>
        <Text style={{ fontSize: fontSizes.size19, lineHeight: 25, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>When should the professional arrive?</Text>
        <Text style={{ marginTop: 7, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone43 }}>Service will take approx. 1 hr</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 24 }}>
          {dates.map((item) => {
            const selected = selectedDate === item.value;
            return (
              <Pressable key={item.value} onPress={() => onDateSelect(item.value)} style={({ pressed }) => ({ width: 74, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: selected ? 1.5 : 1, borderColor: selected ? colors.violetTone58 : colors.mauveTone88, backgroundColor: selected ? colors.violetTone98 : colors.white, opacity: pressed ? 0.72 : 1 })}>
                <Text style={{ fontSize: fontSizes.size13, lineHeight: 18, color: colors.mauveTone31 }}>{item.day}</Text>
                <Text style={{ marginTop: 5, fontSize: fontSizes.size16, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>{item.date}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={{ fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>Select start time of service</Text>
        <View style={{ marginTop: 22, flexDirection: 'row', gap: 12 }}>
          {times.map((time) => {
            const selected = selectedTime === time;
            return (
              <Pressable key={time} onPress={() => onTimeSelect(time)} style={({ pressed }) => ({ width: 126, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: selected ? 1.5 : 1, borderColor: selected ? colors.violetTone58 : colors.mauveTone88, backgroundColor: selected ? colors.violetTone98 : colors.white, opacity: pressed ? 0.72 : 1 })}>
                <Text style={{ fontSize: fontSizes.size15, fontFamily: selected ? fontFamilies.semiBold : fontFamilies.regular, color: selected ? colors.violetTone58 : colors.mauveTone31 }}>{time}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canProceed }} disabled={!canProceed} onPress={onProceed} style={({ pressed }) => ({ height: 48, marginTop: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: canProceed ? colors.violetTone58 : colors.violetTone85_2, opacity: pressed ? 0.72 : 1 })}>
          <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.white }}>Proceed to checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SavedAddressSheet({ addresses, isProceeding, selectedAddressId, onAddAnother, onClose, onProceed, onSelect }: { addresses: UserAddress[]; isProceeding: boolean; selectedAddressId: string | null; onAddAnother: () => void; onClose: () => void; onProceed: () => void; onSelect: (addressId: string) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.mauveTone8Alpha80 }}>
      <CloseButton accessibilityLabel="Close saved addresses" color={colors.mauveTone9} floating onPress={onClose} />
      <View style={{ maxHeight: '68%', paddingTop: 22, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 10, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: colors.white }}>
        <Text style={{ fontSize: fontSizes.size20, lineHeight: 27, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9 }}>Saved address</Text>
        <Pressable onPress={onAddAnother} style={{ height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 }}>
          <Text style={{ width: 28, fontSize: fontSizes.size22, fontFamily: fontFamilies.light, color: colors.violetTone58 }}>+</Text>
          <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.violetTone58 }}>Add another address</Text>
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false}>
          {addresses.map((address) => {
            const selected = selectedAddressId === address._id;
            return (
              <Pressable key={address._id} onPress={() => onSelect(address._id)} style={{ minHeight: 112, paddingVertical: 18, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 }}>
                <View style={{ width: 18, height: 18, marginTop: 2, marginRight: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1.25, borderColor: selected ? colors.violetTone58 : colors.mauveTone47 }}>
                  {selected ? <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.violetTone58 }} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSizes.size16, lineHeight: 21, fontFamily: fontFamilies.bold, color: colors.mauveTone12_2 }}>{formatAddressLabel(address.label)}</Text>
                  <Text style={{ marginTop: 5, fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{formatSavedAddress(address)}</Text>
                  <Text style={{ marginTop: 5, fontSize: fontSizes.size13, color: colors.mauveTone38_2 }}>{address.contactName || 'User'}, {formatContactPhone(address.contactPhone)}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable disabled={!selectedAddressId || isProceeding} onPress={onProceed} style={({ pressed }) => ({ height: 48, marginTop: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: selectedAddressId ? colors.violetTone58 : colors.violetTone85_2, opacity: pressed ? 0.72 : 1 })}>
          {isProceeding ? <LoadingDots color={colors.white} gap={6} size={5} /> : <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.white }}>Proceed</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function BillRow({ bold = false, compact = false, dottedLabel = false, label, minHeight, value }: { bold?: boolean; compact?: boolean; dottedLabel?: boolean; label: string; minHeight?: number; value: number }) {
  const labelText = <Text selectable style={{ fontSize: fontSizes.size15, fontFamily: bold ? fontFamilies.semiBold : fontFamilies.medium, color: colors.mauveTone9 }}>{label}</Text>;

  return (
    <View style={{ minHeight: minHeight ?? (compact ? 50 : 58), flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        {dottedLabel ? <DottedUnderline dotColor={colors.mauveTone77}>{labelText}</DottedUnderline> : labelText}
      </View>
      <Text selectable style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9, fontVariant: ['tabular-nums'] }}>{formatPrice(value)}</Text>
    </View>
  );
}
