import { apiRequest, ApiClientError, requireApiData } from './api-client';

export type AddressLabel = 'Home' | 'Work' | 'Other';
export type AddressType = 'apartment' | 'independent_house' | 'office' | 'other';

export type UserAddress = {
  _id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  houseNo?: string;
  isActive?: boolean;
  isDefault?: boolean;
  label: AddressLabel | string;
  landmark?: string;
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
  label?: AddressLabel | null;
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

export async function setDefaultAddress(token: string, addressId: string): Promise<UserAddress> {
  const payload = await apiRequest<AddressResponse>(`/address/${addressId}/default`, {
    method: 'PATCH',
    logScope: 'Address API',
    token,
    defaultErrorMessage: 'Unable to set this address. Please try again.',
  });
  return requireApiData(payload, 'The address could not be updated. Please try again.');
}
