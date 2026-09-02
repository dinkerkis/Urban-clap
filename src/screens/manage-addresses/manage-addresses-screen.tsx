import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import {
  getPermissionsAsync,
  presentContactPickerAsync,
  requestPermissionsAsync,
} from 'expo-contacts/legacy';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { TextInput } from '../../components/app-text-input';
import { Text } from '../../components/app-text';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { CloseButton as SharedCloseButton, CLOSE_BUTTON_ABOVE_OFFSET, CLOSE_BUTTON_INSET } from '../../components/close-icon';
import { EditIcon } from '../../components/edit-icon';
import { LoadingDots } from '../../components/loading-dots';
import { countries, defaultCountry, type Country } from '../../config/countries';
import { useAddresses } from '../../hooks/use-addresses';
import { fetchCurrentLocation, formatLocationDisplay, reverseGeocodeLocation } from '../../hooks/use-current-location';
import { usePlaceSuggestions } from '../../hooks/use-place-suggestions';
import { addAddress, buildAddressFromCurrentLocation, deleteAddress, formatAddressLabel, formatSavedAddress, updateAddress, type AddAddressPayload, type UserAddress } from '../../services/address-api';
import { fetchPlaceDetails, type PlaceSuggestion } from '../../services/places-api';
import { getRecentLocations, saveRecentLocation, type RecentLocation } from '../../services/recent-locations-storage';

const PURPLE = colors.violetTone58;
const TEXT = colors.mauveTone12_2;
const MUTED = colors.neutralTone45;
const BORDER = colors.mauveTone90;

function callingCodeDigits(country: Country) {
  return country.callingCode.replace(/\D/g, '');
}

export function resolveCountryAndLocal(phone: string): { country: Country; local: string } {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return { country: defaultCountry, local: '' };

  const matched = [...countries]
    .sort((a, b) => callingCodeDigits(b).length - callingCodeDigits(a).length)
    .find((item) => {
      const code = callingCodeDigits(item);
      return digits.startsWith(code) && digits.length > code.length;
    });

  if (matched) {
    return { country: matched, local: digits.slice(callingCodeDigits(matched).length).slice(0, matched.phoneLength) };
  }

  if (digits.length <= defaultCountry.phoneLength) {
    return { country: defaultCountry, local: digits };
  }

  return { country: defaultCountry, local: digits.slice(-defaultCountry.phoneLength) };
}

export function formatContactPhone(value?: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return 'Phone number';
  const { country, local } = resolveCountryAndLocal(trimmed);
  if (!local) return trimmed;
  return `${country.callingCode} ${local}`;
}

function ContactPickerIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 4, backgroundColor: colors.black }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white }} />
      <View style={{ width: 12, height: 6, marginTop: 1, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: colors.white }} />
    </View>
  );
}

export type SelectedPlace = AddAddressPayload & { addressId?: string; subtitle: string; title: string };

type Props = {
  authToken?: string;
  name?: string;
  phone?: string;
  onBack: () => void;
};

function CloseButton({ onPress }: { onPress: () => void }) {
  return <SharedCloseButton color={TEXT} onPress={onPress} style={{ position: 'absolute', zIndex: 5, right: CLOSE_BUTTON_INSET, top: CLOSE_BUTTON_ABOVE_OFFSET }} />;
}

function SearchIcon() {
  return <Image source={require('../../../assets/search.png')} contentFit="contain" tintColor={colors.violetTone42} style={{ width: 18, height: 18 }} />;
}

function TargetIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.6, borderColor: PURPLE }} />
      <View style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: PURPLE }} />
      <View style={{ position: 'absolute', top: 0, width: 1.5, height: 3.5, backgroundColor: PURPLE }} />
      <View style={{ position: 'absolute', bottom: 0, width: 1.5, height: 3.5, backgroundColor: PURPLE }} />
      <View style={{ position: 'absolute', left: 0, width: 3.5, height: 1.5, backgroundColor: PURPLE }} />
      <View style={{ position: 'absolute', right: 0, width: 3.5, height: 1.5, backgroundColor: PURPLE }} />
    </View>
  );
}

