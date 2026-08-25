import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { EditIcon } from '../../components/edit-icon';
import type { ServiceItem } from '../../data/service-catalog';
import { useAddresses } from '../../hooks/use-addresses';
import { formatAddressLabel, formatSavedAddress, setDefaultAddress, type UserAddress } from '../../services/address-api';
import { AddressDetailsSheet, ContactDetailsModal, formatContactPhone, LocationSearchSheet, type SelectedPlace } from '../manage-addresses/manage-addresses-screen';

type CartScreenProps = {
  authToken?: string;
  cart: Record<string, number>;
  categoryTitle?: string;
  consultationMode?: boolean;
  errorMessage: string;
  isLoading: boolean;
  items: ServiceItem[];
  name?: string;
  onAdd: (item: ServiceItem) => void;
  onBack?: () => void;
  onExplore: () => void;
  onProductPress: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => Promise<void> | void;
  onRetry: () => void;
  phone?: string;
  showBottomTab?: boolean;
  totalItems: number;
  totalPrice: number;
};

const formatPrice = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`;

export function CartScreen({
  authToken,
  cart,
  categoryTitle,
  consultationMode = false,
  errorMessage,
  isLoading,
  items,
  name,
  onAdd,
  onBack,
  onExplore,
  onProductPress,
  onRemove,
  onRetry,
  phone,
  showBottomTab = false,
  totalItems,
  totalPrice,
}: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const [showBillSummary, setShowBillSummary] = useState(false);
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
  const displayedTotalPrice = consultationMode ? (cartItems.length > 0 ? 49 : 0) : totalPrice;
  const displayedContactName = contactOverride?.name || checkoutAddress?.contactName?.trim() || name?.trim() || 'User';
  const rawContactPhone = contactOverride?.phone || checkoutAddress?.contactPhone?.trim() || phone?.trim() || '';
  const displayedContactPhone = formatContactPhone(rawContactPhone);
  const checkoutReady = Boolean(checkoutAddress && selectedSlotDate && selectedSlotTime);
  const actionBottom = showBottomTab ? (process.env.EXPO_OS === 'ios' ? 112 : insets.bottom + 100) : 0;
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
    <View style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 17,
          paddingHorizontal: 20,
          minHeight: insets.top + 72,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
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
            style={({ pressed }) => ({ width: 30, height: 36, alignItems: 'flex-start', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
          >
            <BackIcon color="#171319" />
          </Pressable>
        ) : null}
        <Text selectable style={{ fontSize: 20, lineHeight: 26, fontWeight: '600', color: '#171319' }}>Your cart</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: actionBottom + actionHeight }}
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
          <View style={{ flex: 1, minHeight: 500, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#FFFFFF' }}>
            <Text accessibilityLabel="Empty shopping cart" style={{ fontSize: 62, lineHeight: 72 }}>🛒</Text>
            <Text selectable style={{ paddingTop: 28, fontSize: 18, lineHeight: 24, fontWeight: '600', color: '#211A28' }}>Hey, it feels so empty here.</Text>
            <Text selectable style={{ paddingTop: 12, fontSize: 14, lineHeight: 20, color: '#716A76' }}>Lets add some services</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onExplore}
              style={({ pressed }) => ({ minWidth: 132, height: 38, marginTop: 16, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 0.5, borderColor: '#D8D3DC', backgroundColor: pressed ? '#F7F3FF' : '#FFFFFF' })}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#6E45E2' }}>Explore services</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 18, gap: 16, backgroundColor: '#FFFFFF' }}>
              <Text selectable style={{ fontSize: 19, lineHeight: 26, fontWeight: '600', color: '#171319' }}>
                {categoryTitle || 'Selected services'}
              </Text>

              {displayedCartItems.map((item, index) => {
                const quantity = cart[item.id] ?? 0;
                if (consultationMode) {
                  return (
                    <View key={item.id}>
                      {index > 0 ? <View style={{ height: 1, marginBottom: 14, backgroundColor: '#ECEAEC' }} /> : null}
                      <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center' }}>
                        <Text selectable style={{ flex: 1, fontSize: 14, lineHeight: 20, color: '#4D4751' }}>At home consultation</Text>
                        <View style={{ width: 94, height: 36, marginHorizontal: 14, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 9, borderWidth: 1, borderColor: '#CDBCFB', backgroundColor: '#F7F3FF' }}>
                          <Pressable accessibilityLabel="Remove consultation" hitSlop={11} onPress={() => void clearConsultation()} style={{ width: 24, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18, lineHeight: 21, color: '#6E45E2' }}>−</Text>
                          </Pressable>
                          <Text selectable style={{ minWidth: 16, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#6E45E2', fontVariant: ['tabular-nums'] }}>1</Text>
                          <Pressable accessibilityLabel="Consultation quantity is limited to one" accessibilityState={{ disabled: true }} disabled style={{ width: 24, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 17, lineHeight: 21, color: '#B9ACDC' }}>＋</Text>
                          </Pressable>
                        </View>
                        <Text selectable style={{ minWidth: 38, textAlign: 'right', fontSize: 14, fontWeight: '600', color: '#171319', fontVariant: ['tabular-nums'] }}>₹49</Text>
                      </View>
                    </View>
                  );
                }
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
                        <Text selectable style={{ fontSize: 15, lineHeight: 21, fontWeight: '600', color: '#211A28' }}>{item.title}</Text>
                        <Text selectable numberOfLines={2} style={{ paddingTop: 4, fontSize: 12, lineHeight: 17, color: '#716A76' }}>
                          {item.selectedVariantLabel || item.description || 'At home service'}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={{ paddingTop: 14, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ minWidth: 102, height: 38, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: '#CDBCFB', backgroundColor: '#F7F3FF' }}>
                        <Pressable accessibilityLabel={`Remove one ${item.title}`} hitSlop={11} onPress={() => onRemove(item)} style={{ width: 26, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 19, lineHeight: 22, fontWeight: '400', color: '#6E45E2' }}>−</Text>
                        </Pressable>
                        <Text selectable style={{ minWidth: 18, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#6E45E2', fontVariant: ['tabular-nums'] }}>{quantity}</Text>
                        <Pressable accessibilityLabel={`Add one ${item.title}`} hitSlop={11} onPress={() => onAdd(item)} style={{ width: 26, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 18, lineHeight: 22, fontWeight: '400', color: '#6E45E2' }}>＋</Text>
                        </Pressable>
                      </View>
                      <Text selectable style={{ marginLeft: 'auto', fontSize: 15, fontWeight: '600', color: '#171319', fontVariant: ['tabular-nums'] }}>
                        {formatPrice(item.serverLineTotal ?? item.price * quantity)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Coupons and offers', 'No coupons are available right now.')}
              style={({ pressed }) => ({
                minHeight: 64,
                marginTop: 10,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? '#FBF9FD' : '#FFFFFF',
              })}
            >
              <View style={{ width: 28, alignItems: 'flex-start' }}>
                <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#0B784E' }}>
                  <Text style={{ fontSize: 10, lineHeight: 12, fontWeight: '700', color: '#FFFFFF' }}>%</Text>
                </View>
              </View>
              <Text selectable style={{ flex: 1, paddingLeft: 7, fontSize: 14, lineHeight: 20, color: '#29232C' }}>Coupons and offers</Text>
              <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#6E45E2' }}>View all</Text>
              <Text style={{ marginLeft: 8, fontSize: 22, lineHeight: 24, color: '#6E45E2' }}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setContactEditorVisible(true)}
              style={({ pressed }) => ({
                minHeight: 64,
                marginTop: 10,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? '#FBF9FD' : '#FFFFFF',
              })}
            >
              <View style={{ width: 28, alignItems: 'flex-start' }}>
                <Image source={require('../../../assets/voice_calls.png')} contentFit="contain" tintColor="#211A28" style={{ width: 18, height: 18 }} />
              </View>
              <Text numberOfLines={1} selectable style={{ flex: 1, paddingLeft: 7, fontSize: 14, lineHeight: 20, color: '#29232C' }}>
                {displayedContactName}, {displayedContactPhone}
              </Text>
              <Text style={{ marginLeft: 12, fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#6E45E2' }}>Change</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowBillSummary(true)}
              style={({ pressed }) => ({
                marginTop: 10,
                minHeight: 94,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? '#FBF9FD' : '#FFFFFF',
              })}
            >
              <View style={{ width: 32, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../../../assets/receipt.png')} contentFit="contain" style={{ width: 22, height: 22 }} />
              </View>
              <View style={{ flex: 1, paddingLeft: 11 }}>
                <Text selectable style={{ fontSize: 15, lineHeight: 21, color: '#211A28' }}>
                  Total bill <Text style={{ fontWeight: '600' }}>{formatPrice(displayedTotalPrice)}</Text>
                </Text>
                <Text selectable style={{ paddingTop: 3, fontSize: 12, lineHeight: 17, color: '#716A76' }}>Incl. govt. taxes &amp; charges</Text>
              </View>
              <Text style={{ fontSize: 26, color: '#171319' }}>›</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && !isLoading ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: actionBottom, paddingHorizontal: 20, paddingTop: 10, paddingBottom: showBottomTab ? 9 : Math.max(insets.bottom, 10), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E7E4E8' }}>
          {checkoutAddress ? (
            <>
              <CheckoutDetailRow icon={<Image source={require('../../../assets/addresses.png')} contentFit="contain" style={{ width: 18, height: 18 }} />} label={`${formatAddressLabel(checkoutAddress.label)} - ${formatSavedAddress(checkoutAddress)}`} onPress={() => void openAddressAndSlot()} />
              {checkoutReady && selectedSlotDate && selectedSlotTime ? (
                <>
                  <CheckoutDetailRow icon={<Image source={require('../../../assets/time.png')} contentFit="contain" style={{ width: 16, height: 16 }} />} label={formatCheckoutSlot(selectedSlotDate, selectedSlotTime)} onPress={() => setAddressSheet('slot')} />
                  <Pressable accessibilityRole="button" onPress={() => Alert.alert('Payment', 'Payment flow will be connected here.')} style={({ pressed }) => ({ height: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Proceed to pay</Text>
                  </Pressable>
                  <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 10.5, lineHeight: 15, color: '#625D64' }}>By proceeding, you agree to our <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>T&amp;C</Text>, <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Privacy</Text> and <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Cancellation Policy</Text>.</Text>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAddressSheet('slot')}
                  style={({ pressed }) => ({ height: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Select slot</Text>
                </Pressable>
              )}
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={addressState.isLoading}
              onPress={() => void openAddressAndSlot()}
              style={({ pressed }) => ({ height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}
            >
              {addressState.isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Add address and slot</Text>}
            </Pressable>
          )}
        </View>
      ) : null}

      <Modal animationType="fade" transparent visible={showBillSummary} onRequestClose={() => setShowBillSummary(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 18, 21, 0.80)' }}>
          <Pressable accessibilityLabel="Close bill summary" onPress={() => setShowBillSummary(false)} style={{ alignSelf: 'flex-end', width: 40, height: 40, marginRight: 20, marginBottom: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 23, lineHeight: 25, fontWeight: '300', color: '#171319' }}>×</Text>
          </Pressable>
          <View style={{ paddingTop: 24, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12), borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#FFFFFF' }}>
            <Text selectable style={{ fontSize: 24, lineHeight: 31, fontWeight: '600', color: '#171319' }}>Bill summary</Text>
            <BillRow label="Item total" value={displayedTotalPrice} />
            <View style={{ height: 1, backgroundColor: '#E4E2E4' }} />
            <BillRow bold label="Total bill" value={displayedTotalPrice} />
            <View style={{ height: 1, backgroundColor: '#E4E2E4' }} />
            <BillRow bold label="Amount to pay" value={displayedTotalPrice} />
            <Pressable onPress={() => setShowBillSummary(false)} style={({ pressed }) => ({ height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? '#5D35CE' : '#6E45E2' })}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Okay, got it</Text>
            </Pressable>
          </View>
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

      <Modal animationType="fade" transparent visible={addressSheet === 'saved'} onRequestClose={() => setAddressSheet(null)}>
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
      <Modal animationType="fade" transparent visible={addressSheet === 'search'} onRequestClose={() => setAddressSheet(null)}>
        <LocationSearchSheet
          addresses={addressState.addresses}
          onClose={() => setAddressSheet(null)}
          onSelect={(place) => {
            setSelectedPlace(place);
            setAddressSheet('details');
          }}
        />
      </Modal>
      <Modal animationType="fade" transparent visible={addressSheet === 'details' && Boolean(selectedPlace)} onRequestClose={() => setAddressSheet(null)}>
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
      <Modal animationType="fade" transparent visible={addressSheet === 'slot'} onRequestClose={() => setAddressSheet(null)}>
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
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0EDF1', opacity: pressed ? 0.65 : 1 })}>
      <View style={{ width: 30, alignItems: 'flex-start', justifyContent: 'center' }}>{typeof icon === 'string' ? <Text style={{ fontSize: 20, color: '#241F26' }}>{icon}</Text> : icon}</View>
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: '#3F3942' }}>{label}</Text>
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
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,18,21,0.80)' }}>
      <Pressable accessibilityLabel="Close slot selection" onPress={onClose} style={{ alignSelf: 'flex-end', width: 36, height: 36, marginRight: 18, marginBottom: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 21, lineHeight: 23, fontWeight: '300', color: '#171319' }}>×</Text>
      </Pressable>
      <View style={{ paddingTop: 22, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 8, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#171319' }}>When should the professional arrive?</Text>
        <Text style={{ marginTop: 7, fontSize: 14, lineHeight: 20, color: '#6F6872' }}>Service will take approx. 1 hr</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 24 }}>
          {dates.map((item) => {
            const selected = selectedDate === item.value;
            return (
              <Pressable key={item.value} onPress={() => onDateSelect(item.value)} style={({ pressed }) => ({ width: 74, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: selected ? 1.5 : 1, borderColor: selected ? '#6E45E2' : '#E1DDE3', backgroundColor: selected ? '#F7F3FF' : '#FFFFFF', opacity: pressed ? 0.72 : 1 })}>
                <Text style={{ fontSize: 13, lineHeight: 18, color: '#514B53' }}>{item.day}</Text>
                <Text style={{ marginTop: 5, fontSize: 16, lineHeight: 21, fontWeight: '600', color: '#171319' }}>{item.date}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={{ fontSize: 18, lineHeight: 24, fontWeight: '600', color: '#171319' }}>Select start time of service</Text>
        <View style={{ marginTop: 22, flexDirection: 'row', gap: 12 }}>
          {times.map((time) => {
            const selected = selectedTime === time;
            return (
              <Pressable key={time} onPress={() => onTimeSelect(time)} style={({ pressed }) => ({ width: 126, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: selected ? 1.5 : 1, borderColor: selected ? '#6E45E2' : '#E1DDE3', backgroundColor: selected ? '#F7F3FF' : '#FFFFFF', opacity: pressed ? 0.72 : 1 })}>
                <Text style={{ fontSize: 15, fontWeight: selected ? '600' : '400', color: selected ? '#6E45E2' : '#514B53' }}>{time}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canProceed }} disabled={!canProceed} onPress={onProceed} style={({ pressed }) => ({ height: 48, marginTop: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: canProceed ? '#6E45E2' : '#D9D5DD', opacity: pressed ? 0.72 : 1 })}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Proceed to checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SavedAddressSheet({ addresses, isProceeding, selectedAddressId, onAddAnother, onClose, onProceed, onSelect }: { addresses: UserAddress[]; isProceeding: boolean; selectedAddressId: string | null; onAddAnother: () => void; onClose: () => void; onProceed: () => void; onSelect: (addressId: string) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,18,21,0.80)' }}>
      <Pressable accessibilityLabel="Close saved addresses" onPress={onClose} style={{ alignSelf: 'flex-end', width: 36, height: 36, marginRight: 18, marginBottom: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 21, lineHeight: 23, fontWeight: '300', color: '#171319' }}>×</Text>
      </Pressable>
      <View style={{ maxHeight: '68%', paddingTop: 22, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 10, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: '600', color: '#171319' }}>Saved address</Text>
        <Pressable onPress={onAddAnother} style={{ height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0EDF1' }}>
          <Text style={{ width: 28, fontSize: 22, fontWeight: '300', color: '#6E45E2' }}>+</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#6E45E2' }}>Add another address</Text>
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false}>
          {addresses.map((address) => {
            const selected = selectedAddressId === address._id;
            return (
              <Pressable key={address._id} onPress={() => onSelect(address._id)} style={{ minHeight: 112, paddingVertical: 18, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0EDF1' }}>
                <View style={{ width: 18, height: 18, marginTop: 2, marginRight: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1.25, borderColor: selected ? '#6E45E2' : '#7B747D' }}>
                  {selected ? <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#6E45E2' }} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, lineHeight: 21, fontWeight: '700', color: '#1F1A22' }}>{formatAddressLabel(address.label)}</Text>
                  <Text style={{ marginTop: 5, fontSize: 13, lineHeight: 19, color: '#625D64' }}>{formatSavedAddress(address)}</Text>
                  <Text style={{ marginTop: 5, fontSize: 13, color: '#625D64' }}>{address.contactName || 'User'}, {formatContactPhone(address.contactPhone)}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable disabled={!selectedAddressId || isProceeding} onPress={onProceed} style={({ pressed }) => ({ height: 48, marginTop: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: selectedAddressId ? '#6E45E2' : '#D9D5DD', opacity: pressed ? 0.72 : 1 })}>
          {isProceeding ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Proceed</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function BillRow({ bold = false, label, value }: { bold?: boolean; label: string; value: number }) {
  return (
    <View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center' }}>
      <Text selectable style={{ flex: 1, fontSize: 15, fontWeight: bold ? '700' : '500', color: '#171319' }}>{label}</Text>
      <Text selectable style={{ fontSize: 15, fontWeight: '600', color: '#171319', fontVariant: ['tabular-nums'] }}>{formatPrice(value)}</Text>
    </View>
  );
}
