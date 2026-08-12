import { useCallback, useEffect, useState } from 'react';

import type { ServiceItem } from '../data/service-catalog';
import { fetchProductsWithCategory, resolveProductCategoryImage, resolveProductImage } from '../services/products-api';

export type ProductSection = {
  id: string;
  imageUrl?: string;
  products: ServiceItem[];
  title: string;
};

type ProductsState = {
  errorMessage: string;
  isLoading: boolean;
  sections: ProductSection[];
};

function formatDuration(minutes?: number): string {
  if (!minutes) return 'Duration on request';
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

function formatReviewCount(count?: number): string {
  if (!count) return 'New';
  if (count >= 1000) return `${Number((count / 1000).toFixed(1))}k`;
  return String(count);
}

export function useCategoryProducts(categoryId: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<ProductsState>({ errorMessage: '', isLoading: true, sections: [] });

  useEffect(() => {
    const controller = new AbortController();
    setState({ errorMessage: '', isLoading: true, sections: [] });

    void fetchProductsWithCategory(categoryId, controller.signal)
      .then(({ productDetails }) => {
        const sections = productDetails.map((section, sectionIndex) => ({
          id: section._id,
          title: section.name,
          imageUrl: resolveProductCategoryImage(section.category_image),
          products: section.products.map((product, productIndex) => ({
            id: product._id,
            title: product.name,
            description: product.shortDescription || product.description || 'Professional service at your doorstep',
            fullDescription: product.description,
            price: product.basePrice,
            originalPrice: product.basePrice,
            duration: formatDuration(product.durationMinutes),
            rating: product.rating?.average ?? 0,
            reviews: formatReviewCount(product.rating?.count),
            icon: '',
            tint: ['#FFF0EA', '#F1F2FF', '#E9F8F1'][productIndex % 3],
            imageUrl: resolveProductImage(product.mainImage),
            includes: product.includes,
            images: Array.from(
              new Set(
                [product.mainImage, ...(product.images ?? [])]
                  .map((image) => resolveProductImage(image))
                  .filter((image): image is string => Boolean(image)),
              ),
            ),
            maxQuantity: product.maxQuantity,
            slug: product.slug,
            status: product.status,
            variants: product.variants?.map((variant) => ({
              key: variant.key,
              label: variant.label,
              price: variant.price,
              imageUrl: resolveProductImage(variant.image),
            })),
            variantLabel: product.variantLabel,
          })),
        }));

        setState({ errorMessage: '', isLoading: false, sections });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          errorMessage: error instanceof Error ? error.message : 'Unable to load products. Please try again.',
          isLoading: false,
          sections: [],
        });
      });

    return () => controller.abort();
  }, [categoryId, requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);

  return { ...state, retry };
}
