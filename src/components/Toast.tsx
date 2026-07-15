import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    set({ toasts: [...get().toasts, { id, message, type }] });
    
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
}));

export function ToastContainer() {
  const toasts = useToastStore(state => state.toasts);
  const removeToast = useToastStore(state => state.removeToast);

  const bgClasses: Record<ToastType, string> = {
    error: 'bg-red-500',
    success: 'bg-emerald-500',
    info: 'bg-cyan-600',
    warning: 'bg-amber-500',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`${bgClasses[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer text-sm font-medium animate-slide-in-right flex items-start gap-2`}
        >
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const addToast = useToastStore(state => state.addToast);
  return { addToast };
}
