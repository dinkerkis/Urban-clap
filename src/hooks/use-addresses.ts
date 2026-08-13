import { useCallback, useEffect, useState } from 'react';

import { fetchAddresses, type UserAddress } from '../services/address-api';

type AddressesState = {
  addresses: UserAddress[];
  errorMessage: string;
  isLoading: boolean;
};

export function useAddresses(token?: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<AddressesState>({
    addresses: [],
    errorMessage: '',
    isLoading: Boolean(token),
  });

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);

  useEffect(() => {
    if (!token) {
      setState({ addresses: [], errorMessage: '', isLoading: false });
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, errorMessage: '', isLoading: true }));

    void fetchAddresses(token, controller.signal)
      .then((addresses) => {
        setState({ addresses, errorMessage: '', isLoading: false });
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState({
          addresses: [],
          errorMessage: error instanceof Error ? error.message : 'Unable to load saved addresses. Please try again.',
          isLoading: false,
        });
      });

    return () => controller.abort();
  }, [requestKey, token]);

  return { ...state, retry };
}
