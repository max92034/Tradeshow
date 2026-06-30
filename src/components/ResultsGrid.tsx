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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card h-80 animate-pulse overflow-hidden">
            <div className="h-40 bg-[var(--bg-secondary)]" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-[var(--bg-secondary)] rounded-full w-1/3" />
              <div className="h-5 bg-[var(--bg-secondary)] rounded-lg w-3/4" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded-full w-1/2" />
              <div className="h-10 bg-[var(--bg-secondary)] rounded-full w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-5">
          <Package size={40} strokeWidth={1} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2">No products found</h3>
        <p className="text-sm text-[var(--text-secondary)]">Try a different search term or upload a product file</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {productCards}
    </div>
  );
});
