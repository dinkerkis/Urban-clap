import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

type LocationStatus = 'loading' | 'ready' | 'denied' | 'disabled' | 'approximate' | 'error';

type CurrentLocation = {
  canAskAgain: boolean;
  label: string;
  refresh: () => Promise<void>;
  status: LocationStatus;
};

function logLocation(label: string, value: unknown): void {
  if (__DEV__) console.log(`[Location] ${label}`, value);
}

function formatAddress(address: Location.LocationGeocodedAddress | undefined): string | null {
  if (!address) return null;

  if (address.formattedAddress) return address.formattedAddress;

  const streetAddress = [address.streetNumber, address.street].filter(Boolean).join(' ');
  const candidates = [
    address.name,
    streetAddress,
    address.district,
    address.city ?? address.subregion,
    address.region,
    address.country,
  ].filter((part): part is string => Boolean(part?.trim()));
  const seenTokens = new Set<string>();
  const uniqueParts = candidates.filter((part) => {
    const tokens = part.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    if (tokens.length > 0 && tokens.every((token) => seenTokens.has(token))) return false;
    tokens.forEach((token) => seenTokens.add(token));
    return true;
  });

  return uniqueParts.slice(0, 4).join(', ') || null;
}

export function useCurrentLocation(): CurrentLocation {
  const [label, setLabel] = useState('Finding your location...');
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [canAskAgain, setCanAskAgain] = useState(true);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setLabel('Finding your location...');

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      setCanAskAgain(permission.canAskAgain);
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setStatus('denied');
        setLabel('Allow location access');
        return;
      }

      const hasApproximateLocation = permission.ios?.accuracy === 'reduced' || permission.android?.accuracy === 'coarse';
      if (hasApproximateLocation) {
        setStatus('approximate');
        setLabel('Enable precise location');
        return;
      }

      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        setStatus('disabled');
        setLabel('Turn on location services');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      
      const addressLabel = formatAddress(addresses[0]);
      setLabel(addressLabel ?? `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
      setStatus('ready');
    } catch (error) {
      
      setStatus('error');
      setLabel('Tap to retry location');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { canAskAgain, label, refresh, status };
}
