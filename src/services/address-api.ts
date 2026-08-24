import { apiRequest, ApiClientError, requireApiData } from './api-client';

export type AddressLabel = 'Home' | 'Work' | 'Other';
export type AddressType = 'apartment' | 'independent_house' | 'office' | 'other';

export type UserAddress = {
  _id: string;
  contactName?: string;
  contactPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  addressType?: AddressType;
  city: string;
  country: string;
  houseNo?: string;
  isActive?: boolean;
  isDefault?: boolean;
  label: AddressLabel | string | null;
  landmark?: string;
  instructions?: string;
  location?: {
    coordinates?: [number, number];
    type?: string;
  };
  pincode: string;
  state: string;
};

export type GeocodedLocation = {
  city?: string | null;
  country?: string | null;
  district?: string | null;
  name?: string | null;
  postalCode?: string | null;
  region?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  subregion?: string | null;
};

export type AddAddressPayload = {
  addressLine1: string;
  addressLine2?: string;
  addressType?: AddressType;
  city: string;
  contactName?: string;
  contactPhone?: string;
  country: string;
  houseNo?: string;
  instructions?: string;
  label?: Lowercase<AddressLabel> | null;
  landmark?: string;
  latitude: number;
  longitude: number;
  pincode: string;
  state: string;
};

type AddressListResponse = {
  data: UserAddress[];
  message?: string;
  success: boolean;
};

type AddressResponse = {
  data: UserAddress;
  message?: string;
  success: boolean;
};

type DeleteAddressResponse = {
  data: { _id: string };
  message?: string;
  success: boolean;
};

export function formatSavedAddress(address: UserAddress): string {
  return [address.houseNo, address.addressLine1, address.addressLine2, address.landmark, address.city, address.state, address.pincode, address.country]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
}

export function formatAddressLabel(label?: string | null): string {
  if (!label) return 'Address';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function text(value?: string | null): string {
  return value?.trim() || '';
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const area =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(area));
}

export function isSameSavedLocation(
  address: UserAddress,
  payload: Pick<AddAddressPayload, 'addressLine1' | 'city' | 'latitude' | 'longitude' | 'pincode'>,
): boolean {
  const longitude = address.location?.coordinates?.[0];
  const latitude = address.location?.coordinates?.[1];
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return distanceMeters(latitude, longitude, payload.latitude, payload.longitude) < 80;
  }

  return (
    text(address.addressLine1) === text(payload.addressLine1) &&
    text(address.city) === text(payload.city) &&
    text(address.pincode) === text(payload.pincode)
  );
}

export function buildAddressFromCurrentLocation(
  address: GeocodedLocation | null,
  coords: { latitude: number; longitude: number },
): AddAddressPayload {
  const houseNo = text(address?.streetNumber);
  const streetOrName = text(address?.street) || text(address?.name);
  const district = text(address?.district);
  const addressLine1 = streetOrName || district;
  const addressLine2 = district && district !== addressLine1 ? district : '';

  return {
    label: null,
    houseNo,
    addressLine1,
    addressLine2,
    city: text(address?.city) || text(address?.subregion),
    state: text(address?.region),
    country: text(address?.country),
    pincode: text(address?.postalCode),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

export async function fetchAddresses(token: string, signal?: AbortSignal): Promise<UserAddress[]> {
  const payload = await apiRequest<AddressListResponse>('/address', {
    logScope: 'Address API',
    signal,
    token,
    defaultErrorMessage: 'Unable to load saved addresses. Please try again.',
  });
  if (!payload.success) {
    throw new ApiClientError(payload.message || 'The address list is invalid. Please try again.', 200, 'INVALID_RESPONSE');
  }
  const addresses = Array.isArray(payload.data) ? payload.data : [];
  return addresses.filter((address) => address.isActive !== false);
}

export async function addAddress(token: string, body: AddAddressPayload): Promise<UserAddress> {
  const payload = await apiRequest<AddressResponse>('/address', {
    method: 'POST',
    json: body,
    logScope: 'Address API',
    token,
    defaultErrorMessage: 'Unable to save this address. Please try again.',
  });
  return requireApiData(payload, 'The address could not be saved. Please try again.');
}

export async function updateAddress(token: string, addressId: string, body: AddAddressPayload): Promise<UserAddress> {
  const payload = await apiRequest<AddressResponse>(`/address/${encodeURIComponent(addressId)}`, {
    method: 'PUT',
    json: body,
    logScope: 'Address API',
    token,
    defaultErrorMessage: 'Unable to update this address. Please try again.',
  });
  return requireApiData(payload, 'The address could not be updated. Please try again.');
}

export async function setDefaultAddress(token: string, addressId: string): Promise<UserAddress> {
  const payload = await apiRequest<AddressResponse>(`/address/${encodeURIComponent(addressId)}/default`, {
    method: 'PATCH',
    logScope: 'Address API',
    token,
    defaultErrorMessage: 'Unable to set this address. Please try again.',
  });
  return requireApiData(payload, 'The address could not be updated. Please try again.');
}

export async function deleteAddress(token: string, addressId: string): Promise<string> {
  const payload = await apiRequest<DeleteAddressResponse>(`/address/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
    logScope: 'Address API',
    token,
    defaultErrorMessage: 'Unable to delete this address. Please try again.',
  });
  return requireApiData(payload, 'The address could not be deleted. Please try again.')._id;
}
