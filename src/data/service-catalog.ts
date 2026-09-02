import { colors } from '../theme';
import { getCategoryImageUrl, type ApiCategory } from '../services/categories-api';

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviews: string;
  icon: string;
  tint: string;
  imageUrl?: string;
  images?: string[];
  includes?: string[];
  maxQuantity?: number;
  productId?: string;
  selectedVariantLabel?: string;
  serverCartItemId?: string;
  serverLineTotal?: number;
  cartCategoryId?: string;
  cartCategoryName?: string;
  cartCategoryTotal?: number;
  slug?: string;
  status?: string;
  productType?: 'NativeProduct';
  optionId?: string;
  variantLabel?: string;
  variantKey?: string;
  variants?: Array<{ hasImageField?: boolean; imageUrl?: string; key?: string; label: string; price: number }>;
};

export type ServiceSubcategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
  imageUrl?: string;
  children?: ServiceSubcategory[];
  services: ServiceItem[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
  imageUrl?: string;
  subcategories: ServiceSubcategory[];
};

const CATEGORY_TINTS = [colors.greenTone94, colors.blueTone96, colors.orangeTone96, colors.blueTone97_2, colors.yellowTone94, colors.cyanTone95];

function mapApiSubcategory(category: ApiCategory, tintIndex: number): ServiceSubcategory {
  return {
    id: category._id,
    title: category.name,
    subtitle: category.description ?? '',
    icon: '',
    tint: CATEGORY_TINTS[tintIndex % CATEGORY_TINTS.length],
    imageUrl: getCategoryImageUrl(category.category_image),
    children: (category.children ?? []).map((child, childIndex) => mapApiSubcategory(child, tintIndex + childIndex + 1)),
    services: [],
  };
}

export function mapApiCategories(categories: ApiCategory[]): ServiceCategory[] {
  return categories.map((category, categoryIndex) => ({
    id: category._id,
    title: category.name,
    subtitle: category.description ?? '',
    icon: '',
    tint: CATEGORY_TINTS[categoryIndex % CATEGORY_TINTS.length],
    imageUrl: getCategoryImageUrl(category.category_image),
    subcategories: (category.children ?? []).map((subcategory, subcategoryIndex) =>
      mapApiSubcategory(subcategory, categoryIndex + subcategoryIndex + 1),
    ),
  }));
}
