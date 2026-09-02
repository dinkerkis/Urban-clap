import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { TextInput } from '../../components/app-text-input';
import { Text } from '../../components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { LoadingDots } from '../../components/loading-dots';
import { useAddresses } from '../../hooks/use-addresses';
import { usePlaceSuggestions } from '../../hooks/use-place-suggestions';
import { formatAddressLabel, formatSavedAddress, setDefaultAddress, type UserAddress } from '../../services/address-api';
import { fetchPlaceDetails, type PlaceSuggestion } from '../../services/places-api';
import { getRecentLocations, saveRecentLocation, type RecentLocation } from '../../services/recent-locations-storage';

type LocationPickerScreenProps = {
  authToken?: string;
  onBack: () => void;
  onSelectAddress: (title: string, subtitle: string) => void;
  onUseCurrentLocation: () => void;
};

function TargetIcon() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.7, borderColor: colors.violetTone58 }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.violetTone58 }} />
      <View style={{ position: 'absolute', top: 0, width: 1.6, height: 4, backgroundColor: colors.violetTone58 }} />
      <View style={{ position: 'absolute', bottom: 0, width: 1.6, height: 4, backgroundColor: colors.violetTone58 }} />
      <View style={{ position: 'absolute', left: 0, width: 4, height: 1.6, backgroundColor: colors.violetTone58 }} />
      <View style={{ position: 'absolute', right: 0, width: 4, height: 1.6, backgroundColor: colors.violetTone58 }} />
    </View>
  );
}

function HomeOutlineIcon() {
  return <Image source={require('../../../assets/home.png')} contentFit="contain" tintColor={colors.mauveTone24_2} style={{ width: 17, height: 17 }} />;
}

function WorkOutlineIcon() {
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 8, height: 4, borderWidth: 1.4, borderBottomWidth: 0, borderColor: colors.mauveTone24_2, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
      <View style={{ width: 18, height: 12, borderWidth: 1.4, borderColor: colors.violetTone98_3, borderRadius: 2 }} />
    </View>
  );
}

function OtherPinIcon() {
  return <Image source={require('../../../assets/location.png')} contentFit="contain" tintColor={colors.mauveTone24_2} style={{ width: 18, height: 18 }} />;
}

function RecentIcon() {
  return <Image source={require('../../../assets/recent.png')} contentFit="contain" tintColor={colors.mauveTone24_2} style={{ width: 17, height: 17 }} />;
}

function AddressIcon({ label }: { label?: string | null }) {
  const normalized = (label || '').toLowerCase();
  if (normalized === 'home') return <HomeOutlineIcon />;
  if (normalized === 'work') return <WorkOutlineIcon />;
  return <OtherPinIcon />;
}

function GoogleMark() {
  return (
    <Text style={{ fontSize: fontSizes.size12, fontFamily: fontFamilies.bold, letterSpacing: -0.3, marginLeft:-2 }}>
      <Text style={{ color: colors.blueTone61 }}>G</Text>
      <Text style={{ color: colors.redTone56 }}>o</Text>
      <Text style={{ color: colors.yellowTone50 }}>o</Text>
      <Text style={{ color: colors.blueTone61 }}>g</Text>
      <Text style={{ color: colors.greenTone43 }}>l</Text>
      <Text style={{ color: colors.redTone56 }}>e</Text>
    </Text>
  );
}

