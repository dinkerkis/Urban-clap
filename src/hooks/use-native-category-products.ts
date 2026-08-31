import { useCallback, useEffect, useState } from 'react';

import { fetchNativeProductsByCategory, type NativeCategoryProductsData } from '../services/native-products-api';

export function useNativeCategoryProducts(categoryId?: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [data, setData] = useState<NativeCategoryProductsData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(categoryId));

  useEffect(() => {
    if (!categoryId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setData(null);
    setErrorMessage('');
    setIsLoading(true);
    void fetchNativeProductsByCategory(categoryId, controller.signal)
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this Native category. Please try again.');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [categoryId, requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);
  return { data, errorMessage, isLoading, retry };
}
