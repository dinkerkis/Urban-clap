import { apiRequest, requireApiData, type ApiResponse } from './api-client';
import { apiEndpoints } from './api-endpoints';

export type CartVariant = {
  image?: string | null;
  key: string;
  label: string;
  price: number;
};

export type CartItem = {
  item_id: string;
  lineTotal: number;
  option_id?: string;
  product_id: string;
  productType?: string;
  quantity: number;
  snapshot?: {
    mainImage?: string;
    name?: string;
    slug?: string;
  };
  unitPrice: number;
  variant?: CartVariant | null;
};

export type CartSummary = {
  totalItems: number;
  totalPrice: number;
};

type AddCartData = {
  addedItem: CartItem;
  cartSummary: CartSummary;
};

export type CartCategoryGroup = {
  category_id: string;
  category_name: string;
  categoryTotal: number;
  charges: {
    govtTax: number;
    platformFee: number;
    visitationFee: number;
  };
  items: CartItem[];
  subtotal: number;
};

export type GetCartData = Partial<CartSummary> & {
  categoryGroups?: CartCategoryGroup[];
  grandTotal?: number;
  items?: CartItem[];
  itemsSubtotal?: number;
};

type DecrementCartData = {
  cartSummary: CartSummary;
  itemId: string;
  itemRemoved: boolean;
  lineTotal: number;
  quantity: number;
};

async function request<T>(path: string, method: 'GET' | 'PATCH' | 'POST', token?: string, json?: unknown, logScope = 'Cart API'): Promise<T> {
  const payload = await apiRequest<ApiResponse<T>>(path, {
    method,
    token,
    json,
    credentials: 'include',
    logScope,
    defaultErrorMessage: 'Unable to update your cart. Please try again.',
  });
  return requireApiData(payload, 'The cart response was incomplete. Please try again.');
}

export const NATIVE_PRODUCT_TYPE = 'NativeProduct' as const;

export type AddCartItemBody =
  | { product_id: string; quantity: number; variant_key?: string }
  | { option_id: string; product_id: string; productType: typeof NATIVE_PRODUCT_TYPE; quantity: number };

export function addCartItem(body: AddCartItemBody, token?: string): Promise<AddCartData> {
  return request<AddCartData>(apiEndpoints.cart.add, 'POST', token, body);
}

export function getCart(token: string): Promise<GetCartData> {
  return request<GetCartData>(apiEndpoints.cart.details, 'GET', token, undefined, 'Get Cart API');
}

export function decrementCartItem(itemId: string, token?: string): Promise<DecrementCartData> {
  return request<DecrementCartData>(apiEndpoints.cart.decrement(itemId), 'PATCH', token);
}
