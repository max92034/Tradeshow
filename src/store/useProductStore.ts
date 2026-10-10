import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Product } from '../types';
import { createLegacyJsonStorage } from '../utils/legacyStorage';

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  version: number;
  lastUpdated: string | null;
  loadProducts: (products: Product[]) => void;
  clearProducts: () => void;
  loadSampleData: () => Promise<void>;
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

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoaded: false,
      version: 0,
      lastUpdated: null,

      loadProducts: (products: Product[]) => {
        const migrated = migrateProducts(products);
        const newVersion = get().version + 1;
        set({ products: migrated, isLoaded: true, version: newVersion, lastUpdated: new Date().toISOString() });
      },

      clearProducts: () => {
        const newVersion = get().version + 1;
        set({ products: [], isLoaded: false, version: newVersion, lastUpdated: null });
      },

      loadSampleData: async () => {
        const { sampleProducts } = await import('../data/sampleProducts');
        const newVersion = get().version + 1;
        set({ products: sampleProducts, isLoaded: true, version: newVersion, lastUpdated: new Date().toISOString() });
      },
    }),
    {
      name: 'tradeshow_products',
      storage: createJSONStorage(() =>
        createLegacyJsonStorage<Product[]>((legacy) => ({
          products: Array.isArray(legacy) ? migrateProducts(legacy) : [],
          isLoaded: Array.isArray(legacy) && legacy.length > 0,
        }))
      ),
      partialize: (state) => ({ products: state.products, isLoaded: state.isLoaded, lastUpdated: state.lastUpdated }),
    }
  )
);
