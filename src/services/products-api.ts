import { getCategoryImageUrl } from './categories-api';
import { apiRequest, ApiClientError } from './api-client';
import { apiEndpoints } from './api-endpoints';
import { cleanString, cleanStringArray, finiteNumber, isRecord } from './normalization-utils';

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

function normalizeProduct(value: unknown): ApiProduct | null {
  if (!isRecord(value)) return null;
  const id = cleanString(value._id);
  const name = cleanString(value.name);
  const basePrice = finiteNumber(value.basePrice);
  if (!id || !name || basePrice == null) return null;
  const rating = isRecord(value.rating)
    ? { average: finiteNumber(value.rating.average), count: finiteNumber(value.rating.count) }
    : undefined;
  const variants: ApiProductVariant[] = Array.isArray(value.variants) ? value.variants.flatMap((variant) => {
    if (!isRecord(variant)) return [];
    const label = cleanString(variant.label);
    const price = finiteNumber(variant.price);
    if (!label || price == null) return [];
    return [{ label, price: Math.max(0, price), key: cleanString(variant.key), image: cleanString(variant.image) }];
  }) : [];
  return {
    _id: id,
    name,
    basePrice: Math.max(0, basePrice),
    description: cleanString(value.description),
    shortDescription: cleanString(value.shortDescription),
    durationMinutes: finiteNumber(value.durationMinutes),
    mainImage: cleanString(value.mainImage),
    images: cleanStringArray(value.images),
    includes: cleanStringArray(value.includes),
    maxQuantity: finiteNumber(value.maxQuantity),
    rating: rating && (rating.average != null || rating.count != null) ? rating : undefined,
    slug: cleanString(value.slug),
    status: cleanString(value.status),
    variantLabel: cleanString(value.variantLabel),
    variants: variants.length ? variants : undefined,
  };
}

function normalizeProductCategory(value: unknown): ApiProductCategory | null {
  if (!isRecord(value)) return null;
  const id = cleanString(value._id);
  const name = cleanString(value.name);
  if (!id || !name) return null;
  return {
    _id: id,
    name,
    category_image: cleanString(value.category_image),
    products: Array.isArray(value.products) ? value.products.flatMap((product) => normalizeProduct(product) ?? []) : [],
  };
}

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
  const category = isRecord(result.category) ? {
    _id: cleanString(result.category._id),
    name: cleanString(result.category.name),
    category_image: cleanString(result.category.category_image),
  } : undefined;
  if (!payload.success || !category?._id || !category.name || !Array.isArray(result.product_details)) {
    throw new ApiClientError(payload.message || 'The products response is invalid. Please try again.', 200, 'INVALID_RESPONSE');
  }
  return {
    category: { _id: category._id, name: category.name, category_image: category.category_image },
    productDetails: result.product_details.flatMap((section) => normalizeProductCategory(section) ?? []),
  };
}
