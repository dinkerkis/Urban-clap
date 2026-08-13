import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ServiceItem } from '../data/service-catalog';
import { addCartItem, decrementCartItem, getCart, type CartItem } from '../services/cart-api';
import { getCategoryImageUrl } from '../services/categories-api';

type CartState = {
  errorMessage: string;
  isLoading: boolean;
  itemsById: Record<string, ServiceItem>;
  quantities: Record<string, number>;
  totalItems: number;
  totalPrice: number;
};

const emptyState: CartState = {
  errorMessage: '',
  isLoading: false,
  itemsById: {},
  quantities: {},
  totalItems: 0,
  totalPrice: 0,
};

function cartKey(productId: string, variantKey?: string | null): string {
  return variantKey ? `${productId}::${variantKey}` : productId;
}

function mapCartItem(cartItem: CartItem, knownItem?: ServiceItem): ServiceItem {
  const key = cartKey(cartItem.product_id, cartItem.variant?.key);
  return {
    ...knownItem,
    id: key,
    productId: cartItem.product_id,
    title: cartItem.snapshot?.name || knownItem?.title || 'Product',
    description: knownItem?.description || '',
    price: cartItem.unitPrice,
    originalPrice: cartItem.unitPrice,
    duration: knownItem?.duration || '',
    rating: knownItem?.rating || 0,
    reviews: knownItem?.reviews || '',
    icon: '',
    tint: knownItem?.tint || '#F1F2FF',
    imageUrl: cartItem.variant?.image
      ? getCategoryImageUrl(cartItem.variant.image)
      : getCategoryImageUrl(cartItem.snapshot?.mainImage) || knownItem?.imageUrl,
    selectedVariantLabel: cartItem.variant?.label || knownItem?.selectedVariantLabel,
    serverCartItemId: cartItem.item_id,
    serverLineTotal: cartItem.lineTotal,
    slug: cartItem.snapshot?.slug || knownItem?.slug,
    variantKey: cartItem.variant?.key || knownItem?.variantKey,
  };
}

export function useCart(authToken?: string) {
  const [state, setState] = useState<CartState>({ ...emptyState, isLoading: Boolean(authToken) });

  const refresh = useCallback(async () => {
    if (!authToken) return;
    setState((current) => ({ ...current, errorMessage: '', isLoading: true }));

    try {
      const data = await getCart(authToken);
      if (__DEV__) {
        console.log(`[Get Cart API] Cart data used by UI\n${JSON.stringify(data, null, 2)}`);
      }
      setState((current) => {
        const itemsById: Record<string, ServiceItem> = {};
        const quantities: Record<string, number> = {};
        data.items.forEach((cartItem) => {
          const key = cartKey(cartItem.product_id, cartItem.variant?.key);
          itemsById[key] = mapCartItem(cartItem, current.itemsById[key]);
          quantities[key] = cartItem.quantity;
        });
        return {
          errorMessage: '',
          isLoading: false,
          itemsById,
          quantities,
          totalItems: data.totalItems,
          totalPrice: data.totalPrice,
        };
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        errorMessage: error instanceof Error ? error.message : 'Unable to load your cart.',
        isLoading: false,
      }));
      throw error;
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) void refresh().catch(() => undefined);
    else setState(emptyState);
  }, [authToken, refresh]);

  const add = useCallback(async (item: ServiceItem) => {
    const productId = item.productId || item.id.split('::')[0];
    const data = await addCartItem(
      {
        product_id: productId,
        variant_key: item.variantKey,
        quantity: 1,
      },
      authToken,
    );
    const key = cartKey(data.addedItem.product_id, data.addedItem.variant?.key || item.variantKey);

    setState((current) => ({
      ...current,
      errorMessage: '',
      itemsById: { ...current.itemsById, [key]: mapCartItem(data.addedItem, { ...item, id: key }) },
      quantities: { ...current.quantities, [key]: data.addedItem.quantity },
      totalItems: data.cartSummary.totalItems,
      totalPrice: data.cartSummary.totalPrice,
    }));
  }, [authToken]);

  const decrement = useCallback(async (item: ServiceItem) => {
    if (!item.serverCartItemId) {
      throw new Error('Cart item is still syncing. Please try again.');
    }

    const data = await decrementCartItem(item.serverCartItemId, authToken);
    setState((current) => {
      const itemsById = { ...current.itemsById };
      const quantities = { ...current.quantities };
      if (data.itemRemoved || data.quantity <= 0) {
        delete itemsById[item.id];
        delete quantities[item.id];
      } else {
        quantities[item.id] = data.quantity;
        itemsById[item.id] = {
          ...itemsById[item.id],
          serverLineTotal: data.lineTotal,
        };
      }
      return {
        ...current,
        errorMessage: '',
        itemsById,
        quantities,
        totalItems: data.cartSummary.totalItems,
        totalPrice: data.cartSummary.totalPrice,
      };
    });
  }, [authToken]);

  const items = useMemo(() => Object.values(state.itemsById), [state.itemsById]);

  return { ...state, add, decrement, items, refresh };
}
