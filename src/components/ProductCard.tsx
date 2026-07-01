import React, { useState, useCallback, useRef } from 'react';
import { ShoppingCart, MapPin, Package, Ruler, Layers, Tag } from 'lucide-react';
import { Product } from '../types';
import { formatDimensions, formatCartonQty, formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

const SectionHeader = ({ icon: Icon, title, colorClass }: { icon: React.ElementType; title: string; colorClass: string }) => (
  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md mb-2", colorClass)}>
    <Icon size={12} strokeWidth={2.5} />
    <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
  </div>
);

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
      </div>
      
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-h-0">
        {/* Product Identification Section */}
        <SectionHeader 
          icon={Tag} 
          title="Product" 
          colorClass="bg-violet-100 text-violet-700"
        />
        <div className="space-y-1.5">
          {product.collection && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide w-20">Collection</span>
              <span className="text-xs font-medium text-[var(--text-primary)]">{product.collection}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide w-20">SKU</span>
            <span className="badge bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-bold tracking-wide text-[10px]">
              {product.sku}
            </span>
          </div>
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
            {product.description}
          </h3>
          {product.location && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide w-20">Location</span>
              <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <MapPin size={10} />
                {product.location}
              </span>
            </div>
          )}
        </div>
        
        {/* Physical Specifications Section */}
        <SectionHeader 
          icon={Ruler} 
          title="Dimensions" 
          colorClass="bg-emerald-100 text-emerald-700"
        />
        <div className="flex flex-wrap gap-1.5">
          {product.length || product.width || product.height ? (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              {formatDimensions(product)}
            </span>
          ) : null}
          {product.weight ? (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              {product.weight} kg
            </span>
          ) : null}
        </div>
        
        {/* Packaging Section */}
        <SectionHeader 
          icon={Layers} 
          title="Packaging" 
          colorClass="bg-amber-100 text-amber-700"
        />
        <div className="flex flex-wrap gap-1.5">
          {product.unit && (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              {product.unit}
            </span>
          )}
          {product.cartonQty > 0 && (
            <span className="badge bg-amber-50 text-amber-700 text-[10px]">
              <Package size={10} />
              {formatCartonQty(product)}
            </span>
          )}
          {product.innerQty > 0 && (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              Inner: {product.innerQty}
            </span>
          )}
          {(product.cartonL || product.cartonW || product.cartonH) ? (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              Carton: {product.cartonL || 0}×{product.cartonW || 0}×{product.cartonH || 0} CM
            </span>
          ) : null}
        </div>
        
        {/* Categorization Section */}
        <SectionHeader 
          icon={Tag} 
          title="Category" 
          colorClass="bg-rose-100 text-rose-700"
        />
        <div className="flex flex-wrap gap-1.5">
          {product.category && (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              {product.category}
            </span>
          )}
          {product.subcategory && (
            <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px]">
              {product.subcategory}
            </span>
          )}
        </div>
        
        {/* Price and Note */}
        <div className="flex items-start justify-between gap-3 mt-auto">
          <span className="font-display text-lg font-bold text-[var(--accent)] whitespace-nowrap flex-shrink-0">
            {formatPrice(product.fobPrice)}
          </span>
          {product.note && (
            <p className="text-xs text-[var(--text-muted)] italic line-clamp-1 flex-1 text-right">
              Note: {product.note}
            </p>
          )}
        </div>
        
        <div className="pt-2">
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
