import { addAddress, buildAddressFromCurrentLocation, fetchAddresses, isSameSavedLocation } from '../services/address-api';
import type { CurrentLocation } from './use-current-location';

const savedLocationForToken = new Set<string>();

export async function saveCurrentLocationAddress(
  token: string | undefined,
  location: Pick<CurrentLocation, 'coords' | 'geocodedAddress' | 'status'>,
): Promise<void> {
  if (!token || savedLocationForToken.has(token)) return;
  if (location.status !== 'ready' || !location.coords) return;

  const payload = buildAddressFromCurrentLocation(location.geocodedAddress, location.coords);

  try {
    const addresses = await fetchAddresses(token);
    if (addresses.some((address) => isSameSavedLocation(address, payload))) {
      savedLocationForToken.add(token);
      return;
    }

    await addAddress(token, payload);
    savedLocationForToken.add(token);
  } catch {
    // Keep bootstrap/home unblocked if address save fails.
  }
}
