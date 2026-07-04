import React, { useState, useCallback, useRef } from 'react';
import { Package, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

interface InfoCellProps {
  label: string;
  value: React.ReactNode;
  isPrice?: boolean;
}

const InfoCell = ({ label, value, isPrice }: InfoCellProps) => (
  <div
    className="rounded-lg p-3"
    style={{ background: 'var(--bg-secondary)' }}
  >
    <div
      className="mb-0.5"
      style={{
        fontSize: 'var(--text-caption)',
        color: 'var(--text-muted)',
      }}
    >
      {label}
    </div>
    <div
      className={cn(isPrice && 'font-mono font-bold')}
      style={{
        fontSize: 'var(--text-small)',
        color: isPrice ? 'var(--accent)' : 'var(--text-secondary)',
      }}
    >
      {value}
    </div>
  </div>
);

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
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
    }, 200);
  }, [addItem, product]);

  const hasDims = product.length > 0 || product.width > 0 || product.height > 0;
  const hasWeight = product.weight > 0;
  const hasCartonQty = product.cartonQty > 0;
  const hasPrice = product.fobPrice > 0;

  const dimsValue = hasDims
    ? `${product.length || 0}×${product.width || 0}×${product.height || 0} cm`
    : '';

  const hasAnyInfo = hasDims || hasWeight || hasCartonQty || hasPrice;

  return (
    <div
      className="card card-hover flex flex-col h-full overflow-hidden"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '400px',
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1/1',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}
      >
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.description}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <Package size={36} strokeWidth={1.5} />
          </div>
        )}

        {product.collection && (
          <div
            className="absolute rounded-full px-2.5 py-1 font-medium"
            style={{
              top: '12px',
              left: '12px',
              fontSize: 'var(--text-caption)',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            {product.collection}
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col min-h-0 gap-3">
        <div className="space-y-1">
          <div
            className="font-mono font-semibold"
            style={{
              fontSize: '15px',
              color: 'var(--text-primary)',
            }}
          >
            {product.sku}
          </div>
          <p
            className="line-clamp-2"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--text-secondary)',
            }}
          >
            {product.description}
          </p>
        </div>

        {hasAnyInfo && (
          <div className="grid grid-cols-2 gap-2">
            {hasDims && (
              <InfoCell label="Dims" value={dimsValue} />
            )}
            {hasWeight && (
              <InfoCell label="Weight" value={`${product.weight} kg`} />
            )}
            {hasCartonQty && (
              <InfoCell label="Carton" value={`${product.cartonQty}/CTN`} />
            )}
            {hasPrice && (
              <InfoCell label="Price" value={formatPrice(product.fobPrice)} isPrice />
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          <button
            onClick={handleAdd}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-all duration-200 active:scale-[0.97]",
              "hover:shadow-md"
            )}
            style={{
              background: added ? 'var(--success)' : 'var(--accent)',
              color: 'var(--text-inverse)',
              boxShadow: added ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.background = 'var(--accent-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }
            }}
          >
            {added ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                Added
              </>
            ) : (
              'Add to Quote'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
