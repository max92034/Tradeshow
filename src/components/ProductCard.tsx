import React, { useState, useCallback, useRef } from 'react';
import { ShoppingCart, MapPin, Package } from 'lucide-react';
import { Product } from '../types';
import { formatDimensions, formatCartonQty, formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addItem = useOrderStore(state => state.addItem);

  const handleAdd = useCallback(() => {
    addItem(product, 1);
    setAdded(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setAdded(false);
      timeoutRef.current = null;
    }, 1500);
  }, [addItem, product]);

  return (
    <div className="card card-hover overflow-hidden flex flex-col h-full group">
      <div className="w-full h-44 sm:h-40 flex-shrink-0 bg-[var(--bg-secondary)] relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.description}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <Package size={36} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-bold tracking-wide">
            {product.sku}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-h-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 flex-1">
            {product.description}
          </h3>
          <span className="font-display text-lg font-bold text-[var(--accent)] whitespace-nowrap flex-shrink-0">
            {formatPrice(product.fobPrice)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {product.location && (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <MapPin size={12} />
              {product.location}
            </span>
          )}
          {product.length || product.width || product.height ? (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              {formatDimensions(product)}
            </span>
          ) : null}
          {product.cartonQty > 0 && (
            <span className="badge bg-amber-50 text-amber-700">
              <Package size={12} />
              {formatCartonQty(product)}
            </span>
          )}
        </div>
        
        {product.note && (
          <p className="text-xs text-[var(--text-muted)] italic line-clamp-1">
            Note: {product.note}
          </p>
        )}
        
        <div className="mt-auto pt-2">
          <button
            onClick={handleAdd}
            className={cn(
              "w-full py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2",
              added
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(232,93,42,0.2)] hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_16px_rgba(232,93,42,0.3)] active:scale-[0.97]"
            )}
          >
            <ShoppingCart size={16} strokeWidth={2} />
            {added ? 'Added!' : 'Add to Quote'}
          </button>
        </div>
      </div>
    </div>
  );
});
