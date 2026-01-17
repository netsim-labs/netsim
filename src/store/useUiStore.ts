import { create } from 'zustand';

type ToastType = 'info' | 'error' | 'success';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ActivityEntry {
  id: string;
  message: string;
  timestamp: number;
}

interface UiState {
  toasts: Toast[];
  zCounter: number;
  windowZ: Record<string, number>;
  activityFeed: ActivityEntry[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  bringToFront: (id: string) => number;
  logActivity: (message: string) => void;
  clearActivity: () => void;
}

const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  zCounter: 2000,
  windowZ: {},
  activityFeed: [],
  addToast: (message, type = 'info') => {
    const id = uuid();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  bringToFront: (id: string) => {
    let nextZ: number;
    set(s => {
      nextZ = (s.zCounter || 2000) + 1;
      return { zCounter: nextZ, windowZ: { ...s.windowZ, [id]: nextZ } };
    });
    // @ts-ignore
    return nextZ!;
  },
  logActivity: (message: string) => {
    const entry = { id: uuid(), message, timestamp: Date.now() };
    set(s => ({ activityFeed: [entry, ...s.activityFeed].slice(0, 10) }));
  },
  clearActivity: () => set({ activityFeed: [] })
}));
