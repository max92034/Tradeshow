import { create } from 'zustand';
import { Product } from '../types';
import { useProductStore } from './useProductStore';

interface SearchState {
  query: string;
  results: Product[];
  setQuery: (query: string) => void;
  performSearch: (query: string) => void;
}

let lastQuery = '';
let lastResults: Product[] = [];

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  
  setQuery: (query: string) => {
    set({ query });
  },
  
  performSearch: (query: string) => {
    const { products } = useProductStore.getState();
    const q = query.toLowerCase().trim();
    
    if (q === lastQuery) {
      set({ query, results: lastResults });
      return;
    }
    
    let results: Product[];
    
    if (!q) {
      results = products;
    } else {
      results = products.filter(product => {
        const skuMatch = product.sku.toLowerCase().includes(q);
        const descMatch = product.description.toLowerCase().includes(q);
        const keywordMatch = product.keyword.toLowerCase().includes(q);
        const locationMatch = product.location.toLowerCase().includes(q);
        return skuMatch || descMatch || keywordMatch || locationMatch;
      });
    }
    
    lastQuery = q;
    lastResults = results;
    
    set({ query, results });
  },
}));
