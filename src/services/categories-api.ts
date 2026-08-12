import { fetch } from 'expo/fetch';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 15_000;

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to your .env file.');
}

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

export class CategoriesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'CategoriesApiError';
  }
}

export function getCategoryImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}/${path.replace(/^\//, '')}`;
}

export async function fetchCategories(signal?: AbortSignal): Promise<ApiCategory[]> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => timeoutController.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    if (__DEV__) console.log(`[Categories API] Request\nGET ${API_BASE_URL}/categories`);

    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: { Accept: 'application/json' },
      signal: timeoutController.signal,
    });
    const payload = (await response.json().catch(() => null)) as CategoriesResponse | null;

    if (__DEV__) {
      console.log(
        `[Categories API] Response\nStatus: ${response.status}\n${JSON.stringify(payload, null, 2)}`,
      );
    }

    if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
      throw new CategoriesApiError(payload?.message || 'Unable to load categories. Please try again.', response.status);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof CategoriesApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new CategoriesApiError('The categories request timed out. Please try again.', 408);
    }
    throw new CategoriesApiError('Unable to load categories. Check your internet connection and try again.', 0);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}
