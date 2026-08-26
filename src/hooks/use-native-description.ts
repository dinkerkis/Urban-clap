import { useCallback, useEffect, useState } from 'react';

import { fetchNativeDescription, type NativeDescriptionMedia } from '../services/native-products-api';

let cachedNativeDescription: NativeDescriptionMedia[] | null = null;

export function useNativeDescription() {
  const [requestKey, setRequestKey] = useState(0);
  const [media, setMedia] = useState<NativeDescriptionMedia[]>(() => cachedNativeDescription ?? []);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(() => cachedNativeDescription == null);

  useEffect(() => {
    if (requestKey === 0 && cachedNativeDescription) {
      setMedia(cachedNativeDescription);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setErrorMessage('');
    setIsLoading(true);

    void fetchNativeDescription(controller.signal)
      .then((items) => {
        cachedNativeDescription = items;
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
