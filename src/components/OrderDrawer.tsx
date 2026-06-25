import { X, ShoppingCart, Plus } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { CartItem } from './CartItem';
import { BuyerInfoForm } from './BuyerInfoForm';
import { OrderSummary } from './OrderSummary';
import { cn } from '../lib/utils';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDrawer({ isOpen, onClose }: OrderDrawerProps) {
  const order = useOrderStore(state => state.currentOrder);
  const newOrder = useOrderStore(state => state.newOrder);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      
      <div
        className={cn(
          "fixed z-50 bg-slate-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          "right-0 top-0 h-full w-full sm:w-[440px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-100 rounded-lg">
              <ShoppingCart size={20} className="text-cyan-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Quotation</h2>
              <p className="text-xs text-slate-500">{order.items.length} items</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={newOrder}
              className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
              title="New quote"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <BuyerInfoForm />
          
          {order.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ShoppingCart size={48} strokeWidth={1} className="mb-3" />
              <p className="font-medium text-slate-600">Order is empty</p>
              <p className="text-sm mt-1">Search and add products to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {order.items.map(item => (
                <CartItem key={item.sku} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {order.items.length > 0 && <OrderSummary />}
      </div>
    </>
  );
}
