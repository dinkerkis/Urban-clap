import { useEffect, useRef } from 'react';

import { addAddress, buildAddressFromCurrentLocation, fetchAddresses, isSameSavedLocation } from '../services/address-api';
import type { CurrentLocation } from './use-current-location';

const savedLocationForToken = new Set<string>();

export function useSaveCurrentLocationAddress(token: string | undefined, location: CurrentLocation) {
  const inFlight = useRef(false);

  useEffect(() => {
    if (!token || savedLocationForToken.has(token) || inFlight.current) return;
    if (location.status !== 'ready' || !location.coords) return;

    inFlight.current = true;
    const payload = buildAddressFromCurrentLocation(location.geocodedAddress, location.coords);

    void (async () => {
      try {
        const addresses = await fetchAddresses(token);
        if (addresses.some((address) => isSameSavedLocation(address, payload))) {
          savedLocationForToken.add(token);
          return;
        }

        await addAddress(token, payload);
        savedLocationForToken.add(token);
      } catch {
        inFlight.current = false;
      }
    })();
  }, [location.coords, location.geocodedAddress, location.status, token]);
}
