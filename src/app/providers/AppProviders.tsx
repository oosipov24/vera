import { useEffect, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { applyPalette } from '@/lib/palette';
import { useUiStore } from '@/store/useUiStore';

import { ToastProvider } from './ToastProvider';

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
    <TooltipProvider delayDuration={250}>
      {children}
      <ToastProvider />
    </TooltipProvider>
  );
}