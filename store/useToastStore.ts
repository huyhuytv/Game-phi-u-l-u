import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: ToastMessage[];
}

interface ToastActions {
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create(
  immer<ToastState & ToastActions>((set) => ({
    toasts: [],
    addToast: (message, type = 'info') => {
      const id = crypto.randomUUID();
      set((state) => {
        state.toasts.push({ id, message, type });
      });
    },
    removeToast: (id) => {
      set((state) => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
      });
    },
  }))
);
