import { create } from 'zustand';

import { showToast } from '@/app/providers/ToastProvider';
import { applyPalette } from '@/lib/palette';
import type { DisplayCurrency, ThemeMode, ToastKind } from '@/types';

/**
 * UI/presentation state: theme, accent palette, display currency, and toast dispatch.
 * Toast rendering is handled by react-toastify.
 */
interface UiState {
  theme: ThemeMode;
  paletteIndex: number;
  displayCcy: DisplayCurrency;

  toggleTheme(): void;
  setPalette(index: number): void;
  setDisplayCcy(ccy: DisplayCurrency): void;

  pushToast(kind: ToastKind, title: string, message: string): void;
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: 'dark',
  paletteIndex: 0,
  displayCcy: 'USD',

  toggleTheme() {
    const theme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';

    set({ theme });

    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

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
    if (kind === 'success') {
      showToast.success(title, message);
      return;
    }

    if (kind === 'error') {
      showToast.error(title, message);
      return;
    }

    showToast.info(title, message);
  },
}));