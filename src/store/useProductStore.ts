import { create } from 'zustand';
import { Product } from '../types';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { sampleProducts } from '../data/sampleProducts';

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  version: number;
  loadProducts: (products: Product[]) => void;
  clearProducts: () => void;
  getProductBySku: (sku: string) => Product | undefined;
  loadSampleData: () => void;
}

function migrateProduct(p: Partial<Product>): Product {
  return {
    sku: p.sku || '',
    description: p.description || '',
    collection: p.collection || '',
    location: p.location || '',
    length: p.length || 0,
    width: p.width || 0,
    height: p.height || 0,
    weight: p.weight || 0,
    unit: p.unit || 'PC',
    cartonQty: p.cartonQty || 0,
    innerQty: p.innerQty || 0,
    cartonL: p.cartonL || 0,
    cartonW: p.cartonW || 0,
    cartonH: p.cartonH || 0,
    category: p.category || '',
    subcategory: p.subcategory || '',
    fobPrice: p.fobPrice || 0,
    note: p.note || '',
    imageUrl: p.imageUrl || '',
    keyword: p.keyword || '',
  };
}

function migrateProducts(products: Product[]): Product[] {
  return products.map(p => migrateProduct(p));
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoaded: false,
  version: 0,
  
  loadProducts: (products: Product[]) => {
    const migrated = migrateProducts(products);
    const newVersion = get().version + 1;
    set({ products: migrated, isLoaded: true, version: newVersion });
    saveToStorage(storageKeys.PRODUCTS, migrated);
  },
  
  clearProducts: () => {
    const newVersion = get().version + 1;
    set({ products: [], isLoaded: false, version: newVersion });
    saveToStorage(storageKeys.PRODUCTS, []);
  },
  
  getProductBySku: (sku: string) => {
    return get().products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
  },
  
  loadSampleData: () => {
    const newVersion = get().version + 1;
    set({ products: sampleProducts, isLoaded: true, version: newVersion });
    saveToStorage(storageKeys.PRODUCTS, sampleProducts);
  },
}));

const cachedProducts = loadFromStorage<Product[]>(storageKeys.PRODUCTS);
if (cachedProducts && cachedProducts.length > 0) {
  const migrated = migrateProducts(cachedProducts);
  useProductStore.setState({ products: migrated, isLoaded: true });
}
