import { apiRequest, getApiAssetUrl, requireApiData, type ApiResponse } from './api-client';

export type BannerHeadingGradient = {
  direction: string;
  endColor: string;
  startColor: string;
};

export type BannerHeadingColor =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradient: BannerHeadingGradient };

export type PromotionalBannerSlide = {
  actionText?: string;
  imageUrl: string;
  label?: string;
  mainHeading: string;
  mainHeadingColor?: BannerHeadingColor;
  showActionArrow: boolean;
  textColor: string;
};

export type HomePromotionalBannerData = {
  backgroundImageUrl?: string;
  slides: PromotionalBannerSlide[];
};

type PromotionalBannerPayload = {
  backgroundImage?: unknown;
  sliderContent?: unknown;
};

function parseHeadingColor(value: unknown): BannerHeadingColor | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;

  if (item.type === 'solid' && typeof item.color === 'string' && item.color.trim()) {
    return { type: 'solid', color: item.color };
  }

  if (item.type === 'gradient' && item.gradient && typeof item.gradient === 'object') {
    const gradient = item.gradient as Record<string, unknown>;
    if (
      typeof gradient.startColor === 'string' &&
      typeof gradient.endColor === 'string' &&
      gradient.startColor.trim() &&
      gradient.endColor.trim()
    ) {
      return {
        type: 'gradient',
        gradient: {
          startColor: gradient.startColor,
          endColor: gradient.endColor,
          direction: typeof gradient.direction === 'string' ? gradient.direction : '90deg',
        },
      };
    }
  }

  return undefined;
}

function parseSlide(value: unknown): PromotionalBannerSlide | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.image !== 'string' || typeof item.mainHeading !== 'string' || !item.mainHeading.trim()) return null;

  const imageUrl = getApiAssetUrl(item.image);
  if (!imageUrl) return null;

  return {
    imageUrl,
    mainHeading: item.mainHeading.trim(),
    label: typeof item.label === 'string' && item.label.trim() ? item.label.trim() : undefined,
    actionText: typeof item.actionText === 'string' && item.actionText.trim() ? item.actionText.trim() : undefined,
    showActionArrow: item.showActionArrow !== false,
    textColor: typeof item.textColor === 'string' && item.textColor.trim() ? item.textColor : '#FFFFFF',
    mainHeadingColor: parseHeadingColor(item.mainHeadingColor),
  };
}

export async function fetchHomePromotionalBanner(signal?: AbortSignal): Promise<HomePromotionalBannerData> {
  const response = await apiRequest<ApiResponse<PromotionalBannerPayload>>('/mobile/home/promotional-banner', {
    defaultErrorMessage: 'Unable to load promotional banner. Please try again.',
    logScope: 'Home Promotional Banner API',
    signal,
  });
  const data = requireApiData(response);
  const slides = Array.isArray(data.sliderContent)
    ? data.sliderContent.map(parseSlide).filter((item): item is PromotionalBannerSlide => item != null)
    : [];

  return {
    backgroundImageUrl:
      typeof data.backgroundImage === 'string' && data.backgroundImage.trim()
        ? getApiAssetUrl(data.backgroundImage.trim())
        : undefined,
    slides,
  };
}
