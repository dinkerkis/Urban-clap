import { getCategoryImageUrl } from './categories-api';
import { apiRequest, ApiClientError } from './api-client';
import { apiEndpoints } from './api-endpoints';

export type ApiProductVariant = {
  image?: string | null;
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

export function resolveProductCategoryImage(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.includes('/')) return getCategoryImageUrl(path);
  return getCategoryImageUrl(`uploads/categories/${path}`);
}

export function resolveProductImage(path?: string | null): string | undefined {
  return getCategoryImageUrl(path ?? undefined);
}

export async function fetchProductsWithCategory(categoryId: string, signal?: AbortSignal): Promise<ProductsWithCategoryData> {
  const path = apiEndpoints.categories.products(categoryId);
  const payload = await apiRequest<ProductsWithCategoryResponse>(path, {
    logScope: 'Products API',
    signal,
    defaultErrorMessage: 'Unable to load products. Please try again.',
  });
  const result = payload.data ?? payload;
  if (!payload.success || !result.category || !Array.isArray(result.product_details)) {
    throw new ApiClientError(payload.message || 'The products response is invalid. Please try again.', 200, 'INVALID_RESPONSE');
  }
  return { category: result.category, productDetails: result.product_details };
}
