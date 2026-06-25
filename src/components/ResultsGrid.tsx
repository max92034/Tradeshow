import React, { useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface ResultsGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ResultsGrid = React.memo(function ResultsGrid({ products, isLoading }: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-28 h-28 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-8 bg-slate-200 rounded w-full mt-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Package size={64} strokeWidth={1} className="mb-4" />
        <h3 className="text-lg font-medium text-slate-600">No products found</h3>
        <p className="text-sm mt-1">Try a different search term or upload a product file</p>
      </div>
    );
  }

  const productCards = useMemo(() => {
    return products.map((product, index) => (
      <div
        key={product.sku}
        className="animate-fade-in h-full"
        style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      >
        <ProductCard product={product} />
      </div>
    ));
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {productCards}
    </div>
  );
});
