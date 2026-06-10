import { create } from 'zustand';
import type { DisplayCurrency, ThemeMode, Toast, ToastKind } from '@/types';
import { applyPalette } from '@/lib/palette';

/**
 * UI/presentation state: theme, accent palette, display currency, and the
 * toast queue. Kept separate from the trading domain so re-renders are scoped.
 */
interface UiState {
  theme: ThemeMode;
  paletteIndex: number;
  displayCcy: DisplayCurrency;
  toasts: Toast[];

  toggleTheme(): void;
  setPalette(index: number): void;
  setDisplayCcy(ccy: DisplayCurrency): void;

  pushToast(kind: ToastKind, title: string, message: string): void;
  dismissToast(id: number): void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set, get) => ({
  theme: 'dark',
  paletteIndex: 0,
  displayCcy: 'USD',
  toasts: [],

  toggleTheme() {
    const theme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme });
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    // Re-apply palette so the accent + neutral tint match the new theme.
    applyPalette(get().paletteIndex, theme);
  },

  setPalette(index) {
    set({ paletteIndex: index });
    applyPalette(index, get().theme);
  },

  setDisplayCcy(ccy) {
    set({ displayCcy: ccy });
  },

  pushToast(kind, title, message) {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, kind, title, message }] }));
    // auto-dismiss
    window.setTimeout(() => get().dismissToast(id), 4200);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
