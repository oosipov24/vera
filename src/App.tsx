import { lazy, Suspense, useEffect, useState } from 'react';
import type { AssetSymbol } from '@/types';
import { Topbar } from '@/widgets/topbar';
import { OrderEntry } from '@/widgets/order-entry';
import { RfqHero } from '@/widgets/rfq-panel';
import { ActivityPanel } from '@/widgets/activity-panel';
import { Portfolio } from '@/widgets/portfolio-panel';
import { Toaster } from '@/shared/ui/feedback';
import { useUiStore } from '@/store/useUiStore';
import { applyPalette } from '@/lib/palette';

const DepositModal = lazy(() =>
  import('@/features/deposit-funds').then((module) => ({
    default: module.DepositModal,
  })),
);

const WithdrawModal = lazy(() =>
  import('@/features/withdraw-funds').then((module) => ({
    default: module.WithdrawModal,
  })),
);

// Root layout: trading ticket, RFQ, activity, and portfolio.
export default function App() {
  const theme = useUiStore((s) => s.theme);
  const paletteIndex = useUiStore((s) => s.paletteIndex);

  const [depOpen, setDepOpen] = useState(false);
  const [wdOpen, setWdOpen] = useState(false);
  const [depAsset, setDepAsset] = useState<AssetSymbol | null>(null);
  const [wdAsset, setWdAsset] = useState<AssetSymbol | null>(null);

  // Apply the default accent palette on first mount.
  useEffect(() => {
    applyPalette(paletteIndex, theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDeposit = (asset?: AssetSymbol) => {
    setDepAsset(asset ?? null);
    setDepOpen(true);
  };
  const openWithdraw = (asset?: AssetSymbol) => {
    setWdAsset(asset ?? null);
    setWdOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar onDeposit={() => openDeposit()} onWithdraw={() => openWithdraw()} />

      <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr_360px] gap-px overflow-hidden bg-border max-[1200px]:grid-cols-[280px_1fr]">
        <div className="min-h-0 overflow-y-auto bg-background p-[18px]">
          <OrderEntry />
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto bg-background">
          <RfqHero />
          <ActivityPanel />
        </div>

        <div className="min-h-0 overflow-y-auto bg-background p-0 max-[1200px]:hidden">
          <Portfolio onDeposit={openDeposit} onWithdraw={openWithdraw} />
        </div>
      </main>

      <Suspense fallback={null}>
        {depOpen && (
          <DepositModal
            open={depOpen}
            onClose={() => setDepOpen(false)}
            initialAsset={depAsset}
          />
        )}

        {wdOpen && (
          <WithdrawModal
            open={wdOpen}
            onClose={() => setWdOpen(false)}
            initialAsset={wdAsset}
          />
        )}
      </Suspense>

      <Toaster />
    </div>
  );
}