export function LocationPickerScreen({ authToken, onBack, onSelectAddress, onUseCurrentLocation }: LocationPickerScreenProps) {
  const insets = useSafeAreaInsets();
  const { addresses, errorMessage, isLoading, retry } = useAddresses(authToken);
  const [search, setSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllRecents, setShowAllRecents] = useState(false);
  const { consumeSessionToken, errorMessage: searchError, isSearching, suggestions } = usePlaceSuggestions(search);

  useEffect(() => {
    let active = true;
    void getRecentLocations().then((stored) => {
      if (active) setRecentLocations(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const isSearchActive = normalizedSearch.length >= 2;
  const visibleAddresses = useMemo(
    () =>
      addresses.filter((address) => {
        if (!normalizedSearch) return true;
        const haystack = `${address.label} ${formatSavedAddress(address)}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      }),
    [addresses, normalizedSearch],
  );
  const displayedAddresses = showAllSaved ? visibleAddresses : visibleAddresses.slice(0, 2);
  const displayedRecents = showAllRecents ? recentLocations : recentLocations.slice(0, 2);

  const handleCurrentLocation = () => {
    if (isSelecting) return;
    onUseCurrentLocation();
  };

  const handleSelectAddress = async (address: UserAddress) => {
    if (isSelecting) return;
    setIsSelecting(true);
    try {
      if (authToken) await setDefaultAddress(authToken, address._id);
    } catch {
      // Keep the local selection even if default update fails.
    } finally {
      onSelectAddress(formatAddressLabel(address.label), formatSavedAddress(address));
      setIsSelecting(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    if (isSelecting) return;
    setIsSelecting(true);
    try {
      const place = await fetchPlaceDetails(suggestion.placeId, consumeSessionToken());
      setRecentLocations((current) => saveRecentLocation({ placeId: suggestion.placeId, title: place.title, subtitle: place.subtitle }, current));
      onSelectAddress(place.title, place.subtitle);
    } catch (error) {
      Alert.alert('Could not select location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ height: 46, flexDirection: 'row', alignItems: 'center', paddingLeft: 4, paddingRight: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.mauveTone89_2, backgroundColor: colors.white }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => ({ width: 40, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
          >
            <BackIcon />
          </Pressable>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for your location/society/apartment"
            placeholderTextColor={colors.mauveTone78}
            style={{ flex: 1, minWidth: 0, height: '100%', fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}
          />
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <Pressable
          accessibilityRole="button"
          onPress={handleCurrentLocation}
          disabled={isSelecting}
          style={({ pressed }) => ({ minHeight: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? colors.violetTone97_5 : colors.white, opacity: isSelecting ? 0.7 : 1 })}
        >
          <TargetIcon />
          <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>Use current location</Text>
        </Pressable>

        <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />

        {isSearchActive ? (
          <>
            {isSearching && suggestions.length === 0 ? (
              <View style={{ minHeight: 88, alignItems: 'center', justifyContent: 'center' }}>
                <LoadingDots />
              </View>
            ) : searchError ? (
              <Text selectable style={{ paddingHorizontal: 20, paddingVertical: 18, fontSize: fontSizes.size13, color: colors.violetTone47 }}>{searchError}</Text>
            ) : suggestions.length === 0 ? (
              <Text selectable style={{ paddingHorizontal: 20, paddingVertical: 18, fontSize: fontSizes.size13, color: colors.violetTone47 }}>No locations found.</Text>
            ) : (
              suggestions.map((suggestion, index) => (
                <View key={suggestion.placeId}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSelecting}
                    onPress={() => void handleSelectSuggestion(suggestion)}
                    style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: pressed ? colors.violetTone97_5 : colors.white, opacity: isSelecting ? 0.7 : 1 })}
                  >
                    <View style={{ width: 22, marginTop: 2, alignItems: 'center' }}>
                      <OtherPinIcon />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: fontSizes.size16, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>{suggestion.title}</Text>
                      {suggestion.subtitle ? <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{suggestion.subtitle}</Text> : null}
                    </View>
                  </Pressable>
                  {index < suggestions.length - 1 ? <View style={{ height: 1, marginLeft: 56, backgroundColor: colors.violetTone98_3 }} /> : null}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8, fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>Saved</Text>
            {isLoading ? (
              <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <LoadingDots />
                <Text style={{ fontSize: fontSizes.size13, color: colors.mauveTone38_2 }}>Loading addresses...</Text>
              </View>
            ) : errorMessage ? (
              <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }}>
                <Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{errorMessage}</Text>
                <Pressable onPress={retry} style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.violetTone58 }}>
                  <Text style={{ fontSize: fontSizes.size13, fontFamily: fontFamilies.semiBold, color: colors.white }}>Try again</Text>
                </Pressable>
              </View>
            ) : visibleAddresses.length === 0 ? (
              <Text selectable style={{ paddingHorizontal: 20, paddingVertical: 18, fontSize: fontSizes.size13, color: colors.violetTone47 }}>No saved addresses yet.</Text>
            ) : (
              displayedAddresses.map((address, index) => (
                <View key={address._id}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleSelectAddress(address)}
                    disabled={isSelecting}
                    style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: pressed ? colors.violetTone97_5 : colors.white })}
                  >
                    <View style={{ width: 22, marginTop: 2, alignItems: 'center' }}>
                      <AddressIcon label={address.label} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>{formatAddressLabel(address.label)}</Text>
                      <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{formatSavedAddress(address)}</Text>
                    </View>
                  </Pressable>
                  {index < displayedAddresses.length - 1 ? <View style={{ height: 1, marginLeft: 56, backgroundColor: colors.violetTone98_3 }} /> : null}
                </View>
              ))
            )}

            {!showAllSaved && visibleAddresses.length > 2 ? (
              <>
                <Pressable accessibilityRole="button" onPress={() => setShowAllSaved(true)} style={({ pressed }) => ({ alignSelf: 'flex-start', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, opacity: pressed ? 0.55 : 1 })}>
                  <Text style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>View more</Text>
                </Pressable>
                <View style={{ width: '100%', height: 8, alignSelf: 'stretch', backgroundColor: colors.violetTone98_3 }} />
              </>
            ) : null}

            {recentLocations.length > 0 ? (
              <>
                <Text style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 8, fontSize: fontSizes.size16, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>Recents</Text>
                {displayedRecents.map((location, index) => (
                  <View key={location.placeId}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onSelectAddress(location.title, location.subtitle)}
                      style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: pressed ? colors.violetTone97_5 : colors.white })}
                    >
                      <View style={{ width: 22, marginTop: 2, alignItems: 'center' }}>
                        <RecentIcon />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>{location.title}</Text>
                        {location.subtitle ? <Text selectable style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>{location.subtitle}</Text> : null}
                      </View>
                    </Pressable>
                    {index < displayedRecents.length - 1 ? <View style={{ height: 1, marginLeft: 56, backgroundColor: colors.violetTone98_3 }} /> : null}
                  </View>
                ))}
                {!showAllRecents && recentLocations.length > 2 ? (
                  <>
                    <Pressable accessibilityRole="button" onPress={() => setShowAllRecents(true)} style={({ pressed }) => ({ alignSelf: 'flex-start', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, opacity: pressed ? 0.55 : 1 })}>
                      <Text style={{ fontSize: fontSizes.size14, fontFamily: fontFamilies.semiBold, color: colors.violetTone58 }}>View more</Text>
                    </Pressable>
                    <View style={{ width: '100%', height: 8, alignSelf: 'stretch', backgroundColor: colors.violetTone98_3 }} />
                  </>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
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
  );
}
