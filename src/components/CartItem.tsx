import { Trash2, Package } from 'lucide-react';
import { OrderItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { useOrderStore } from '../store/useOrderStore';

interface CartItemProps {
  item: OrderItem;
}

export function CartItem({ item }: CartItemProps) {
  const removeItem = useOrderStore(state => state.removeItem);

  return (
    <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
      <div className="w-16 h-16 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.description}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package size={20} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono font-bold text-cyan-600">{item.sku}</span>
            <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">
              {item.description}
            </p>
            <span className="text-sm font-semibold text-emerald-600 mt-1 block">
              {formatPrice(item.unitPrice)} / unit
            </span>
          </div>
          <button
            onClick={() => removeItem(item.sku)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
