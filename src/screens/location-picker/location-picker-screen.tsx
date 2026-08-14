import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddresses } from '../../hooks/use-addresses';
import { formatAddressLabel, formatSavedAddress, setDefaultAddress, type UserAddress } from '../../services/address-api';

type LocationPickerScreenProps = {
  authToken?: string;
  onBack: () => void;
  onSelectAddress: (title: string, subtitle: string) => void;
  onUseCurrentLocation: () => void;
};

function TargetIcon() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.7, borderColor: '#6E45E2' }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#6E45E2' }} />
      <View style={{ position: 'absolute', top: 0, width: 1.6, height: 4, backgroundColor: '#6E45E2' }} />
      <View style={{ position: 'absolute', bottom: 0, width: 1.6, height: 4, backgroundColor: '#6E45E2' }} />
      <View style={{ position: 'absolute', left: 0, width: 4, height: 1.6, backgroundColor: '#6E45E2' }} />
      <View style={{ position: 'absolute', right: 0, width: 4, height: 1.6, backgroundColor: '#6E45E2' }} />
    </View>
  );
}

function HomeOutlineIcon() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderBottomWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#3F3A42' }} />
      <View style={{ width: 14, height: 10, borderWidth: 1.5, borderTopWidth: 0, borderColor: '#3F3A42' }} />
    </View>
  );
}

function WorkOutlineIcon() {
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 8, height: 4, borderWidth: 1.4, borderBottomWidth: 0, borderColor: '#3F3A42', borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
      <View style={{ width: 18, height: 12, borderWidth: 1.4, borderColor: '#3F3A42', borderRadius: 2 }} />
    </View>
  );
}

function OtherPinIcon() {
  return (
    <View style={{ width: 18, height: 22, alignItems: 'center' }}>
      <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1.6, borderColor: '#3F3A42' }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#3F3A42' }} />
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          marginTop: -2,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 7,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#3F3A42',
        }}
      />
    </View>
  );
}

function AddressIcon({ label }: { label?: string | null }) {
  const normalized = (label || '').toLowerCase();
  if (normalized === 'home') return <HomeOutlineIcon />;
  if (normalized === 'work') return <WorkOutlineIcon />;
  return <OtherPinIcon />;
}

function GoogleMark() {
  return (
    <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: -0.3, marginLeft:-2 }}>
      <Text style={{ color: '#4285F4' }}>G</Text>
      <Text style={{ color: '#EA4335' }}>o</Text>
      <Text style={{ color: '#FBBC05' }}>o</Text>
      <Text style={{ color: '#4285F4' }}>g</Text>
      <Text style={{ color: '#34A853' }}>l</Text>
      <Text style={{ color: '#EA4335' }}>e</Text>
    </Text>
  );
}

export function LocationPickerScreen({ authToken, onBack, onSelectAddress, onUseCurrentLocation }: LocationPickerScreenProps) {
  const insets = useSafeAreaInsets();
  const { addresses, errorMessage, isLoading, retry } = useAddresses(authToken);
  const [search, setSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleAddresses = useMemo(
    () =>
      addresses.filter((address) => {
        if (!normalizedSearch) return true;
        const haystack = `${address.label} ${formatSavedAddress(address)}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      }),
    [addresses, normalizedSearch],
  );

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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ height: 46, flexDirection: 'row', alignItems: 'center', paddingLeft: 4, paddingRight: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E4E1E5', backgroundColor: '#FFFFFF' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => ({ width: 40, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ fontSize: 23, lineHeight: 25, fontWeight: '400', color: '#171419' }}>←</Text>
          </Pressable>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for your location/society/apartment"
            placeholderTextColor="#9A959C"
            style={{ flex: 1, minWidth: 0, height: '100%', fontSize: 14, color: '#171419' }}
          />
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <Pressable
          accessibilityRole="button"
          onPress={handleCurrentLocation}
          disabled={isSelecting}
          style={({ pressed }) => ({ minHeight: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? '#F8F7F9' : '#FFFFFF', opacity: isSelecting ? 0.7 : 1 })}
        >
          <TargetIcon />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#6E45E2' }}>Use current location</Text>
        </Pressable>

        <View style={{ height: 1, marginHorizontal: 20, backgroundColor: '#EDECEE' }} />

        <Text style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8, fontSize: 16, fontWeight: '700', color: '#171419' }}>Saved</Text>

        {isLoading ? (
          <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ActivityIndicator color="#6E45E2" />
            <Text style={{ fontSize: 13, color: '#625D64' }}>Loading addresses...</Text>
          </View>
        ) : errorMessage ? (
          <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }}>
            <Text selectable style={{ textAlign: 'center', fontSize: 13, lineHeight: 19, color: '#625D64' }}>{errorMessage}</Text>
            <Pressable onPress={retry} style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: '#6E45E2' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Try again</Text>
            </Pressable>
          </View>
        ) : visibleAddresses.length === 0 ? (
          <Text selectable style={{ paddingHorizontal: 20, paddingVertical: 18, fontSize: 13, color: '#77717D' }}>
            {normalizedSearch ? 'No saved addresses match your search.' : 'No saved addresses yet.'}
          </Text>
        ) : (
          visibleAddresses.map((address, index) => (
            <View key={address._id}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleSelectAddress(address)}
                disabled={isSelecting}
                style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: pressed ? '#F8F7F9' : '#FFFFFF' })}
              >
                <View style={{ width: 22, marginTop: 2, alignItems: 'center' }}>
                  <AddressIcon label={address.label} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#171419' }}>{formatAddressLabel(address.label)}</Text>
                  <Text selectable style={{ fontSize: 13, lineHeight: 19, color: '#625D64' }}>{formatSavedAddress(address)}</Text>
                </View>
              </Pressable>
              {index < visibleAddresses.length - 1 ? <View style={{ height: 1, marginLeft: 56, backgroundColor: '#EDECEE' }} /> : null}
            </View>
          ))
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
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EDECEE',
          boxShadow: '0 -3px 10px rgba(23, 20, 25, 0.06)',
        }}
      >
        <Text style={{ fontSize: 11, color: '#9A959C' }}>powered by</Text>
        <GoogleMark />
      </View>
    </View>
  );
}
