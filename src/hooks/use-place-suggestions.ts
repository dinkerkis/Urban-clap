import { useEffect, useRef, useState } from 'react';

import { getCachedLocation } from './use-current-location';
import { createPlacesSessionToken, fetchPlaceSuggestions, type PlaceSuggestion } from '../services/places-api';

export function usePlaceSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const sessionTokenRef = useRef(createPlacesSessionToken());

  useEffect(() => {
    const input = query.trim();
    if (input.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setErrorMessage('');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const coords = getCachedLocation()?.coords;
      setIsSearching(true);
      void fetchPlaceSuggestions(input, {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        sessionToken: sessionTokenRef.current,
        signal: controller.signal,
      })
        .then((results) => {
          setSuggestions(results);
          setErrorMessage('');
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setErrorMessage(error instanceof Error ? error.message : 'Unable to search locations right now.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const consumeSessionToken = () => {
    const token = sessionTokenRef.current;
    sessionTokenRef.current = createPlacesSessionToken();
    return token;
  };

  return { consumeSessionToken, errorMessage, isSearching, suggestions };
}
