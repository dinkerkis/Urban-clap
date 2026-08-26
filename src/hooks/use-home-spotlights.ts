import { useEffect, useState } from 'react';

import { fetchHomeSpotlights, type HomeSpotlightsData } from '../services/home-spotlights-api';

let cachedSpotlights: HomeSpotlightsData | null = null;

export function useHomeSpotlights() {
  const [data, setData] = useState<HomeSpotlightsData | null>(cachedSpotlights);

  useEffect(() => {
    if (cachedSpotlights) return;
    const controller = new AbortController();
    void fetchHomeSpotlights(controller.signal)
      .then((result) => {
        cachedSpotlights = result;
        setData(result);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return data;
}
