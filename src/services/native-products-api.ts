import { apiRequest, getApiAssetUrl, requireApiData, type ApiResponse } from './api-client';
import { apiEndpoints } from './api-endpoints';

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

export type NativeProductRating = { average?: number; count?: number };

export type NativeProductOption = {
  image?: string;
  key?: string;
  label: string;
  price: number;
  rating?: NativeProductRating;
};

export type NativeProductMediaItem = {
  sort_order: number;
  type: 'image' | 'video';
  url: string;
};

export type NativeProductSliderItem = {
  slider_images: string[];
  slider_title?: string;
  sort_order: number;
  type: 'slider';
};

export type NativeProductDetailMedia = NativeProductMediaItem | NativeProductSliderItem;

export type NativeProductDetail = NativeProduct & {
  banner_gallery: NativeProductMediaItem[];
  exchange_steps: unknown[];
  options: NativeProductOption[];
  product_details: NativeProductDetailMedia[];
  product_specification?: {
    full_desc_content?: { image: string; sort_order: number }[];
    short_desc_image?: string;
  };
  slug?: string;
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

export type NativeCategorySliderImage = {
  image: string;
  relatedImages?: string[];
  sortOrder?: number;
};

export type NativeCategorySliderVideo = {
  relatedVideos?: string[];
  sortOrder?: number;
  video: string;
};

export type NativeCategoryDetailSection = {
  relatedImages?: string[];
  slider_description?: string;
  slider_images?: string[];
  slider_title?: string;
  sliderImageDetails?: NativeCategorySliderImage[];
  slider_videos?: NativeCategorySliderVideo[];
  sort_order: number;
  type: 'image' | 'slider';
  url?: string;
};

export type NativeCategoryProductsData = {
  bannerImage?: string;
  categoryDetails: NativeCategoryDetailSection[];
  marqueeContent: string[];
  products: NativeProduct[];
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
  const response = await apiRequest<ApiResponse<NativeDescriptionData>>(apiEndpoints.nativeProducts.description, {
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
  const response = await apiRequest<ApiResponse<NativeProductsPayload>>(apiEndpoints.nativeProducts.list, {
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

export async function fetchNativeProductsByCategory(categoryId: string, signal?: AbortSignal): Promise<NativeCategoryProductsData> {
  const response = await apiRequest<ApiResponse<Record<string, unknown>>>(apiEndpoints.nativeProducts.byCategory(categoryId), {
    defaultErrorMessage: 'Unable to load this Native category. Please try again.',
    logScope: 'Native Category Products API',
    signal,
  });
  const data = requireApiData(response);
  const details = Array.isArray(data.category_details)
    ? data.category_details
        .filter((item): item is NativeCategoryDetailSection => {
          if (!item || typeof item !== 'object') return false;
          const section = item as Partial<NativeCategoryDetailSection>;
          return (section.type === 'image' || section.type === 'slider') && typeof section.sort_order === 'number';
        })
        .sort((left, right) => left.sort_order - right.sort_order)
    : [];

  return {
    bannerImage: typeof data.bannerImage === 'string' ? data.bannerImage : undefined,
    marqueeContent: Array.isArray(data.marqueeContent) ? data.marqueeContent.filter((item): item is string => typeof item === 'string') : [],
    categoryDetails: details,
    products: Array.isArray(data.products) ? (data.products as NativeProduct[]) : [],
  };
}

export async function fetchNativeProductDetail(productId: string, signal?: AbortSignal): Promise<NativeProductDetail> {
  const response = await apiRequest<ApiResponse<NativeProductDetail>>(apiEndpoints.nativeProducts.detail(productId), {
    defaultErrorMessage: 'Unable to load this Native product. Please try again.',
    logScope: 'Native Product Detail API',
    signal,
  });
  const data = requireApiData(response);
  return {
    ...data,
    banner_gallery: Array.isArray(data.banner_gallery) ? [...data.banner_gallery].sort((left, right) => left.sort_order - right.sort_order) : [],
    exchange_steps: Array.isArray(data.exchange_steps) ? data.exchange_steps : [],
    options: Array.isArray(data.options) ? data.options : [],
    product_details: Array.isArray(data.product_details) ? [...data.product_details].sort((left, right) => left.sort_order - right.sort_order) : [],
  };
}

export function resolveNativeMediaUrl(path: string): string {
  return getApiAssetUrl(path) ?? path;
}
