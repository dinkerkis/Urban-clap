import { GOOGLE_MAPS_API_KEY } from '../config/google-maps';
import type { AddAddressPayload } from './address-api';

export type PlaceSuggestion = {
  placeId: string;
  subtitle: string;
  title: string;
};

export type PlaceDetails = AddAddressPayload & {
  subtitle: string;
  title: string;
};

type AutocompletePrediction = {
  description?: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type AddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type PlaceDetailsResult = {
  address_components?: AddressComponent[];
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  name?: string;
};

function requireApiKey() {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is missing.');
  }
  return GOOGLE_MAPS_API_KEY;
}

function component(components: AddressComponent[], type: string, short = false): string {
  const match = components.find((item) => item.types?.includes(type));
  const value = short ? match?.short_name : match?.long_name;
  return value?.trim() || '';
}

export function createPlacesSessionToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchPlaceSuggestions(
  input: string,
  options?: { latitude?: number; longitude?: number; sessionToken?: string; signal?: AbortSignal },
): Promise<PlaceSuggestion[]> {
  const key = requireApiKey();
  const params = new URLSearchParams({
    input,
    key,
    language: 'en',
    components: 'country:in',
  });
  if (options?.sessionToken) params.set('sessiontoken', options.sessionToken);
  if (typeof options?.latitude === 'number' && typeof options?.longitude === 'number') {
    params.set('location', `${options.latitude},${options.longitude}`);
    params.set('radius', '40000');
  }

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`, {
    signal: options?.signal,
  });
  const payload = (await response.json()) as { error_message?: string; predictions?: AutocompletePrediction[]; status?: string };
  if (payload.status === 'ZERO_RESULTS') return [];
  if (payload.status !== 'OK') {
    throw new Error(payload.error_message || 'Unable to search locations right now.');
  }

  return (payload.predictions ?? [])
    .filter((item): item is AutocompletePrediction & { place_id: string } => Boolean(item.place_id))
    .map((item) => ({
      placeId: item.place_id,
      title: item.structured_formatting?.main_text?.trim() || item.description?.split(',')[0]?.trim() || 'Location',
      subtitle: item.structured_formatting?.secondary_text?.trim() || item.description?.trim() || '',
    }));
}

export async function fetchPlaceDetails(placeId: string, sessionToken?: string): Promise<PlaceDetails> {
  const key = requireApiKey();
  const params = new URLSearchParams({
    place_id: placeId,
    key,
    language: 'en',
    fields: 'name,formatted_address,geometry,address_component',
  });
  if (sessionToken) params.set('sessiontoken', sessionToken);

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`);
  const payload = (await response.json()) as { error_message?: string; result?: PlaceDetailsResult; status?: string };
  if (payload.status !== 'OK' || !payload.result) {
    throw new Error(payload.error_message || 'Unable to load that location.');
  }

  const result = payload.result;
  const components = result.address_components ?? [];
  const latitude = result.geometry?.location?.lat;
  const longitude = result.geometry?.location?.lng;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('That location does not have a map pin yet.');
  }

  const streetNumber = component(components, 'street_number');
  const route = component(components, 'route');
  const sublocality = component(components, 'sublocality') || component(components, 'sublocality_level_1');
  const neighborhood = component(components, 'neighborhood');
  const city = component(components, 'locality') || component(components, 'administrative_area_level_2');
  const state = component(components, 'administrative_area_level_1');
  const country = component(components, 'country');
  const pincode = component(components, 'postal_code');
  const title = result.name?.trim() || route || sublocality || city || 'Location';
  const formatted = result.formatted_address?.trim() || '';
  const subtitle = formatted.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*,\\s*`, 'i'), '') || formatted;
  const addressLine1 = [streetNumber, route].filter(Boolean).join(' ') || sublocality || neighborhood || title;

  return {
    title,
    subtitle,
    addressLine1,
    addressLine2: sublocality && sublocality !== addressLine1 ? sublocality : neighborhood,
    city,
    state,
    country,
    pincode,
    houseNo: streetNumber,
    latitude,
    longitude,
  };
}
