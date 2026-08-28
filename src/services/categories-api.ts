import { apiRequest, ApiClientError, getApiAssetUrl } from './api-client';
import { apiEndpoints } from './api-endpoints';

export type ApiCategory = {
  _id: string;
  category_image?: string;
  children?: ApiCategory[];
  description?: string;
  level: number;
  name: string;
};

type CategoriesResponse = {
  data: ApiCategory[];
  message?: string;
  success: boolean;
};

export function getCategoryImageUrl(path?: string): string | undefined {
  return getApiAssetUrl(path);
}

export async function fetchCategories(signal?: AbortSignal): Promise<ApiCategory[]> {
  const payload = await apiRequest<CategoriesResponse>(apiEndpoints.categories.list, {
    logScope: 'Categories API',
    signal,
    defaultErrorMessage: 'Unable to load categories. Please try again.',
  });
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new ApiClientError(payload.message || 'The categories response is invalid. Please try again.', 200, 'INVALID_RESPONSE');
  }
  return payload.data;
}
