import { useCallback, useEffect, useState } from 'react';

import { fetchNativeProductDetail, type NativeProductDetail } from '../services/native-products-api';

export function useNativeProductDetail(productId?: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [data, setData] = useState<NativeProductDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setData(null);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setData(null);
    setErrorMessage('');
    setIsLoading(true);
    void fetchNativeProductDetail(productId, controller.signal)
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this Native product. Please try again.');
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [productId, requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);
  return { data, errorMessage, isLoading, retry };
}
