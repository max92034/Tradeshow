import { X, History, Trash2, Calendar, Package } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { formatPrice } from '../utils/formatters';
import { Order } from '../types';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-modal">
      <div
        className="bg-[var(--bg-card)] w-full sm:max-w-lg sm:rounded-xl rounded-t-xl sm:shadow-xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up sm:animate-scale-enter"
      >
        <div className="flex items-center justify-between px-6 py-6 pb-4 border-b border-[var(--border-soft)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <History size={20} />
            </div>
            <h2
              className="font-semibold"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}
            >
              Saved Quotations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="icon-btn text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: '70vh' }}>
          {savedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History
                size={48}
                strokeWidth={1}
                style={{ color: 'var(--text-muted)' }}
                className="mb-4"
              />
              <p
                className="font-medium mb-1"
                style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
              >
                No saved quotations
              </p>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>
                Quotations you save will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedOrders.map(order => (
                <div
                  key={order.id}
                  className={cn(
                    'p-4 rounded-lg transition-all duration-150 cursor-pointer',
                    'hover:bg-[var(--bg-elevated)]'
                  )}
                  style={{ background: 'var(--bg-secondary)' }}
                  onClick={() => handleLoad(order)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold truncate"
                        style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
                      >
                        {order.buyer?.company || 'Untitled'}
                      </p>
                      {order.buyer?.name && (
                        <p
                          className="truncate mt-0.5"
                          style={{ fontSize: 'var(--text-small)', color: 'var(--text-secondary)' }}
                        >
                          {order.buyer.name}
                        </p>
                      )}
                    </div>
                    <div
                      className="font-mono font-bold flex-shrink-0"
                      style={{ fontSize: 'var(--text-body)', color: 'var(--accent)' }}
                    >
                      {formatPrice(order.subtotal)}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-4 mb-3"
                    style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(order.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Package size={14} />
                      {order.items.length} items
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-soft)]">
                    <button
                      onClick={() => handleLoad(order)}
                      className="btn-primary flex-1 text-sm"
                      style={{ paddingTop: '8px', paddingBottom: '8px' }}
                    >
                      Load
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="btn-ghost"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-soft)] flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
