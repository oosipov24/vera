import { lazy, Suspense, useState } from 'react';

import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';

import { TopbarView, type SettingsTab } from './TopbarView';

interface TopbarProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

const SettingsDialog = lazy(() =>
  import('@/features/change-settings').then((module) => ({
    default: module.SettingsDialog,
  })),
);

export function Topbar({ onDeposit, onWithdraw }: TopbarProps) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const paletteIndex = useUiStore((state) => state.paletteIndex);
  const setPalette = useUiStore((state) => state.setPalette);
  const accountType = useTradeStore((state) => state.accountType);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('email');

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <>
      <TopbarView
        theme={theme}
        accountType={accountType}
        paletteIndex={paletteIndex}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onThemeToggle={toggleTheme}
        onPaletteChange={setPalette}
        onOpenSettings={openSettings}
      />

      <Suspense fallback={null}>
        {settingsOpen && (
          <SettingsDialog
            open={settingsOpen}
            initialTab={settingsTab}
            onOpenChange={setSettingsOpen}
          />
        )}
      </Suspense>
    </>
  );
}