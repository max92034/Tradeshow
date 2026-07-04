import React, { useMemo, useState, useCallback } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Package, Grid2X2, List, Plus } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

interface ResultsGridProps {
  products: Product[];
  isLoading?: boolean;
  onUploadClick?: () => void;
}

interface ListItemProps {
  product: Product;
}

const ListItem = React.memo(function ListItem({ product }: ListItemProps) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useOrderStore(state => state.addItem);

  const handleAdd = useCallback(() => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 200);
  }, [addItem, product]);

  const hasDims = product.length > 0 || product.width > 0 || product.height > 0;
  const hasWeight = product.weight > 0;
  const hasCartonQty = product.cartonQty > 0;

  const dims = hasDims
    ? `${product.length || 0}×${product.width || 0}×${product.height || 0} cm`
    : null;

  const inlineParts: string[] = [];
  if (dims) inlineParts.push(dims);
  if (hasWeight) inlineParts.push(`${product.weight} kg`);
  if (hasCartonQty) inlineParts.push(`${product.cartonQty}/CTN`);

  return (
    <div
      className="flex items-center gap-4 py-4 border-b border-[var(--border-soft)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '120px' }}
    >
      <div
        className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden"
        style={{ aspectRatio: '1/1' }}
      >
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.description}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <Package size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="font-mono font-semibold"
          style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
        >
          {product.sku}
        </div>
        <p
          className="line-clamp-1 mt-0.5"
          style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}
        >
          {product.description}
        </p>
        {inlineParts.length > 0 && (
          <p
            className="mt-1"
            style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
          >
            {inlineParts.join(' • ')}
          </p>
        )}
        {product.fobPrice > 0 && (
          <div
            className="font-mono font-bold mt-1"
            style={{ fontSize: '16px', color: 'var(--accent)' }}
          >
            {formatPrice(product.fobPrice)}
          </div>
        )}
      </div>

      <button
        onClick={handleAdd}
        className={cn(
          'icon-btn flex-shrink-0',
        )}
        style={{
          background: added ? 'var(--success)' : 'var(--accent)',
          color: 'var(--text-inverse)',
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
});

export const ResultsGrid = React.memo(function ResultsGrid({ products, isLoading, onUploadClick }: ResultsGridProps) {
  const viewMode = useSettingsStore(state => state.viewMode);
  const setViewMode = useSettingsStore(state => state.setViewMode);

  const productCards = useMemo(() => {
    return products.map((product) => (
      <div key={product.sku} className="h-full">
        <ProductCard product={product} />
      </div>
    ));
  }, [products]);

  const listItems = useMemo(() => {
    return products.map((product) => (
      <ListItem key={product.sku} product={product} />
    ));
  }, [products]);

  const viewToggle = (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[var(--bg-secondary)]">
      <button
        onClick={() => setViewMode('grid')}
        className={cn(
          'p-2 rounded-lg transition-all duration-150',
          viewMode === 'grid'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
        aria-label="Grid view"
      >
        <Grid2X2 size={18} />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={cn(
          'p-2 rounded-lg transition-all duration-150',
          viewMode === 'list'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
        aria-label="List view"
      >
        <List size={18} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="pt-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-soft)] overflow-hidden"
              >
                <div className="aspect-square bg-[var(--bg-secondary)] animate-shimmer rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-2 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-full" />
                  <div className="h-2 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-4/5" />
                  <div className="h-2 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-3/5" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-12 bg-[var(--bg-secondary)] animate-shimmer rounded-lg" />
                    <div className="h-12 bg-[var(--bg-secondary)] animate-shimmer rounded-lg" />
                  </div>
                  <div className="h-12 bg-[var(--bg-secondary)] animate-shimmer rounded-lg mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 border-b border-[var(--border-soft)]"
              >
                <div className="w-24 h-24 bg-[var(--bg-secondary)] animate-shimmer rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-1/3" />
                  <div className="h-3 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-2/3" />
                  <div className="h-2 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-1/2" />
                  <div className="h-4 bg-[var(--bg-secondary)] animate-shimmer rounded-full w-1/4" />
                </div>
                <div className="w-10 h-10 bg-[var(--bg-secondary)] animate-shimmer rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center pt-4">
        <Package size={64} strokeWidth={1} className="text-[var(--text-muted)] mb-5" />
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: 'var(--text-h2)', color: 'var(--text-primary)' }}
        >
          No products found
        </h2>
        <p
          className="mb-6 max-w-sm"
          style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}
        >
          Try a different search term or upload your catalog.
        </p>
        {onUploadClick && (
          <button onClick={onUploadClick} className="btn-primary">
            <Package size={18} />
            Upload Catalog
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="pt-4">
        <div className="flex justify-end mb-4">{viewToggle}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productCards}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="flex justify-end mb-4">{viewToggle}</div>
      <div className="flex flex-col">{listItems}</div>
    </div>
  );
});
