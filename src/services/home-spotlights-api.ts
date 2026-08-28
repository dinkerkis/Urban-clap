import { apiRequest, getApiAssetUrl, requireApiData, type ApiResponse } from './api-client';
import { apiEndpoints } from './api-endpoints';

export type SpotlightRedirectType = 'native' | 'service';

export type HomeSpotlight = {
  imageUrl: string;
  redirectId: string;
  redirectType: SpotlightRedirectType;
  sortOrder: number;
};

export type HomeSpotlightsData = {
  sectionTitle: string;
  spotlightContent: HomeSpotlight[];
};

type HomeSpotlightsPayload = {
  sectionTitle?: unknown;
  spotlightContent?: unknown;
};

function isSpotlightRedirectType(value: unknown): value is SpotlightRedirectType {
  return value === 'native' || value === 'service';
}

function parseSpotlight(value: unknown): HomeSpotlight | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.image !== 'string' ||
    typeof item.redirectId !== 'string' ||
    typeof item.sortOrder !== 'number' ||
    !isSpotlightRedirectType(item.redirectType)
  ) return null;

  const imageUrl = getApiAssetUrl(item.image);
  if (!imageUrl) return null;
  return {
    imageUrl,
    redirectId: item.redirectId,
    redirectType: item.redirectType,
    sortOrder: item.sortOrder,
  };
}

export async function fetchHomeSpotlights(signal?: AbortSignal): Promise<HomeSpotlightsData> {
  const response = await apiRequest<ApiResponse<HomeSpotlightsPayload>>(apiEndpoints.home.spotlights, {
    defaultErrorMessage: 'Unable to load spotlight offers. Please try again.',
    logScope: 'Home Spotlights API',
    signal,
  });
  const data = requireApiData(response);
  const spotlightContent = Array.isArray(data.spotlightContent)
    ? data.spotlightContent.map(parseSpotlight).filter((item): item is HomeSpotlight => item != null).sort((left, right) => left.sortOrder - right.sortOrder)
    : [];

  return {
    sectionTitle: typeof data.sectionTitle === 'string' && data.sectionTitle.trim() ? data.sectionTitle : 'In the spotlight',
    spotlightContent,
  };
}
