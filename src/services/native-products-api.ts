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
  _id?: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned || undefined;
}

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.flatMap((item) => cleanString(item) ?? []) : [];
}

function normalizeRating(value: unknown): NativeProductRating | undefined {
  if (!isRecord(value)) return undefined;
  const average = finiteNumber(value.average);
  const count = Math.max(0, finiteNumber(value.count));
  return average || count ? { average, count } : undefined;
}

function normalizeProduct(value: unknown): NativeProduct | null {
  if (!isRecord(value)) return null;
  const id = cleanString(value._id);
  const name = cleanString(value.product_name);
  if (!id || !name) return null;
  return {
    _id: id,
    product_name: name,
    base_price: Math.max(0, finiteNumber(value.base_price)),
    main_image: cleanString(value.main_image),
    options_count: typeof value.options_count === 'number' && Number.isFinite(value.options_count) ? Math.max(0, value.options_count) : undefined,
    rating: normalizeRating(value.rating),
  };
}

function normalizeProducts(value: unknown): NativeProduct[] {
  return Array.isArray(value) ? value.flatMap((item) => normalizeProduct(item) ?? []) : [];
}

function normalizeDescriptionMedia(value: unknown, index: number): NativeDescriptionMedia | null {
  if (!isRecord(value)) return null;
  const sortOrder = finiteNumber(value.sort_order, index);
  if (value.type === 'image') {
    const url = cleanString(value.url);
    return url ? { type: 'image', sort_order: sortOrder, url } : null;
  }
  if (value.type !== 'slider') return null;
  const images = stringArray(value.slider_images);
  if (!images.length) return null;
  return { type: 'slider', sort_order: sortOrder, slider_images: images, slider_title: cleanString(value.slider_title) };
}

function normalizeCategoryDetail(value: unknown, index: number): NativeCategoryDetailSection | null {
  if (!isRecord(value)) return null;
  const sortOrder = finiteNumber(value.sort_order, index);
  if (value.type === 'image') {
    const url = cleanString(value.url);
    return url ? { type: 'image', sort_order: sortOrder, url, relatedImages: stringArray(value.relatedImages) } : null;
  }
  if (value.type !== 'slider') return null;
  const sliderImageDetails: NativeCategorySliderImage[] = Array.isArray(value.sliderImageDetails)
    ? value.sliderImageDetails.flatMap((item, itemIndex) => {
        if (!isRecord(item)) return [];
        const image = cleanString(item.image);
        return image ? [{ image, sortOrder: finiteNumber(item.sortOrder, itemIndex), relatedImages: stringArray(item.relatedImages) }] : [];
      })
    : [];
  const sliderVideos: NativeCategorySliderVideo[] = Array.isArray(value.slider_videos)
    ? value.slider_videos.flatMap((item, itemIndex) => {
        if (!isRecord(item)) return [];
        const video = cleanString(item.video);
        return video ? [{ video, sortOrder: finiteNumber(item.sortOrder, itemIndex), relatedVideos: stringArray(item.relatedVideos) }] : [];
      })
    : [];
  const sliderImages = stringArray(value.slider_images);
  if (!sliderImageDetails.length && !sliderImages.length && !sliderVideos.length) return null;
  return {
    type: 'slider',
    sort_order: sortOrder,
    slider_title: cleanString(value.slider_title),
    slider_description: cleanString(value.slider_description),
    slider_images: sliderImages,
    sliderImageDetails,
    slider_videos: sliderVideos,
  };
}

function normalizeProductMedia(value: unknown, index: number): NativeProductDetailMedia | null {
  if (!isRecord(value)) return null;
  const sortOrder = finiteNumber(value.sort_order, index);
  if (value.type === 'image' || value.type === 'video') {
    const url = cleanString(value.url);
    return url ? { type: value.type, sort_order: sortOrder, url } : null;
  }
  if (value.type !== 'slider') return null;
  const images = stringArray(value.slider_images);
  if (!images.length) return null;
  return { type: 'slider', sort_order: sortOrder, slider_images: images, slider_title: cleanString(value.slider_title) };
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
  return (Array.isArray(data.descriptionMedia) ? data.descriptionMedia : [])
    .flatMap((item, index) => normalizeDescriptionMedia(item, index) ?? [])
    .sort((left, right) => left.sort_order - right.sort_order);
}

type NativeProductsPayload = Record<string, unknown> & { categories?: NativeProductCategory[]; newly_launched?: NativeProductSection };

