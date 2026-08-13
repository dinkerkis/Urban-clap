import { useEffect, useRef } from 'react';

import { addAddress, buildAddressFromCurrentLocation, fetchAddresses } from '../services/address-api';
import type { CurrentLocation } from './use-current-location';

const savedHomeForToken = new Set<string>();

export function useSaveCurrentLocationAddress(token: string | undefined, location: CurrentLocation) {
  const inFlight = useRef(false);

  useEffect(() => {
    if (!token || savedHomeForToken.has(token) || inFlight.current) return;
    if (location.status !== 'ready' || !location.coords) return;

    inFlight.current = true;
    const payload = buildAddressFromCurrentLocation(location.geocodedAddress, location.coords);

    void (async () => {
      try {
        const addresses = await fetchAddresses(token);
        if (addresses.some((address) => String(address.label).toLowerCase() === 'home')) {
          savedHomeForToken.add(token);
          return;
        }

        await addAddress(token, payload);
        savedHomeForToken.add(token);
      } catch {
        inFlight.current = false;
      }
    })();
  }, [location.coords, location.geocodedAddress, location.status, token]);
}
