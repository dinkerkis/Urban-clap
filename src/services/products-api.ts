import { fetch } from 'expo/fetch';

import { getCategoryImageUrl } from './categories-api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 15_000;

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to your .env file.');
}

export type ApiProductVariant = {
  image?: string;
  key?: string;
  label: string;
  price: number;
};

export type ApiProduct = {
  _id: string;
  basePrice: number;
  description?: string;
  durationMinutes?: number;
  images?: string[];
  includes?: string[];
  mainImage?: string;
  maxQuantity?: number;
  name: string;
  rating?: {
    average?: number;
    count?: number;
  };
  shortDescription?: string;
  slug?: string;
  status?: string;
  variants?: ApiProductVariant[];
  variantLabel?: string;
};

export type ApiProductCategory = {
  _id: string;
  category_image?: string;
  name: string;
  products: ApiProduct[];
};

export type ProductsWithCategoryData = {
  category: {
    _id: string;
    category_image?: string;
    name: string;
  };
  productDetails: ApiProductCategory[];
};

type ProductsWithCategoryResponse = {
  category?: ProductsWithCategoryData['category'];
  code?: number;
  data?: {
    category: ProductsWithCategoryData['category'];
    product_details: ApiProductCategory[];
  };
  message?: string;
  product_details?: ApiProductCategory[];
  success: boolean;
};

export class ProductsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ProductsApiError';
  }
}

export function resolveProductCategoryImage(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.includes('/')) return getCategoryImageUrl(path);
  return getCategoryImageUrl(`uploads/categories/${path}`);
}

export function resolveProductImage(path?: string): string | undefined {
  return getCategoryImageUrl(path);
}

export async function fetchProductsWithCategory(categoryId: string, signal?: AbortSignal): Promise<ProductsWithCategoryData> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => timeoutController.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  const path = `/products-with-category/${encodeURIComponent(categoryId)}`;

  try {
    if (__DEV__) console.log(`[Products API] Request\nGET ${API_BASE_URL}${path}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: timeoutController.signal,
    });
    const payload = (await response.json().catch(() => null)) as ProductsWithCategoryResponse | null;

    if (__DEV__) {
      console.log(
        `[Products API] Response\nStatus: ${response.status}\n${JSON.stringify(payload, null, 2)}`,
      );
    }

    const result = payload?.data ?? payload;

    if (!response.ok || !payload?.success || !result?.category || !Array.isArray(result.product_details)) {
      throw new ProductsApiError(payload?.message || 'Unable to load products. Please try again.', response.status);
    }

    return { category: result.category, productDetails: result.product_details };
  } catch (error) {
    if (error instanceof ProductsApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new ProductsApiError('The products request timed out. Please try again.', 408);
    }
    throw new ProductsApiError('Unable to load products. Check your internet connection and try again.', 0);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}
