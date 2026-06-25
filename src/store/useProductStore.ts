import { create } from 'zustand';
import { Product } from '../types';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { sampleProducts } from '../data/sampleProducts';

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  loadProducts: (products: Product[]) => void;
  clearProducts: () => void;
  getProductBySku: (sku: string) => Product | undefined;
  loadSampleData: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoaded: false,
  
  loadProducts: (products: Product[]) => {
    set({ products, isLoaded: true });
    saveToStorage(storageKeys.PRODUCTS, products);
  },
  
  clearProducts: () => {
    set({ products: [], isLoaded: false });
    saveToStorage(storageKeys.PRODUCTS, []);
  },
  
  getProductBySku: (sku: string) => {
    return get().products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
  },
  
  loadSampleData: () => {
    set({ products: sampleProducts, isLoaded: true });
    saveToStorage(storageKeys.PRODUCTS, sampleProducts);
  },
}));

const cachedProducts = loadFromStorage<Product[]>(storageKeys.PRODUCTS);
if (cachedProducts && cachedProducts.length > 0) {
  useProductStore.setState({ products: cachedProducts, isLoaded: true });
}
