import { useCallback, useEffect, useState } from 'react';

import { fetchNativeProducts, type NativeProductsData } from '../services/native-products-api';

let cachedNativeProducts: NativeProductsData | null = null;

export function useNativeProducts() {
  const [requestKey, setRequestKey] = useState(0);
  const [data, setData] = useState<NativeProductsData>(() => cachedNativeProducts ?? { categories: [], categorySections: [] });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(() => cachedNativeProducts == null);

  useEffect(() => {
    if (requestKey === 0 && cachedNativeProducts) {
      setData(cachedNativeProducts);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setErrorMessage('');
    setIsLoading(true);
    void fetchNativeProducts(controller.signal)
      .then((result) => { cachedNativeProducts = result; setData(result); setIsLoading(false); })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load Native products. Please try again.');
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);
  return { data, errorMessage, isLoading, retry };
}
