import React, { useState, useCallback, useRef } from 'react';
import { ShoppingCart, MapPin, Package, DollarSign } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="w-full h-40 sm:h-36 flex-shrink-0 bg-slate-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.description}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package size={32} />
          </div>
        )}
      </div>
      
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-2 min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
              {product.sku}
            </span>
            <h3 className="font-semibold text-slate-800 mt-1 text-sm sm:text-base leading-tight line-clamp-2 h-10 sm:h-12">
              {product.description}
            </h3>
          </div>
          <span className="text-base sm:text-lg font-bold text-emerald-600 whitespace-nowrap flex-shrink-0">
            {formatPrice(product.fobPrice)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 text-xs min-h-[40px]">
          {product.location && (
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded h-6">
              <MapPin size={12} />
              {product.location}
            </span>
          )}
          {product.length || product.width || product.height ? (
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded h-6">
              {formatDimensions(product)}
            </span>
          ) : null}
          {product.cartonQty > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded h-6">
              <Package size={12} />
              {formatCartonQty(product)}
            </span>
          )}
        </div>
        
        <p className="text-xs text-slate-500 italic line-clamp-1 h-4">
          {product.note ? `Note: ${product.note}` : '\u00A0'}
        </p>
        
        <div className="mt-auto pt-2">
          <button
            onClick={handleAdd}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2",
              added
                ? "bg-emerald-500 text-white"
                : "bg-cyan-600 hover:bg-cyan-700 text-white active:scale-95"
            )}
          >
            <ShoppingCart size={18} />
            {added ? 'Added to Quote!' : 'Add to Quote'}
          </button>
        </div>
      </div>
    </div>
  );
});