function GoogleMark() {
  return (
    <Text style={{ marginLeft: -2, fontSize: fontSizes.size12, fontFamily: fontFamilies.bold, letterSpacing: -0.3 }}>
      <Text style={{ color: colors.blueTone61 }}>G</Text>
      <Text style={{ color: colors.redTone56 }}>o</Text>
      <Text style={{ color: colors.yellowTone50 }}>o</Text>
      <Text style={{ color: colors.blueTone61 }}>g</Text>
      <Text style={{ color: colors.greenTone43 }}>l</Text>
      <Text style={{ color: colors.redTone56 }}>e</Text>
    </Text>
  );
}

export function LocationSearchSheet({ onClose, onSelect }: { addresses: ReturnType<typeof useAddresses>['addresses']; onClose: () => void; onSelect: (place: SelectedPlace) => Promise<void> | void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [selectingPlace, setSelectingPlace] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [showAllRecents, setShowAllRecents] = useState(false);
  const { consumeSessionToken, errorMessage: searchError, isSearching, suggestions } = usePlaceSuggestions(query);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getRecentLocations().then((stored) => {
      if (active) setRecentLocations(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const isSearchActive = query.trim().length >= 2;
  const displayedRecents = showAllRecents ? recentLocations : recentLocations.slice(0, 2);

  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    if (selectingPlace) return;
    setSelectingPlace(true);
    try {
      const place = await fetchPlaceDetails(suggestion.placeId, consumeSessionToken());
      setRecentLocations((current) => saveRecentLocation({ placeId: suggestion.placeId, title: place.title, subtitle: place.subtitle }, current));
      await onSelect(place);
    } catch (error) {
      Alert.alert('Could not select location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSelectingPlace(false);
    }
  };

  const selectRecent = async (location: RecentLocation) => {
    if (selectingPlace) return;
    setSelectingPlace(true);
    try {
      await onSelect(await fetchPlaceDetails(location.placeId));
    } catch (error) {
      Alert.alert('Could not select location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSelectingPlace(false);
    }
  };

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

  return <View style={{ flex: 1 }}>
    <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha72 }} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <View style={{ height: '82%', paddingTop: 24, paddingHorizontal: 18, paddingBottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: colors.white }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: 0, bottom: -28, left: 0, height: 28, backgroundColor: colors.white }} />
        <CloseButton onPress={onClose} />
        <View style={{ height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: colors.mauveTone86, borderRadius: 8 }}>
          <SearchIcon /><TextInput value={query} onChangeText={setQuery} placeholder="Search for your location/society/apartment" placeholderTextColor={colors.mauveTone66_3} style={{ flex: 1, height: 46, marginLeft: 13, fontSize: fontSizes.size15, color: TEXT }} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => void currentLocation()}
          disabled={locating}
          style={({ pressed }) => ({
            minHeight: 54,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: pressed ? colors.violetTone97_5 : colors.white,
            opacity: locating ? 0.7 : 1,
          })}
        >
          {locating ? (
            <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
              <LoadingDots gap={5} size={5} />
            </View>
          ) : <TargetIcon />}
          <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: PURPLE }}>Use current location</Text>
        </Pressable>
        <View style={{ height: 8, marginHorizontal: -18, backgroundColor: colors.violetTone98_3 }} />
        <ScrollView keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" style={{ flex: 1, marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }}>
          {!isSearchActive ? <Text style={{ marginTop: 23, marginBottom: 8, fontSize: fontSizes.size16, lineHeight: 22, fontFamily: fontFamilies.bold, color: TEXT }}>Recents</Text> : null}
          {isSearchActive ? (
            isSearching && suggestions.length === 0 ? (
              <View style={{ minHeight: 72, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.transparent }}><LoadingDots /></View>
            ) : searchError ? (
              <Text style={{ paddingVertical: 16, fontSize: fontSizes.size13, color: MUTED }}>{searchError}</Text>
            ) : suggestions.length === 0 ? (
              <Text style={{ paddingVertical: 16, fontSize: fontSizes.size13, color: MUTED }}>No locations found.</Text>
            ) : suggestions.map((suggestion) => (
              <Pressable key={suggestion.placeId} disabled={selectingPlace} onPress={() => void selectSuggestion(suggestion)} style={({ pressed }) => ({ minHeight: 76, flexDirection: 'row', paddingVertical: 13, opacity: pressed || selectingPlace ? 0.55 : 1, borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 })}>
                <View style={{ width: 28, paddingTop: 3 }}>
                  <Image source={require('../../../assets/location.png')} contentFit="contain" tintColor={colors.mauveTone34} style={{ width: 17, height: 17 }} />
                </View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: TEXT }}>{suggestion.title}</Text><Text style={{ marginTop: 3, fontSize: fontSizes.size13, lineHeight: 19, color: MUTED }}>{suggestion.subtitle}</Text></View>
              </Pressable>
            ))
          ) : recentLocations.length === 0 ? (
            <Text style={{ paddingVertical: 16, fontSize: fontSizes.size13, color: MUTED }}>No recent locations yet.</Text>
          ) : (
            <>
              {displayedRecents.map((place, index) => (
                <Pressable key={place.placeId} disabled={selectingPlace} onPress={() => void selectRecent(place)} style={({ pressed }) => ({ minHeight: 76, flexDirection: 'row', paddingVertical: 13, opacity: pressed || selectingPlace ? 0.55 : 1, borderBottomWidth: index < displayedRecents.length - 1 ? 1 : 0, borderBottomColor: colors.violetTone98_3 })}>
                  <View style={{ width: 28, paddingTop: 3 }}>
                    <Image source={require('../../../assets/recent.png')} contentFit="contain" tintColor={colors.mauveTone34} style={{ width: 17, height: 17 }} />
                  </View>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.semiBold, color: TEXT }}>{place.title}</Text><Text style={{ marginTop: 3, fontSize: fontSizes.size13, lineHeight: 19, color: MUTED }}>{place.subtitle}</Text></View>
                </Pressable>
              ))}
              {!showAllRecents && recentLocations.length > 2 ? (
                <>
                  <Pressable accessibilityRole="button" onPress={() => setShowAllRecents(true)} style={({ pressed }) => ({ alignSelf: 'flex-start', paddingTop: 4, paddingBottom: 12, opacity: pressed ? 0.55 : 1 })}>
                    <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: PURPLE }}>View more</Text>
                  </Pressable>
                  <View style={{ height: 8, marginHorizontal: -18, alignSelf: 'stretch', backgroundColor: colors.violetTone98_3 }} />
                </>
              ) : null}
            </>
          )}
        </ScrollView>
        <View
          style={{
            marginHorizontal: -18,
            paddingTop: keyboardVisible ? 12 : 10,
            paddingBottom: keyboardVisible ? 9 : Math.max(insets.bottom, 12),
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.violetTone98_3,
            boxShadow: `0 -3px 10px ${colors.mauveTone9Alpha6}`,
          }}
        >
          <Text style={{ fontSize: fontSizes.size11, color: colors.neutralTone60 }}>powered by</Text>
          <GoogleMark />
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>;
}

