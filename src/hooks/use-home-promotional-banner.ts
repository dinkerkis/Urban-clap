import { useEffect, useState } from 'react';

import { fetchHomePromotionalBanner, type HomePromotionalBannerData } from '../services/home-promotional-banner-api';

let cachedBanner: HomePromotionalBannerData | null = null;

export function useHomePromotionalBanner() {
  const [data, setData] = useState<HomePromotionalBannerData | null>(cachedBanner);

  useEffect(() => {
    if (cachedBanner) return;
    const controller = new AbortController();
    void fetchHomePromotionalBanner(controller.signal)
      .then((result) => {
        cachedBanner = result;
        setData(result);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return data;
}
