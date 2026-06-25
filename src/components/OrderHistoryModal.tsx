import { X, History, Trash2, ChevronRight, Calendar, Package } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { formatPrice } from '../utils/formatters';
import { Order } from '../types';
import { getCountryByCode } from '../data/countries';
import { cn } from '../lib/utils';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const savedOrders = useOrderStore(state => state.savedOrders);
  const loadOrder = useOrderStore(state => state.loadOrder);
  const deleteOrder = useOrderStore(state => state.deleteOrder);

  const handleLoad = (order: Order) => {
    loadOrder(order.id);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this quotation?')) {
      deleteOrder(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History size={20} className="text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-800">Saved Quotations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {savedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History size={48} strokeWidth={1} className="mb-3" />
              <p className="font-medium text-slate-600">No saved quotations</p>
              <p className="text-sm mt-1">Quotations you save will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedOrders.map(order => {
                const country = getCountryByCode(order.buyer?.nationality || '');
                const previewItems = order.items.slice(0, 3);
                const extraCount = order.items.length - previewItems.length;
                
                return (
                  <div
                    key={order.id}
                    onClick={() => handleLoad(order)}
                    className={cn(
                      "p-3 bg-white border border-slate-200 rounded-xl cursor-pointer",
                      "hover:border-cyan-300 hover:shadow-sm transition-all group"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-700 font-bold text-sm">
                          {country?.code || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 truncate">
                              {order.buyer?.company || 'Untitled'}
                            </p>
                            {order.buyer?.name && (
                              <p className="text-sm text-slate-500 truncate">
                                {order.buyer.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => handleDelete(e, order.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                            <ChevronRight size={18} className="text-slate-400" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(order.updatedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Package size={12} />
                            {order.items.length} items
                          </span>
                          <span className="font-semibold text-emerald-600 ml-auto">
                            {formatPrice(order.subtotal)}
                          </span>
                        </div>
                        
                        <div className="mt-2.5 space-y-1">
                          {previewItems.map(item => (
                            <div key={item.sku} className="flex items-center gap-2 text-xs">
                              <span className="font-mono text-cyan-600 font-medium flex-shrink-0">
                                {item.sku}
                              </span>
                              <span className="text-slate-600 truncate flex-1">
                                {item.description}
                              </span>
                              <span className="text-slate-500 flex-shrink-0">
                                {formatPrice(item.unitPrice)}
                              </span>
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <p className="text-xs text-slate-400 italic">
                              +{extraCount} more item{extraCount > 1 ? 's' : ''}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
