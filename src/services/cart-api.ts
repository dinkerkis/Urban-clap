import { apiRequest, requireApiData, type ApiResponse } from './api-client';

export type CartVariant = {
  image?: string | null;
  key: string;
  label: string;
  price: number;
};

export type CartItem = {
  item_id: string;
  lineTotal: number;
  product_id: string;
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

type GetCartData = CartSummary & {
  items: CartItem[];
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

export function addCartItem(
  body: { product_id: string; quantity: number; variant_key?: string },
  token?: string,
): Promise<AddCartData> {
  return request<AddCartData>('/cart/add', 'POST', token, body);
}

export function getCart(token: string): Promise<GetCartData> {
  return request<GetCartData>('/cart', 'GET', token, undefined, 'Get Cart API');
}

export function decrementCartItem(itemId: string, token?: string): Promise<DecrementCartData> {
  return request<DecrementCartData>(`/cart/${encodeURIComponent(itemId)}/decrement`, 'PATCH', token);
}
