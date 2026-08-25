import { useCallback, useEffect, useState } from 'react';

import { fetchNativeDescription, type NativeDescriptionMedia } from '../services/native-products-api';

export function useNativeDescription() {
  const [requestKey, setRequestKey] = useState(0);
  const [media, setMedia] = useState<NativeDescriptionMedia[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setErrorMessage('');
    setIsLoading(true);

    void fetchNativeDescription(controller.signal)
      .then((items) => {
        setMedia(items);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load Native product details. Please try again.');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);
  return { errorMessage, isLoading, media, retry };
}
