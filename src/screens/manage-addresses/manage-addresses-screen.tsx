import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { EditIcon } from '../../components/edit-icon';
import { useAddresses } from '../../hooks/use-addresses';
import { fetchCurrentLocation, formatLocationDisplay } from '../../hooks/use-current-location';
import { addAddress, buildAddressFromCurrentLocation, deleteAddress, formatAddressLabel, formatSavedAddress, updateAddress, type AddAddressPayload, type UserAddress } from '../../services/address-api';

const PURPLE = '#6E45E2';
const TEXT = '#1F1A22';
const MUTED = '#777078';
const BORDER = '#E7E3E9';

export function formatContactPhone(value?: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return 'Phone number';

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`;
  return trimmed;
}

export type SelectedPlace = AddAddressPayload & { addressId?: string; subtitle: string; title: string };

type Props = {
  authToken?: string;
  name?: string;
  phone?: string;
  onBack: () => void;
};

const samplePlaces: SelectedPlace[] = [
  { title: 'Mohali walk', subtitle: 'Sector 62, Sahibzada Ajit Singh Nagar, Chandigarh, India', addressLine1: 'Sector 62', city: 'Sahibzada Ajit Singh Nagar', state: 'Punjab', country: 'India', pincode: '160062', latitude: 30.7033, longitude: 76.7176 },
  { title: 'Chandigarh Airport Area', subtitle: 'Chandigarh, India', addressLine1: 'Chandigarh Airport Area', city: 'Chandigarh', state: 'Chandigarh', country: 'India', pincode: '160003', latitude: 30.6735, longitude: 76.7885 },
];

function CloseButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onPress} style={({ pressed }) => ({ position: 'absolute', right: 18, top: -42, zIndex: 5, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF', opacity: pressed ? 0.65 : 1 })}><Text style={{ fontSize: 20, lineHeight: 22, fontWeight: '300', color: TEXT }}>×</Text></Pressable>;
}

function SearchIcon() {
  return <View style={{ width: 15, height: 15, borderWidth: 1.7, borderColor: TEXT, borderRadius: 8 }}><View style={{ position: 'absolute', width: 7, height: 1.7, right: -5, bottom: -3, backgroundColor: TEXT, transform: [{ rotate: '45deg' }] }} /></View>;
}

function TargetIcon() {
  return <View style={{ width: 19, height: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1.6, borderColor: PURPLE, borderRadius: 10 }}><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: PURPLE }} /></View>;
}

export function LocationSearchSheet({ addresses, onClose, onSelect }: { addresses: ReturnType<typeof useAddresses>['addresses']; onClose: () => void; onSelect: (place: SelectedPlace) => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const places = useMemo(() => {
    const saved: SelectedPlace[] = addresses.map((address) => ({
      title: formatAddressLabel(address.label), subtitle: formatSavedAddress(address), addressLine1: address.addressLine1, addressLine2: address.addressLine2,
      city: address.city, state: address.state, country: address.country, pincode: address.pincode, houseNo: address.houseNo, landmark: address.landmark,
      contactName: address.contactName, contactPhone: address.contactPhone, addressType: address.addressType, instructions: address.instructions, label: address.label?.toLowerCase() as AddAddressPayload['label'],
      latitude: address.location?.coordinates?.[1] ?? 30.7033, longitude: address.location?.coordinates?.[0] ?? 76.7176,
    }));
    const all = saved.length ? saved : samplePlaces;
    const key = query.trim().toLowerCase();
    return key ? all.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(key)) : all;
  }, [addresses, query]);

  const currentLocation = async () => {
    setLocating(true);
    const location = await fetchCurrentLocation();
    setLocating(false);
    if (location.status !== 'ready' || !location.coords) {
      Alert.alert('Location unavailable', location.label);
      return;
    }
    const display = formatLocationDisplay(location.geocodedAddress, location.label);
    onSelect({ ...buildAddressFromCurrentLocation(location.geocodedAddress, location.coords), title: display.title, subtitle: display.subtitle });
  };

  return <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ height: '82%' }}>
      <View style={{ flex: 1, paddingTop: 24, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14), borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#FFFFFF' }}>
        <CloseButton onPress={onClose} />
        <View style={{ height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: PURPLE, borderRadius: 8 }}>
          <SearchIcon /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search for your location/society/apartment" placeholderTextColor="#AAA4AC" style={{ flex: 1, height: 46, marginLeft: 13, fontSize: 14, color: TEXT }} />
        </View>
        <Pressable onPress={() => void currentLocation()} style={{ height: 62, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          {locating ? <ActivityIndicator size="small" color={PURPLE} /> : <TargetIcon />}<Text style={{ fontSize: 15, fontWeight: '600', color: PURPLE }}>Use current location</Text>
        </Pressable>
        <View style={{ height: 1, backgroundColor: '#F1EEF2' }} />
        <Text style={{ marginTop: 23, marginBottom: 8, fontSize: 16, lineHeight: 22, fontWeight: '700', color: TEXT }}>{query ? 'Results' : 'Recents'}</Text>
        {places.map((place, index) => <Pressable key={`${place.title}-${index}`} onPress={() => onSelect(place)} style={({ pressed }) => ({ minHeight: 76, flexDirection: 'row', paddingVertical: 13, opacity: pressed ? 0.55 : 1, borderBottomWidth: 1, borderBottomColor: '#F1EEF2' })}>
          <Text style={{ width: 28, paddingTop: 2, fontSize: 20, color: '#58515B' }}>↶</Text><View style={{ flex: 1 }}><Text style={{ fontSize: 15, lineHeight: 21, fontWeight: '600', color: TEXT }}>{place.title}</Text><Text style={{ marginTop: 3, fontSize: 13, lineHeight: 19, color: MUTED }}>{place.subtitle}</Text></View>
        </Pressable>)}
        <Text style={{ marginTop: 'auto', textAlign: 'center', fontSize: 12, color: '#8E8790' }}>powered by <Text style={{ fontWeight: '700', color: '#4285F4' }}>Google</Text></Text>
      </View>
    </KeyboardAvoidingView>
  </View>;
}

function MapPreview() {
  return <View style={{ height: 300, overflow: 'hidden', backgroundColor: '#E5E9E2' }}>
    <View style={{ position: 'absolute', left: -50, top: 110, width: 520, height: 58, backgroundColor: '#B8BEC4', transform: [{ rotate: '-17deg' }] }} />
    <View style={{ position: 'absolute', left: 165, top: -30, width: 58, height: 390, backgroundColor: '#C3C8CC', transform: [{ rotate: '29deg' }] }} />
    <View style={{ position: 'absolute', left: 22, top: 182, width: 125, height: 95, backgroundColor: '#C8E1C2', transform: [{ rotate: '7deg' }] }} />
    <Text style={{ position: 'absolute', left: 18, bottom: 14, fontSize: 15, fontWeight: '700', color: '#4285F4' }}>Google</Text>
    <View style={{ position: 'absolute', alignSelf: 'center', top: 118, width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: PURPLE }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' }} /></View>
    <View style={{ position: 'absolute', alignSelf: 'center', top: 63, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, backgroundColor: '#211B22' }}><Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>Place the pin accurately on map</Text></View>
  </View>;
}

function ContactDetailsModal({ initialName, initialPhone, onClose, onSave }: { initialName: string; initialPhone: string; onClose: () => void; onSave: (name: string, phone: string) => void }) {
  const insets = useSafeAreaInsets();
  const [contactName, setContactName] = useState(initialName);
  const [contactPhone, setContactPhone] = useState(initialPhone.replace(/^\+91\s*/, '').replace(/\D/g, '').slice(-10));
  const isValid = contactName.trim().length > 1 && contactPhone.length === 10;

  return <Modal animationType="fade" transparent onRequestClose={onClose} visible>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
      <View style={{ paddingHorizontal: 18, paddingTop: 24, paddingBottom: Math.max(insets.bottom, 14) + 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#FFFFFF' }}>
        <CloseButton onPress={onClose} />
        <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: '700', color: TEXT }}>Where should we send this booking&apos;s updates?</Text>
        <View style={{ height: 50, marginTop: 22, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER, borderRadius: 8 }}>
          <Text style={{ width: 64, textAlign: 'center', fontSize: 15, color: '#4E4850' }}>+91</Text>
          <View style={{ width: 1, height: 28, backgroundColor: BORDER }} />
          <TextInput autoFocus keyboardType="number-pad" maxLength={10} value={contactPhone} onChangeText={(value) => setContactPhone(value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone number" placeholderTextColor="#AAA4AC" style={{ flex: 1, height: 48, paddingHorizontal: 13, fontSize: 15, color: TEXT }} />
        </View>
        <TextInput autoCapitalize="words" value={contactName} onChangeText={setContactName} placeholder="Name" placeholderTextColor="#AAA4AC" style={{ height: 50, marginTop: 12, paddingHorizontal: 13, borderWidth: 1, borderColor: BORDER, borderRadius: 8, fontSize: 15, color: TEXT }} />
        <Pressable disabled={!isValid} onPress={() => onSave(contactName.trim(), `+91 ${contactPhone}`)} style={({ pressed }) => ({ height: 48, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: isValid ? PURPLE : '#D9D5DD', opacity: pressed ? 0.7 : 1 })}><Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Save details</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

export function AddressDetailsSheet({ authToken, name, phone, place, onChange, onClose, onSaved, saveLabel = 'Save address' }: { authToken?: string; name?: string; phone?: string; place: SelectedPlace; onChange: () => void; onClose: () => void; onSaved: (address: UserAddress) => void; saveLabel?: string }) {
  const insets = useSafeAreaInsets();
  const [houseNo, setHouseNo] = useState(place.houseNo ?? '');
  const [landmark, setLandmark] = useState(place.landmark ?? '');
  const [label, setLabel] = useState<'Home' | 'Other'>(place.label?.toLowerCase() === 'other' ? 'Other' : 'Home');
  const [saving, setSaving] = useState(false);
  const [contactName, setContactName] = useState(place.contactName?.trim() || name?.trim() || 'User');
  const [contactPhone, setContactPhone] = useState(place.contactPhone?.trim() || phone?.trim() || '');
  const [contactEditorVisible, setContactEditorVisible] = useState(false);
  const save = async () => {
    if (!houseNo.trim()) return;
    if (!authToken) return Alert.alert('Sign in required', 'Please sign in to save an address.');
    const contactPhoneDigits = contactPhone.replace(/\D/g, '').slice(-10);
    if (contactPhoneDigits.length !== 10) {
      Alert.alert('Invalid phone number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setSaving(true);
    try {
      const payload: AddAddressPayload = {
        addressLine1: place.addressLine1,
        addressLine2: place.addressLine2,
        addressType: place.addressType ?? (label === 'Home' ? 'apartment' : 'other'),
        city: place.city,
        contactName: contactName.trim(),
        contactPhone: contactPhoneDigits,
        country: place.country,
        houseNo: houseNo.trim(),
        instructions: place.instructions,
        label: label.toLowerCase() as 'home' | 'other',
        landmark: landmark.trim(),
        latitude: place.latitude,
        longitude: place.longitude,
        pincode: place.pincode,
        state: place.state,
      };
      const savedAddress = place.addressId ? await updateAddress(authToken, place.addressId, payload) : await addAddress(authToken, payload);
      onSaved(savedAddress);
    } catch (error) { Alert.alert('Could not save address', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setSaving(false); }
  };
  return <View style={{ flex: 1, justifyContent: 'flex-end' }}><Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
    <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={({ pressed }) => ({ position: 'absolute', right: 18, top: '4.5%', zIndex: 5, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF', opacity: pressed ? 0.65 : 1 })}><Text style={{ fontSize: 20, lineHeight: 22, fontWeight: '300', color: TEXT }}>×</Text></Pressable>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ height: '91%' }}><View style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#FFFFFF' }}>
      <MapPreview /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14) + 14 }}>
        <View style={{ width: 34, height: 4, alignSelf: 'center', marginTop: 9, borderRadius: 2, backgroundColor: '#BEB8C0' }} />
        <View style={{ minHeight: 89, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BORDER }}><View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: '700', color: TEXT }}>{place.title}</Text><Text style={{ marginTop: 5, fontSize: 13, lineHeight: 19, color: MUTED }}>{place.subtitle}</Text></View><Pressable onPress={onChange} style={{ paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: PURPLE, borderRadius: 8 }}><Text style={{ fontSize: 13, fontWeight: '600', color: PURPLE }}>Change</Text></Pressable></View>
        <TextInput value={houseNo} onChangeText={setHouseNo} placeholder="House/Flat Number" placeholderTextColor="#B2ACB4" style={{ height: 50, marginTop: 16, paddingHorizontal: 13, borderWidth: 1, borderColor: BORDER, borderRadius: 8, fontSize: 14, color: TEXT }} />
        <TextInput value={landmark} onChangeText={setLandmark} placeholder="Landmark (Optional)" placeholderTextColor="#B2ACB4" style={{ height: 50, marginTop: 11, paddingHorizontal: 13, borderWidth: 1, borderColor: BORDER, borderRadius: 8, fontSize: 14, color: TEXT }} />
        <Text style={{ marginTop: 18, fontSize: 13, color: TEXT }}>Save as</Text><View style={{ marginTop: 9, flexDirection: 'row', gap: 10 }}>{(['Home', 'Other'] as const).map((item) => <Pressable key={item} onPress={() => setLabel(item)} style={{ paddingHorizontal: 19, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PURPLE, borderRadius: 7, backgroundColor: label === item ? PURPLE : '#FFFFFF' }}><Text style={{ fontSize: 14, fontWeight: '600', color: label === item ? '#FFFFFF' : PURPLE }}>{label === item ? '✓ ' : ''}{item}</Text></Pressable>)}</View>
        <View style={{ height: 60, marginTop: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0EDF1' }}><Image source={require('../../../assets/voice_calls.png')} contentFit="contain" tintColor={TEXT} style={{ width: 18, height: 18 }} /><Text style={{ flex: 1, marginLeft: 13, fontSize: 14, color: TEXT }}>{contactName}, {contactPhone || 'Phone number'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit contact details" hitSlop={10} onPress={() => setContactEditorVisible(true)} style={({ pressed }) => ({ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}><EditIcon size={16} /></Pressable></View>
        <Pressable disabled={!houseNo.trim() || saving} onPress={() => void save()} style={({ pressed }) => ({ height: 48, marginTop: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: houseNo.trim() ? PURPLE : '#D9D5DD', opacity: pressed ? 0.7 : 1 })}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>{saveLabel}</Text>}</Pressable>
      </ScrollView></View></KeyboardAvoidingView>
    {contactEditorVisible ? <ContactDetailsModal initialName={contactName} initialPhone={contactPhone} onClose={() => setContactEditorVisible(false)} onSave={(nextName, nextPhone) => { setContactName(nextName); setContactPhone(nextPhone); setContactEditorVisible(false); }} /> : null}
  </View>;
}

export function ManageAddressesScreen({ authToken, name, phone, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 16) + 58;
  const addressState = useAddresses(authToken);
  const [sheet, setSheet] = useState<'search' | 'details' | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const selectPlace = (place: SelectedPlace) => { setSelectedPlace(place); setSheet('details'); };
  const confirmDelete = (addressId: string) => {
    setMenuId(null);
    Alert.alert('Delete address?', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!authToken) {
            Alert.alert('Sign in required', 'Please sign in to delete an address.');
            return;
          }
          setDeletingId(addressId);
          void deleteAddress(authToken, addressId)
            .then(() => addressState.retry())
            .catch((error) => Alert.alert('Could not delete address', error instanceof Error ? error.message : 'Please try again.'))
            .finally(() => setDeletingId(null));
        },
      },
    ]);
  };
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <View style={{ position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 8, backgroundColor: 'rgba(255,255,255,0.88)' }}><View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}><Pressable hitSlop={10} onPress={onBack} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1, borderColor: '#E4E0E6', backgroundColor: 'transparent', opacity: pressed ? 0.65 : 1 })}><BackIcon color="#241A30" /></Pressable><Text style={{ marginLeft: 13, fontSize: 18, fontWeight: '700', color: TEXT }}>Manage Addresses</Text></View></View>
    <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: 20, paddingBottom: 40 }}><Pressable onPress={() => { setSelectedPlace(null); setSheet('search'); }} style={{ height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1EEF2' }}><Text style={{ width: 28, fontSize: 23, fontWeight: '300', color: PURPLE }}>+</Text><Text style={{ fontSize: 15, fontWeight: '600', color: PURPLE }}>Add another address</Text></Pressable>
      {addressState.isLoading ? <ActivityIndicator color={PURPLE} style={{ marginTop: 34 }} /> : null}
      {addressState.errorMessage ? <Pressable onPress={addressState.retry}><Text style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: MUTED }}>{addressState.errorMessage}{'\n'}Tap to retry</Text></Pressable> : null}
      {addressState.addresses.map((address) => <View key={address._id} style={{ minHeight: 120, paddingTop: 22, paddingBottom: 12, zIndex: menuId === address._id ? 10 : 0, elevation: menuId === address._id ? 10 : 0, borderBottomWidth: 1, borderBottomColor: '#F5F2F6' }}><Text style={{ fontSize: 16, fontWeight: '700', color: TEXT }}>{formatAddressLabel(address.label)}</Text><Text style={{ marginTop: 6, paddingRight: 34, fontSize: 13, lineHeight: 20, color: '#514B53' }}>{formatSavedAddress(address)}</Text><Text style={{ marginTop: 5, fontSize: 13, color: '#514B53' }}>{address.contactName?.trim() || name || 'User'}, {formatContactPhone(address.contactPhone || phone)}</Text><Pressable accessibilityRole="button" accessibilityLabel="Address options" hitSlop={10} pressRetentionOffset={14} onPress={() => setMenuId((current) => current === address._id ? null : address._id)} style={({ pressed }) => ({ position: 'absolute', zIndex: 12, right: -7, top: 9, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}><Image source={require('../../../assets/more.png')} contentFit="contain" tintColor={TEXT} style={{ width: 14, height: 19 }} /></Pressable>{menuId === address._id ? <View style={{ position: 'absolute', right: 0, top: 52, zIndex: 11, width: 128, paddingVertical: 4, borderRadius: 3, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 12 }}><Pressable onPress={() => { setMenuId(null); selectPlace({ addressId: address._id, title: formatAddressLabel(address.label), subtitle: formatSavedAddress(address), addressLine1: address.addressLine1, addressLine2: address.addressLine2, city: address.city, state: address.state, country: address.country, pincode: address.pincode, houseNo: address.houseNo, landmark: address.landmark, contactName: address.contactName, contactPhone: address.contactPhone, addressType: address.addressType, instructions: address.instructions, label: address.label?.toLowerCase() as AddAddressPayload['label'], latitude: address.location?.coordinates?.[1] ?? 30.7033, longitude: address.location?.coordinates?.[0] ?? 76.7176 }); }} style={{ padding: 14 }}><Text style={{ fontSize: 14, color: TEXT }}>Edit</Text></Pressable><Pressable disabled={deletingId === address._id} onPress={() => confirmDelete(address._id)} style={{ padding: 14 }}><Text style={{ fontSize: 14, color: TEXT }}>{deletingId === address._id ? 'Deleting...' : 'Delete'}</Text></Pressable></View> : null}</View>)}
      {!addressState.isLoading && !addressState.errorMessage && addressState.addresses.length === 0 ? <Text style={{ marginTop: 38, textAlign: 'center', fontSize: 14, color: MUTED }}>No saved addresses yet.</Text> : null}
    </ScrollView>
    <Modal animationType="fade" transparent visible={sheet === 'search'} onRequestClose={() => setSheet(null)}><LocationSearchSheet addresses={addressState.addresses} onClose={() => setSheet(null)} onSelect={(place) => selectPlace(selectedPlace?.addressId ? { ...place, addressId: selectedPlace.addressId, contactName: selectedPlace.contactName, contactPhone: selectedPlace.contactPhone, houseNo: selectedPlace.houseNo, landmark: selectedPlace.landmark, label: selectedPlace.label, addressType: selectedPlace.addressType, instructions: selectedPlace.instructions } : place)} /></Modal>
    <Modal animationType="fade" transparent visible={sheet === 'details' && Boolean(selectedPlace)} onRequestClose={() => setSheet(null)}>{selectedPlace ? <AddressDetailsSheet authToken={authToken} name={name} phone={phone} place={selectedPlace} onChange={() => setSheet('search')} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); setSelectedPlace(null); addressState.retry(); }} /> : null}</Modal>
  </View>;
}
