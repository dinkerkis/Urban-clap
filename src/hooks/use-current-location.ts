import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

type LocationStatus = 'loading' | 'ready' | 'denied' | 'disabled' | 'error';

type CurrentLocation = {
  canAskAgain: boolean;
  label: string;
  refresh: () => Promise<void>;
  status: LocationStatus;
};

function formatAddress(address: Location.LocationGeocodedAddress | undefined): string | null {
  if (!address) return null;

  const parts = [address.city ?? address.district ?? address.subregion, address.region, address.country].filter(
    (part): part is string => Boolean(part),
  );
  return [...new Set(parts)].slice(0, 2).join(', ') || null;
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

      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        setStatus('disabled');
        setLabel('Turn on location services');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const addressLabel = formatAddress(addresses[0]);

      setLabel(addressLabel ?? `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`);
      setStatus('ready');
    } catch {
      setStatus('error');
      setLabel('Tap to retry location');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { canAskAgain, label, refresh, status };
}
