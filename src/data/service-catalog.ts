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
  selectedVariantLabel?: string;
  slug?: string;
  status?: string;
  variantLabel?: string;
  variants?: Array<{ imageUrl?: string; key?: string; label: string; price: number }>;
};

export type ServiceSubcategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
  imageUrl?: string;
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

const CATEGORY_TINTS = ['#E9F8F1', '#EBF3FF', '#FFF0EA', '#F1F2FF', '#FFF8DE', '#EAF7FB'];

export function mapApiCategories(categories: ApiCategory[]): ServiceCategory[] {
  return categories.map((category, categoryIndex) => ({
    id: category._id,
    title: category.name,
    subtitle: category.description ?? '',
    icon: '',
    tint: CATEGORY_TINTS[categoryIndex % CATEGORY_TINTS.length],
    imageUrl: getCategoryImageUrl(category.category_image),
    subcategories: (category.children ?? []).map((subcategory, subcategoryIndex) => ({
      id: subcategory._id,
      title: subcategory.name,
      subtitle: subcategory.description ?? '',
      icon: '',
      tint: CATEGORY_TINTS[(categoryIndex + subcategoryIndex + 1) % CATEGORY_TINTS.length],
      imageUrl: getCategoryImageUrl(subcategory.category_image),
      services: [],
    })),
  }));
}
