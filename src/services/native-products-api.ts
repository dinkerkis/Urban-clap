import { apiRequest, getApiAssetUrl, requireApiData, type ApiResponse } from './api-client';

export type NativeDescriptionImage = {
  sort_order: number;
  type: 'image';
  url: string;
};

export type NativeDescriptionSlider = {
  slider_images: string[];
  slider_title?: string;
  sort_order: number;
  type: 'slider';
};

export type NativeDescriptionMedia = NativeDescriptionImage | NativeDescriptionSlider;

export type NativeProduct = {
  _id: string;
  base_price: number;
  main_image?: string;
  options_count?: number;
  product_name: string;
  rating?: { average?: number; count?: number };
};

export type NativeProductCategory = {
  _id: string;
  category_image?: string;
  name: string;
};

export type NativeProductSection = {
  description?: string;
  products: NativeProduct[];
  title: string;
};

export type NativeProductsData = {
  categories: NativeProductCategory[];
  categorySections: NativeProductSection[];
  newlyLaunched?: NativeProductSection;
};

type NativeDescriptionData = {
  _id?: string;
  descriptionMedia?: unknown[];
};

function isDescriptionMedia(value: unknown): value is NativeDescriptionMedia {
  if (!value || typeof value !== 'object') return false;
  const media = value as Record<string, unknown>;
  if (typeof media.sort_order !== 'number') return false;
  if (media.type === 'image') return typeof media.url === 'string' && media.url.length > 0;
  return media.type === 'slider' && Array.isArray(media.slider_images) && media.slider_images.every((image) => typeof image === 'string');
}

export async function fetchNativeDescription(signal?: AbortSignal): Promise<NativeDescriptionMedia[]> {
  const response = await apiRequest<ApiResponse<NativeDescriptionData>>('/native-products/description/mobile', {
    defaultErrorMessage: 'Unable to load Native product details. Please try again.',
    logScope: 'Native Description API',
    signal,
  });
  if (__DEV__) {
    console.log(`[Native Description API] Parsed Response\n${JSON.stringify(response, null, 2)}`);
  }
  const data = requireApiData(response);
  return (data.descriptionMedia ?? []).filter(isDescriptionMedia).sort((left, right) => left.sort_order - right.sort_order);
}

type NativeProductsPayload = Record<string, unknown> & { categories?: NativeProductCategory[]; newly_launched?: NativeProductSection };

export async function fetchNativeProducts(signal?: AbortSignal): Promise<NativeProductsData> {
  const response = await apiRequest<ApiResponse<NativeProductsPayload>>('/native-products/mobile', {
    defaultErrorMessage: 'Unable to load Native products. Please try again.',
    logScope: 'Native Products API',
    signal,
  });
  const data = requireApiData(response);
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const categorySections = categories.flatMap((category) => {
    const section = data[category.name];
    if (!section || typeof section !== 'object') return [];
    const candidate = section as Partial<NativeProductSection>;
    if (typeof candidate.title !== 'string' || !Array.isArray(candidate.products)) return [];
    return [{ title: candidate.title, description: typeof candidate.description === 'string' ? candidate.description : undefined, products: candidate.products }];
  });
  return {
    categories,
    categorySections,
    newlyLaunched: data.newly_launched && Array.isArray(data.newly_launched.products) ? data.newly_launched : undefined,
  };
}

export function resolveNativeMediaUrl(path: string): string {
  return getApiAssetUrl(path) ?? path;
}
