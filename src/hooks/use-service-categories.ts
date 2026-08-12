import { useCallback, useEffect, useState } from 'react';

import { mapApiCategories, type ServiceCategory } from '../data/service-catalog';
import { fetchCategories } from '../services/categories-api';

type CategoriesState = {
  categories: ServiceCategory[];
  errorMessage: string;
  isLoading: boolean;
};

export function useServiceCategories() {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<CategoriesState>({ categories: [], errorMessage: '', isLoading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, errorMessage: '', isLoading: true }));

    void fetchCategories(controller.signal)
      .then((categories) => {
        setState({ categories: mapApiCategories(categories), errorMessage: '', isLoading: false });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          categories: [],
          errorMessage: error instanceof Error ? error.message : 'Unable to load categories. Please try again.',
          isLoading: false,
        });
      });

    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setRequestKey((current) => current + 1), []);

  return { ...state, retry };
}
