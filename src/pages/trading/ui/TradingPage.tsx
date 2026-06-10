import { lazy, Suspense, useState } from 'react';

import { ActivityPanel } from '@/widgets/activity-panel';
import { OrderEntry } from '@/widgets/order-entry';
import { Portfolio } from '@/widgets/portfolio-panel';
import { RfqHero } from '@/widgets/rfq-panel';
import { Topbar } from '@/widgets/topbar';
import type { AssetSymbol } from '@/types';

const DepositDialog = lazy(() =>
  import('@/features/deposit-funds').then((module) => ({
    default: module.DepositDialog,
  })),
);

const WithdrawDialog = lazy(() =>
  import('@/features/withdraw-funds').then((module) => ({
    default: module.WithdrawDialog,
  })),
);

// Trading layout: order ticket, RFQ, activity, and portfolio.
export function TradingPage() {

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAsset, setDepositAsset] = useState<AssetSymbol | null>(null);
  const [withdrawAsset, setWithdrawAsset] = useState<AssetSymbol | null>(null);

  const openDeposit = (asset?: AssetSymbol) => {
    setDepositAsset(asset ?? null);
    setDepositOpen(true);
  };

  const openWithdraw = (asset?: AssetSymbol) => {
    setWithdrawAsset(asset ?? null);
    setWithdrawOpen(true);
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
        {depositOpen && (
          <DepositDialog
            open={depositOpen}
            onClose={() => setDepositOpen(false)}
            initialAsset={depositAsset}
          />
        )}

        {withdrawOpen && (
          <WithdrawDialog
            open={withdrawOpen}
            onClose={() => setWithdrawOpen(false)}
            initialAsset={withdrawAsset}
          />
        )}
      </Suspense>

    </div>
  );
}