export async function fetchNativeProducts(signal?: AbortSignal): Promise<NativeProductsData> {
  const response = await apiRequest<ApiResponse<NativeProductsPayload>>(apiEndpoints.nativeProducts.list, {
    defaultErrorMessage: 'Unable to load Native products. Please try again.',
    logScope: 'Native Products API',
    signal,
  });
  const data = requireApiData(response);
  const categories: NativeProductCategory[] = Array.isArray(data.categories)
    ? data.categories.flatMap((value) => {
        if (!isRecord(value)) return [];
        const id = cleanString(value._id);
        const name = cleanString(value.name);
        return id && name ? [{ _id: id, name, category_image: cleanString(value.category_image) }] : [];
      })
    : [];
  const categorySections = categories.flatMap((category) => {
    const section = data[category.name];
    if (!section || typeof section !== 'object') return [];
    const candidate = section as Partial<NativeProductSection>;
    const title = cleanString(candidate.title);
    const products = normalizeProducts(candidate.products);
    if (!title || !products.length) return [];
    return [{ title, description: cleanString(candidate.description), products }];
  });
  const newlyLaunched = isRecord(data.newly_launched) ? data.newly_launched : undefined;
  const newlyLaunchedTitle = cleanString(newlyLaunched?.title);
  const newlyLaunchedProducts = normalizeProducts(newlyLaunched?.products);
  return {
    categories,
    categorySections,
    newlyLaunched: newlyLaunchedTitle && newlyLaunchedProducts.length ? { title: newlyLaunchedTitle, description: cleanString(newlyLaunched?.description), products: newlyLaunchedProducts } : undefined,
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
        .flatMap((item, index) => normalizeCategoryDetail(item, index) ?? [])
        .sort((left, right) => left.sort_order - right.sort_order)
    : [];

  return {
    bannerImage: cleanString(data.bannerImage),
    marqueeContent: stringArray(data.marqueeContent),
    categoryDetails: details,
    products: normalizeProducts(data.products),
  };
}

export async function fetchNativeProductDetail(productId: string, signal?: AbortSignal): Promise<NativeProductDetail> {
  const response = await apiRequest<ApiResponse<NativeProductDetail>>(apiEndpoints.nativeProducts.detail(productId), {
    defaultErrorMessage: 'Unable to load this Native product. Please try again.',
    logScope: 'Native Product Detail API',
    signal,
  });
  const data = requireApiData(response) as unknown;
  if (!isRecord(data)) throw new Error('Native product details are unavailable.');
  const id = cleanString(data._id) ?? productId;
  const name = cleanString(data.product_name) ?? 'Native product';
  const options: NativeProductOption[] = Array.isArray(data.options)
    ? data.options.flatMap((value) => {
        if (!isRecord(value)) return [];
        const label = cleanString(value.label);
        const price = optionalFiniteNumber(value.price);
        if (!label || price == null) return [];
        return [{
          _id: cleanString(value._id),
          label,
          key: cleanString(value.key),
          image: cleanString(value.image),
          price: Math.max(0, price),
          rating: normalizeRating(value.rating),
        }];
      })
    : [];
  const fullDescription = isRecord(data.product_specification) && Array.isArray(data.product_specification.full_desc_content)
    ? data.product_specification.full_desc_content.flatMap((value, index) => {
        if (!isRecord(value)) return [];
        const image = cleanString(value.image);
        return image ? [{ image, sort_order: finiteNumber(value.sort_order, index) }] : [];
      })
    : [];
  return {
    _id: id,
    product_name: name,
    base_price: Math.max(0, finiteNumber(data.base_price)),
    main_image: cleanString(data.main_image),
    options_count: typeof data.options_count === 'number' && Number.isFinite(data.options_count) ? Math.max(0, data.options_count) : undefined,
    rating: normalizeRating(data.rating),
    slug: cleanString(data.slug),
    banner_gallery: Array.isArray(data.banner_gallery) ? data.banner_gallery.flatMap((value, index) => {
      const media = normalizeProductMedia(value, index);
      return media && media.type !== 'slider' ? [media] : [];
    }).sort((left, right) => left.sort_order - right.sort_order) : [],
    exchange_steps: Array.isArray(data.exchange_steps)
      ? data.exchange_steps.filter((value) => isRecord(value) || Boolean(cleanString(value)))
      : [],
    options,
    product_details: Array.isArray(data.product_details) ? data.product_details.flatMap((value, index) => normalizeProductMedia(value, index) ?? []).sort((left, right) => left.sort_order - right.sort_order) : [],
    product_specification: isRecord(data.product_specification) ? {
      short_desc_image: cleanString(data.product_specification.short_desc_image),
      full_desc_content: fullDescription.sort((left, right) => left.sort_order - right.sort_order),
    } : undefined,
  };
}

export function resolveNativeMediaUrl(path?: string | null): string {
  const cleaned = cleanString(path);
  if (!cleaned) return '';
  return getApiAssetUrl(cleaned) ?? cleaned;
}