function MapPreview({ latitude, longitude, onPinChange }: { latitude: number; longitude: number; onPinChange: (latitude: number, longitude: number) => void }) {
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);
  const initialRegion: Region = { latitude, longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 };
  const goToCurrentLocation = async () => {
    setLocating(true);
    const location = await fetchCurrentLocation();
    setLocating(false);
    if (location.status !== 'ready' || !location.coords) {
      Alert.alert('Location unavailable', location.label);
      return;
    }
    const region = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 };
    mapRef.current?.animateToRegion(region);
    onPinChange(region.latitude, region.longitude);
  };
  return <View style={{ height: 300, overflow: 'hidden', backgroundColor: colors.greenTone90 }}>
    <MapView
      ref={mapRef}
      initialRegion={initialRegion}
      mapType="standard"
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      rotateEnabled={false}
      showsCompass={false}
      showsMyLocationButton={false}
      style={{ position: 'absolute', inset: 0 }}
      onRegionChangeComplete={(region) => onPinChange(region.latitude, region.longitude)}
    />
    <View pointerEvents="none" style={{ position: 'absolute', alignSelf: 'center', top: '50%', alignItems: 'center', marginTop: -46 }}>
      <View style={{ marginBottom: 4, alignItems: 'center' }}>
        <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, backgroundColor: colors.mauveTone12_3 }}>
          <Text style={{ fontSize: fontSizes.size13, lineHeight: 12, fontFamily: fontFamilies.semiBold, color: colors.white }}>Place the pin accurately on map</Text>
        </View>
        <View style={{ width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 7, borderLeftColor: colors.transparent, borderRightColor: colors.transparent, borderTopColor: colors.mauveTone12_3 }} />
      </View>
      <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: PURPLE }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.white }} />
      </View>
      <View style={{ width: 2, height: 14, backgroundColor: PURPLE }} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Use current location" onPress={() => void goToCurrentLocation()} style={({ pressed }) => ({ position: 'absolute', right: 12, bottom: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.white, opacity: pressed ? 0.7 : 1, shadowColor: colors.black, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 })}>
      {locating ? <LoadingDots color={TEXT} gap={4} size={4} /> : <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 14, height: 14, borderWidth: 1.6, borderColor: TEXT, borderRadius: 7 }} /><View style={{ position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: TEXT }} /><View style={{ position: 'absolute', top: 0, width: 1.5, height: 3, backgroundColor: TEXT }} /><View style={{ position: 'absolute', bottom: 0, width: 1.5, height: 3, backgroundColor: TEXT }} /><View style={{ position: 'absolute', left: 0, width: 3, height: 1.5, backgroundColor: TEXT }} /><View style={{ position: 'absolute', right: 0, width: 3, height: 1.5, backgroundColor: TEXT }} /></View>}
    </Pressable>
  </View>;
}

