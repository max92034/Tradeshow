import React, { useState, useCallback, useRef } from 'react';
import { ShoppingCart, MapPin, Package, Ruler, Layers, Tag } from 'lucide-react';
import { Product } from '../types';
import { formatDimensions, formatCartonQty, formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Icon size={13} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-medium text-slate-700 ml-auto truncate">{value}</span>
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
      <div className="relative w-full h-44 sm:h-40 flex-shrink-0 bg-slate-50 overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Package size={36} strokeWidth={1} />
          </div>
        )}
        {product.collection && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-white/90 backdrop-blur-sm text-slate-600 rounded-full border border-slate-200/80 shadow-sm">
              {product.collection}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[10px] font-bold tracking-wider bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-sm">
            {product.sku}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <h3 className="font-semibold text-[14px] text-slate-900 leading-snug line-clamp-2 mb-3">
          {product.description}
        </h3>
        
        <div className="space-y-2 mb-3">
          {(product.length || product.width || product.height || product.weight) && (
            <InfoRow 
              icon={Ruler} 
              label="Dims" 
              value={
                <span>
                  {product.length || 0}×{product.width || 0}×{product.height || 0} cm
                  {product.weight ? ` · ${product.weight} kg` : ''}
                </span>
              } 
            />
          )}
          
          {product.location && (
            <InfoRow 
              icon={MapPin} 
              label="Location" 
              value={product.location} 
            />
          )}
          
          {product.unit && product.cartonQty > 0 && (
            <InfoRow 
              icon={Package} 
              label="Pack" 
              value={`${product.cartonQty} ${product.unit}/CTN`} 
            />
          )}
          
          {product.innerQty > 0 && (
            <InfoRow 
              icon={Layers} 
              label="Inner" 
              value={`${product.innerQty} pcs`} 
            />
          )}
          
          {(product.cartonL || product.cartonW || product.cartonH) && (
            <InfoRow 
              icon={Ruler} 
              label="CTN" 
              value={`${product.cartonL || 0}×${product.cartonW || 0}×${product.cartonH || 0} cm`} 
            />
          )}
        </div>
        
        {(product.category || product.subcategory) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.category && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                {product.category}
              </span>
            )}
            {product.subcategory && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                {product.subcategory}
              </span>
            )}
          </div>
        )}
        
        {product.note && (
          <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-3">
            {product.note}
          </p>
        )}
        
        <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(product.fobPrice)}
          </span>
          <button
            onClick={handleAdd}
            className={cn(
              "flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200",
              added
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.97]"
            )}
          >
            <ShoppingCart size={14} strokeWidth={2} />
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
});
