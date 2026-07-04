import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
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
  const saveOrder = useOrderStore(state => state.saveOrder);

  const handleSave = () => {
    saveOrder();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      
      <div
        className={cn(
          "fixed z-40 right-0 top-0 h-full w-full sm:w-[420px]",
          "flex flex-col",
          "bg-[var(--bg-card)]",
          "sm:border-l sm:border-[var(--border-soft)] sm:shadow-[var(--shadow-xl)]",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-full"
        )}
        style={{ zIndex: 41 }}
      >
        <div 
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-[var(--bg-card)] border-b border-[var(--border-soft)]"
        >
          <button
            onClick={onClose}
            className="icon-btn hover:bg-[var(--bg-secondary)]"
            aria-label="Close"
          >
            <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
          
          <h1 
            className="font-semibold tracking-tight"
            style={{ fontSize: 'var(--text-h1)', color: 'var(--text-primary)' }}
          >
            Quotation
          </h1>
          
          <button
            onClick={handleSave}
            className="font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            Save
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <BuyerInfoForm />
          </div>
          
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span 
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Items ({order.items.length})
              </span>
              <button
                onClick={newOrder}
                className="inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            
            {order.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart 
                  size={48} 
                  strokeWidth={1} 
                  style={{ color: 'var(--text-muted)' }} 
                  className="mb-3" 
                />
                <p 
                  className="font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Order is empty
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Search and add products to get started
                </p>
              </div>
            ) : (
              <div>
                {order.items.map((item, index) => (
                  <CartItem 
                    key={item.sku} 
                    item={item} 
                    isLast={index === order.items.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {order.items.length > 0 && <OrderSummary />}
      </div>
    </>
  );
}