export function ContactDetailsModal({ initialName, initialPhone, onClose, onSave }: { initialName: string; initialPhone: string; onClose: () => void; onSave: (name: string, phone: string) => void }) {
  const insets = useSafeAreaInsets();
  const initial = resolveCountryAndLocal(initialPhone);
  const [country, setCountry] = useState(initial.country);
  const [contactName, setContactName] = useState(initialName);
  const [contactPhone, setContactPhone] = useState(initial.local);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [pickingContact, setPickingContact] = useState(false);
  const isValid = contactName.trim().length > 1 && contactPhone.length === country.phoneLength;
  const fieldBorder = (focused: boolean) => (focused ? PURPLE : BORDER);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const applyPhoneValue = (raw: string) => {
    const next = resolveCountryAndLocal(raw);
    setCountry(next.country);
    setContactPhone(next.local);
  };

  const pickFromContacts = async () => {
    if (pickingContact) return;
    setPickingContact(true);
    try {
      let permission = await getPermissionsAsync();
      if (permission.status !== 'granted' && permission.canAskAgain) {
        permission = await requestPermissionsAsync();
      }
      if (Platform.OS === 'android' && permission.status !== 'granted') {
        Alert.alert(
          'Contacts access needed',
          'Allow Urban Clap to access your contacts so you can pick a number for booking updates.',
          permission.canAskAgain
            ? [{ text: 'OK' }]
            : [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => void Linking.openSettings() },
              ],
        );
        return;
      }

      const contact = await presentContactPickerAsync();
      if (!contact) return;

      const numbers = (contact.phoneNumbers ?? [])
        .map((item) => item.digits || item.number)
        .filter((value): value is string => Boolean(value?.replace(/\D/g, '')));
      const name = contact.name?.trim() || [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
      if (name) setContactName(name);

      if (numbers.length === 0) {
        Alert.alert('No phone number', 'This contact does not have a phone number.');
        return;
      }
      if (numbers.length === 1) {
        applyPhoneValue(numbers[0]);
        return;
      }
      Alert.alert('Select a number', name || 'Contact', [
        ...numbers.slice(0, 3).map((value) => ({ text: value, onPress: () => applyPhoneValue(value) })),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    } catch (error) {
      Alert.alert('Could not open contacts', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPickingContact(false);
    }
  };

  return <Modal animationType="slide" transparent onRequestClose={onClose} visible>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable onPress={isCountryPickerOpen ? () => setIsCountryPickerOpen(false) : onClose} style={{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha72 }} />
      {isCountryPickerOpen ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: Math.max(insets.bottom, 18) + 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.white }}>
          <CloseButton onPress={() => setIsCountryPickerOpen(false)} />
          <Text style={{ paddingBottom: 12, fontSize: fontSizes.size20, lineHeight: 27, fontFamily: fontFamilies.bold, color: TEXT }}>Select country code</Text>
          {countries.map((nextCountry) => (
            <Pressable
              key={nextCountry.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: nextCountry.id === country.id }}
              onPress={() => {
                setCountry(nextCountry);
                setContactPhone((current) => current.slice(0, nextCountry.phoneLength));
                setIsCountryPickerOpen(false);
              }}
              style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3, opacity: pressed ? 0.55 : 1 })}
            >
              <Text style={{ fontSize: fontSizes.size19 }}>{nextCountry.flag}</Text>
              <Text style={{ flex: 1, fontSize: fontSizes.size15, color: TEXT }}>{nextCountry.name}</Text>
              <Text selectable style={{ fontSize: fontSizes.size16, color: colors.mauveTone66_4 }}>{nextCountry.callingCode}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 18, paddingTop: 24, paddingBottom: keyboardVisible ? 14 : Math.max(insets.bottom, 14) + 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.white }}>
          <View pointerEvents="none" style={{ position: 'absolute', right: 0, bottom: -36, left: 0, height: 36, backgroundColor: colors.white }} />
          <CloseButton onPress={onClose} />
          <Text style={{ fontSize: fontSizes.size20, lineHeight: 27, fontFamily: fontFamilies.bold, color: TEXT }}>Contact for booking updates</Text>
          <Text style={{ marginTop: 8, fontSize: fontSizes.size13, lineHeight: 19, color: MUTED }}>Professional will contact at this number, and a tracking link will be shared</Text>
          <View style={{ minHeight: 58, marginTop: 22, flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden', borderWidth: 1, borderColor: fieldBorder(phoneFocused), borderRadius: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select country. Current selection ${country.name} ${country.callingCode}`}
              onPress={() => {
                Keyboard.dismiss();
                setIsCountryPickerOpen(true);
              }}
              style={({ pressed }) => ({ minWidth: 78, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: pressed ? 0.62 : 1 })}
            >
              <Text selectable style={{ fontSize: fontSizes.size15, color: TEXT }}>{country.callingCode}</Text>
              <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: 7, height: 7, borderRightWidth: 1.7, borderBottomWidth: 1.7, borderColor: TEXT, transform: [{ rotate: '45deg' }, { translateY: -2 }] }} />
            </Pressable>
            <View style={{ width: 1, alignSelf: 'stretch', marginVertical: 12, backgroundColor: BORDER }} />
            <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: fontSizes.size11, lineHeight: 14, color: MUTED }}>Number</Text>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={country.phoneLength}
                value={contactPhone}
                onChangeText={(value) => setContactPhone(value.replace(/\D/g, '').slice(0, country.phoneLength))}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                placeholder="Phone number"
                placeholderTextColor={colors.mauveTone66_3}
                style={{ height: 22, padding: 0, fontSize: fontSizes.size15, color: TEXT }}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pick from contacts"
              disabled={pickingContact}
              hitSlop={8}
              onPress={() => void pickFromContacts()}
              style={({ pressed }) => ({ width: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed || pickingContact ? 0.55 : 1 })}
            >
              <ContactPickerIcon />
            </Pressable>
          </View>
          <View style={{ minHeight: 58, marginTop: 12, paddingHorizontal: 13, paddingVertical: 8, justifyContent: 'center', borderWidth: 1, borderColor: fieldBorder(nameFocused), borderRadius: 8 }}>
            <Text style={{ fontSize: fontSizes.size11, lineHeight: 14, color: MUTED }}>Name</Text>
            <TextInput
              autoCapitalize="words"
              value={contactName}
              onChangeText={setContactName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Name"
              placeholderTextColor={colors.mauveTone66_3}
              style={{ height: 22, padding: 0, fontSize: fontSizes.size15, color: TEXT }}
            />
          </View>
          <Pressable disabled={!isValid} onPress={() => onSave(contactName.trim(), `${country.callingCode} ${contactPhone}`)} style={({ pressed }) => ({ height: 48, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: isValid ? PURPLE : colors.violetTone85_2, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.white }}>Save details</Text>
          </Pressable>
        </View>
      )}
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
  const [pinLocation, setPinLocation] = useState({ latitude: place.latitude, longitude: place.longitude });
  const [resolvedPlace, setResolvedPlace] = useState(place);
  const [lookingUpAddress, setLookingUpAddress] = useState(false);
  const lookupIdRef = useRef(0);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateAddressFromPin = (latitude: number, longitude: number) => {
    const didMove = Math.abs(latitude - pinLocation.latitude) > 0.00008 || Math.abs(longitude - pinLocation.longitude) > 0.00008;
    setPinLocation({ latitude, longitude });
    if (!didMove) return;
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    const lookupId = ++lookupIdRef.current;
    setLookingUpAddress(true);
    lookupTimerRef.current = setTimeout(() => {
      void reverseGeocodeLocation({ latitude, longitude })
        .then(({ display, geocodedAddress }) => {
          if (lookupId !== lookupIdRef.current) return;
          const next = buildAddressFromCurrentLocation(geocodedAddress, { latitude, longitude });
          setResolvedPlace((current) => ({
            ...current,
            addressLine1: next.addressLine1,
            addressLine2: next.addressLine2,
            city: next.city,
            country: next.country,
            latitude,
            longitude,
            pincode: next.pincode,
            state: next.state,
            subtitle: display.subtitle,
            title: display.title,
          }));
        })
        .catch(() => undefined)
        .finally(() => {
          if (lookupId === lookupIdRef.current) setLookingUpAddress(false);
        });
    }, 350);
  };
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
        addressLine1: resolvedPlace.addressLine1,
        addressLine2: resolvedPlace.addressLine2,
        addressType: resolvedPlace.addressType ?? (label === 'Home' ? 'apartment' : 'other'),
        city: resolvedPlace.city,
        contactName: contactName.trim(),
        contactPhone: contactPhoneDigits,
        country: resolvedPlace.country,
        houseNo: houseNo.trim(),
        instructions: resolvedPlace.instructions,
        label: label.toLowerCase() as 'home' | 'other',
        landmark: landmark.trim(),
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        pincode: resolvedPlace.pincode,
        state: resolvedPlace.state,
      };
      const savedAddress = resolvedPlace.addressId ? await updateAddress(authToken, resolvedPlace.addressId, payload) : await addAddress(authToken, payload);
      onSaved(savedAddress);
    } catch (error) { Alert.alert('Could not save address', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setSaving(false); }
  };
  return <View style={{ flex: 1, justifyContent: 'flex-end' }}><Pressable onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha72 }} />
    <SharedCloseButton color={TEXT} onPress={onClose} style={{ position: 'absolute', zIndex: 5, right: CLOSE_BUTTON_INSET, top: '4.5%' }} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ height: '91%' }}><View style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.white }}>
      <MapPreview latitude={pinLocation.latitude} longitude={pinLocation.longitude} onPinChange={updateAddressFromPin} /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14) + 14 }}>
        <View style={{ width: 34, height: 4, alignSelf: 'center', marginTop: 9, borderRadius: 2, backgroundColor: colors.mauveTone74 }} />
        <View style={{ minHeight: 89, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BORDER }}><View style={{ flex: 1 }}><Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: TEXT }}>{resolvedPlace.title}</Text><Text style={{ marginTop: 5, fontSize: fontSizes.size13, lineHeight: 19, color: MUTED }}>{lookingUpAddress ? 'Updating address...' : resolvedPlace.subtitle}</Text></View><Pressable onPress={onChange} style={{ paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: PURPLE, borderRadius: 8 }}><Text style={{ fontSize: fontSizes.size13, fontFamily: fontFamilies.semiBold, color: PURPLE }}>Change</Text></Pressable></View>
        <TextInput value={houseNo} onChangeText={setHouseNo} placeholder="House/Flat Number" placeholderTextColor={colors.mauveTone69} style={{ height: 50, marginTop: 16, paddingHorizontal: 13, borderWidth: 1, borderColor: BORDER, borderRadius: 8, fontSize: fontSizes.size14, color: TEXT }} />
        <TextInput value={landmark} onChangeText={setLandmark} placeholder="Landmark (Optional)" placeholderTextColor={colors.mauveTone69} style={{ height: 50, marginTop: 11, paddingHorizontal: 13, borderWidth: 1, borderColor: BORDER, borderRadius: 8, fontSize: fontSizes.size14, color: TEXT }} />
        <Text style={{ marginTop: 18, fontSize: fontSizes.size13, color: TEXT }}>Save as</Text><View style={{ marginTop: 9, flexDirection: 'row', gap: 10 }}>{(['Home', 'Other'] as const).map((item) => <Pressable key={item} onPress={() => setLabel(item)} style={{ paddingHorizontal: 19, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PURPLE, borderRadius: 7, backgroundColor: label === item ? PURPLE : colors.white }}><Text style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: label === item ? colors.white : PURPLE }}>{item}</Text></Pressable>)}</View>
        <View style={{ height: 60, marginTop: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.mauveTone94 }}><Image source={require('../../../assets/voice_calls.png')} contentFit="contain" tintColor={TEXT} style={{ width: 18, height: 18 }} /><Text style={{ flex: 1, marginLeft: 13, fontSize: fontSizes.size14, color: TEXT }}>{contactName}, {contactPhone || 'Phone number'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit contact details" hitSlop={10} onPress={() => setContactEditorVisible(true)} style={({ pressed }) => ({ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}><EditIcon size={16} /></Pressable></View>
        <Pressable disabled={!houseNo.trim() || saving} onPress={() => void save()} style={({ pressed }) => ({ height: 48, marginTop: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: houseNo.trim() ? PURPLE : colors.violetTone85_2, opacity: pressed ? 0.7 : 1 })}>{saving ? <LoadingDots color={colors.white} gap={6} size={5} /> : <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.white }}>{saveLabel}</Text>}</Pressable>
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
  return <View style={{ flex: 1, backgroundColor: colors.white }}>
    <View style={{ position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 8, backgroundColor: colors.whiteAlpha88 }}><View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}><Pressable hitSlop={10} onPress={onBack} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1, borderColor: colors.mauveTone89, backgroundColor: colors.transparent, opacity: pressed ? 0.65 : 1 })}><BackIcon color={colors.violetTone15} /></Pressable><Text style={{ marginLeft: 13, fontSize: fontSizes.size18, fontFamily: fontFamilies.bold, color: TEXT }}>Manage Addresses</Text></View></View>
    <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.white }} contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: 20, paddingBottom: 40 }}><Pressable onPress={() => { setSelectedPlace(null); setSheet('search'); }} style={{ height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 }}><Text style={{ width: 28, fontSize: fontSizes.size23, fontFamily: fontFamilies.light, color: PURPLE }}>+</Text><Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: PURPLE }}>Add another address</Text></Pressable>
      {addressState.isLoading ? <View style={{ marginTop: 34, alignItems: 'center', backgroundColor: colors.transparent }}><LoadingDots /></View> : null}
      {addressState.errorMessage ? <Pressable onPress={addressState.retry}><Text style={{ marginTop: 28, textAlign: 'center', fontSize: fontSizes.size14, color: MUTED }}>{addressState.errorMessage}{'\n'}Tap to retry</Text></Pressable> : null}
      {addressState.addresses.map((address) => <View key={address._id} style={{ minHeight: 120, paddingTop: 22, paddingBottom: 12, zIndex: menuId === address._id ? 10 : 0, elevation: menuId === address._id ? 10 : 0, borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3 }}><Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: TEXT }}>{formatAddressLabel(address.label)}</Text><Text style={{ marginTop: 6, paddingRight: 34, fontSize: fontSizes.size13, lineHeight: 20, color: colors.mauveTone31 }}>{formatSavedAddress(address)}</Text><Text style={{ marginTop: 5, fontSize: fontSizes.size13, color: colors.mauveTone31 }}>{address.contactName?.trim() || name || 'User'}, {formatContactPhone(address.contactPhone || phone)}</Text><Pressable accessibilityRole="button" accessibilityLabel="Address options" hitSlop={10} pressRetentionOffset={14} onPress={() => setMenuId((current) => current === address._id ? null : address._id)} style={({ pressed }) => ({ position: 'absolute', zIndex: 12, right: -7, top: 9, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}><Image source={require('../../../assets/more.png')} contentFit="contain" tintColor={TEXT} style={{ width: 14, height: 19 }} /></Pressable>{menuId === address._id ? <View style={{ position: 'absolute', right: 0, top: 52, zIndex: 11, width: 128, paddingVertical: 4, borderRadius: 3, backgroundColor: colors.white, shadowColor: colors.black, shadowOpacity: 0.15, shadowRadius: 8, elevation: 12 }}><Pressable onPress={() => { setMenuId(null); selectPlace({ addressId: address._id, title: formatAddressLabel(address.label), subtitle: formatSavedAddress(address), addressLine1: address.addressLine1, addressLine2: address.addressLine2, city: address.city, state: address.state, country: address.country, pincode: address.pincode, houseNo: address.houseNo, landmark: address.landmark, contactName: address.contactName, contactPhone: address.contactPhone, addressType: address.addressType, instructions: address.instructions, label: address.label?.toLowerCase() as AddAddressPayload['label'], latitude: address.location?.coordinates?.[1] ?? 30.7033, longitude: address.location?.coordinates?.[0] ?? 76.7176 }); }} style={{ padding: 14 }}><Text style={{ fontSize: fontSizes.size14, color: TEXT }}>Edit</Text></Pressable><Pressable disabled={deletingId === address._id} onPress={() => confirmDelete(address._id)} style={{ padding: 14 }}><Text style={{ fontSize: fontSizes.size14, color: TEXT }}>{deletingId === address._id ? 'Deleting...' : 'Delete'}</Text></Pressable></View> : null}</View>)}
      {!addressState.isLoading && !addressState.errorMessage && addressState.addresses.length === 0 ? <Text style={{ marginTop: 38, textAlign: 'center', fontSize: fontSizes.size14, color: MUTED }}>No saved addresses yet.</Text> : null}
    </ScrollView>
    <Modal animationType="slide" transparent visible={sheet === 'search'} onRequestClose={() => setSheet(null)}><LocationSearchSheet addresses={addressState.addresses} onClose={() => setSheet(null)} onSelect={(place) => selectPlace(selectedPlace?.addressId ? { ...place, addressId: selectedPlace.addressId, contactName: selectedPlace.contactName, contactPhone: selectedPlace.contactPhone, houseNo: selectedPlace.houseNo, landmark: selectedPlace.landmark, label: selectedPlace.label, addressType: selectedPlace.addressType, instructions: selectedPlace.instructions } : place)} /></Modal>
    <Modal animationType="slide" transparent visible={sheet === 'details' && Boolean(selectedPlace)} onRequestClose={() => setSheet(null)}>{selectedPlace ? <AddressDetailsSheet authToken={authToken} name={name} phone={phone} place={selectedPlace} onChange={() => setSheet('search')} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); setSelectedPlace(null); addressState.retry(); }} /> : null}</Modal>
  </View>;
}
