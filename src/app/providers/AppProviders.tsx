import { useEffect, type ReactNode } from 'react';

import { ToastProvider } from './ToastProvider';
import { applyPalette } from '@/lib/palette';
import { useUiStore } from '@/store/useUiStore';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const theme = useUiStore((state) => state.theme);
  const paletteIndex = useUiStore((state) => state.paletteIndex);

  useEffect(() => {
    applyPalette(paletteIndex, theme);
  }, [paletteIndex, theme]);

  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
