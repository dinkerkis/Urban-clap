import { colors } from '../theme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ServiceItem } from '../data/service-catalog';
import { addCartItem, decrementCartItem, getCart, type CartItem } from '../services/cart-api';
import { getCategoryImageUrl } from '../services/categories-api';

type CartState = {
  errorMessage: string;
  isLoading: boolean;
  itemsSubtotal: number;
  itemsById: Record<string, ServiceItem>;
  quantities: Record<string, number>;
  totalItems: number;
  totalPrice: number;
  grandTotal: number;
};

const emptyState: CartState = {
  errorMessage: '',
  isLoading: false,
  itemsSubtotal: 0,
  itemsById: {},
  quantities: {},
  totalItems: 0,
  totalPrice: 0,
  grandTotal: 0,
};

function cartKey(productId: string, variantKey?: string | null): string {
  return variantKey ? `${productId}::${variantKey}` : productId;
}

function mapCartItem(cartItem: CartItem, knownItem?: ServiceItem, category?: { id: string; name: string; total?: number }): ServiceItem {
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
    tint: knownItem?.tint || colors.blueTone97_2,
    imageUrl: cartItem.variant?.image
      ? getCategoryImageUrl(cartItem.variant.image)
      : getCategoryImageUrl(cartItem.snapshot?.mainImage) || knownItem?.imageUrl,
    selectedVariantLabel: cartItem.variant?.label || knownItem?.selectedVariantLabel,
    serverCartItemId: cartItem.item_id,
    serverLineTotal: cartItem.lineTotal,
    cartCategoryId: category?.id || knownItem?.cartCategoryId,
    cartCategoryName: category?.name || knownItem?.cartCategoryName,
    cartCategoryTotal: category?.total ?? knownItem?.cartCategoryTotal,
    slug: cartItem.snapshot?.slug || knownItem?.slug,
    variantKey: cartItem.variant?.key || knownItem?.variantKey,
  };
}

export function useCart(authToken?: string) {
  const [state, setState] = useState<CartState>({ ...emptyState, isLoading: Boolean(authToken) });
  const mutationVersionRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!authToken) return;
    const refreshVersion = mutationVersionRef.current;
    setState((current) => ({ ...current, errorMessage: '', isLoading: true }));

    try {
      const data = await getCart(authToken);
      if (__DEV__) {
        console.log(`[Get Cart API] Cart data used by UI\n${JSON.stringify(data, null, 2)}`);
      }
      if (refreshVersion !== mutationVersionRef.current) return;
      setState((current) => {
        const itemsById: Record<string, ServiceItem> = {};
        const quantities: Record<string, number> = {};
        const groupedItems = Array.isArray(data.categoryGroups)
          ? data.categoryGroups.flatMap((group) => group.items.map((item) => ({
              category: { id: group.category_id, name: group.category_name, total: group.categoryTotal },
              item,
            })))
          : [];
        const items = groupedItems.length > 0
          ? groupedItems
          : (Array.isArray(data.items) ? data.items : []).map((item) => ({ category: undefined, item }));
        items.forEach(({ category, item: cartItem }) => {
          const key = cartKey(cartItem.product_id, cartItem.variant?.key);
          itemsById[key] = mapCartItem(cartItem, current.itemsById[key], category);
          quantities[key] = cartItem.quantity;
        });
        const itemsSubtotal = data.itemsSubtotal ?? data.totalPrice ?? 0;
        const grandTotal = data.grandTotal ?? data.totalPrice ?? itemsSubtotal;
        return {
          errorMessage: '',
          isLoading: false,
          itemsSubtotal,
          itemsById,
          quantities,
          totalItems: data.totalItems ?? 0,
          totalPrice: grandTotal,
          grandTotal,
        };
      });
    } catch (error) {
      if (refreshVersion !== mutationVersionRef.current) return;
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

  const add = useCallback(async (item: ServiceItem, quantity = 1) => {
    const productId = item.productId || item.id.split('::')[0];
    const data = await addCartItem(
      {
        product_id: productId,
        variant_key: item.variantKey,
        quantity,
      },
      authToken,
    );
    const key = cartKey(data.addedItem.product_id, data.addedItem.variant?.key || item.variantKey);

    mutationVersionRef.current += 1;
    setState((current) => ({
      ...current,
      errorMessage: '',
      isLoading: false,
      itemsById: { ...current.itemsById, [key]: mapCartItem(data.addedItem, { ...item, id: key }) },
      quantities: { ...current.quantities, [key]: data.addedItem.quantity },
      itemsSubtotal: data.cartSummary.totalPrice,
      totalItems: data.cartSummary.totalItems,
      totalPrice: data.cartSummary.totalPrice,
      grandTotal: data.cartSummary.totalPrice,
    }));
  }, [authToken]);

  const decrement = useCallback(async (item: ServiceItem) => {
    if (!item.serverCartItemId) {
      throw new Error('Cart item is still syncing. Please try again.');
    }

    const data = await decrementCartItem(item.serverCartItemId, authToken);
    mutationVersionRef.current += 1;
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
        isLoading: false,
        itemsById,
        quantities,
        itemsSubtotal: data.cartSummary.totalPrice,
        totalItems: data.cartSummary.totalItems,
        totalPrice: data.cartSummary.totalPrice,
        grandTotal: data.cartSummary.totalPrice,
      };
    });
  }, [authToken]);

  const clear = useCallback(async () => {
    const selections = Object.values(state.itemsById).map((item) => ({
      item,
      quantity: state.quantities[item.id] ?? 0,
    }));

    try {
      for (const { item, quantity } of selections) {
        if (!item.serverCartItemId) throw new Error('A cart item is still syncing. Please try again.');
        for (let count = 0; count < quantity; count += 1) {
          await decrementCartItem(item.serverCartItemId, authToken);
        }
      }
      mutationVersionRef.current += 1;
      setState(emptyState);
    } catch (error) {
      await refresh().catch(() => undefined);
      throw error;
    }
  }, [authToken, refresh, state.itemsById, state.quantities]);

  const items = useMemo(() => Object.values(state.itemsById), [state.itemsById]);

  return { ...state, add, clear, decrement, items, refresh };
}
