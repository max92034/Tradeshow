import { useCallback } from 'react';
import { useSearchStore } from '../store/useSearchStore';
import { useDeepgramVoiceSearch } from './useDeepgramVoiceSearch';

/**
 * Voice search wired to the search store: recognized text becomes the
 * query and immediately triggers a search. Used by SearchHeader and
 * VoiceSearchButton; BuyerInfoForm uses useDeepgramVoiceSearch directly
 * because it fills a form field instead of searching.
 */
export function useVoiceSearchToQuery() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);

  return useDeepgramVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });
}
