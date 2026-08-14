import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type LocationStatus = 'loading' | 'ready' | 'denied' | 'disabled' | 'approximate' | 'error';

export type CurrentLocationCoords = {
  latitude: number;
  longitude: number;
};

export type CurrentLocation = {
  canAskAgain: boolean;
  coords: CurrentLocationCoords | null;
  geocodedAddress: Location.LocationGeocodedAddress | null;
  label: string;
  refresh: () => Promise<void>;
  status: LocationStatus;
};

export type LocationDisplay = {
  subtitle: string;
  title: string;
};

type LocationSnapshot = Omit<CurrentLocation, 'refresh'>;

const loadingSnapshot: LocationSnapshot = {
  canAskAgain: true,
  coords: null,
  geocodedAddress: null,
  label: 'Finding your location...',
  status: 'loading',
};

let cachedSnapshot: LocationSnapshot | null = null;
let inFlight: Promise<LocationSnapshot> | null = null;

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

function stripLeadingTitle(full: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return full.replace(new RegExp(`^${escaped}\\s*,\\s*`, 'i'), '').trim();
}

export function formatLocationDisplay(
  address: Location.LocationGeocodedAddress | null | undefined,
  fallbackLabel?: string,
): LocationDisplay {
  if (!address) {
    return {
      title: 'your area',
      subtitle: fallbackLabel || 'Enable location to see services near you.',
    };
  }

  const candidates = [address.name, address.district, address.city, address.subregion].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  const title = candidates.find((part) => part.length <= 28 && !part.includes(',')) || candidates[0] || 'your area';
  const streetAddress = [address.streetNumber, address.street].filter(Boolean).join(' ');
  const regionLine = [address.region, address.postalCode].filter((part): part is string => Boolean(part?.trim())).join(' ');
  const restParts = [
    streetAddress !== title ? streetAddress : '',
    address.district && address.district !== title ? address.district : '',
    address.city && address.city !== title ? address.city : '',
    address.subregion && address.subregion !== title && address.subregion !== address.city ? address.subregion : '',
    regionLine,
    address.country,
  ].filter((part): part is string => Boolean(part?.trim()));
  const assembled = restParts.join(', ');
  const fromFormatted = address.formattedAddress ? stripLeadingTitle(address.formattedAddress, title) : '';
  const subtitle = fromFormatted || assembled || fallbackLabel || '';

  return { title, subtitle };
}

export async function fetchCurrentLocation(): Promise<LocationSnapshot> {
  if (cachedSnapshot?.status === 'ready') return cachedSnapshot;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        return { ...loadingSnapshot, canAskAgain: permission.canAskAgain, status: 'denied', label: 'Allow location access' };
      }

      const hasApproximateLocation = permission.ios?.accuracy === 'reduced' || permission.android?.accuracy === 'coarse';
      if (hasApproximateLocation) {
        return { ...loadingSnapshot, canAskAgain: permission.canAskAgain, status: 'approximate', label: 'Enable precise location' };
      }

      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        return { ...loadingSnapshot, canAskAgain: permission.canAskAgain, status: 'disabled', label: 'Turn on location services' };
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const addresses = await Location.reverseGeocodeAsync(coords);
      const addressLabel = formatAddress(addresses[0]);
      const snapshot: LocationSnapshot = {
        canAskAgain: permission.canAskAgain,
        coords,
        geocodedAddress: addresses[0] ?? null,
        label: addressLabel ?? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        status: 'ready',
      };
      cachedSnapshot = snapshot;
      return snapshot;
    } catch {
      return { ...loadingSnapshot, status: 'error', label: 'Tap to retry location' };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function getCachedLocation(): LocationSnapshot | null {
  return cachedSnapshot;
}

export function useCurrentLocation(): CurrentLocation {
  const [snapshot, setSnapshot] = useState<LocationSnapshot>(cachedSnapshot ?? loadingSnapshot);

  const refresh = useCallback(async () => {
    if (cachedSnapshot?.status === 'ready') {
      setSnapshot(cachedSnapshot);
      return;
    }
    setSnapshot(loadingSnapshot);
    setSnapshot(await fetchCurrentLocation());
  }, []);

  useEffect(() => {
    if (cachedSnapshot?.status === 'ready') {
      setSnapshot(cachedSnapshot);
      return;
    }

    let cancelled = false;
    void fetchCurrentLocation().then((next) => {
      if (!cancelled) setSnapshot(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...snapshot, refresh };
}
