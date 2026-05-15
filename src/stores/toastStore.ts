import { create } from 'zustand';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show(message, variant = 'info') {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
