import { lazy, Suspense, useEffect, useState } from 'react';

import { ActivityPanel } from '@/widgets/activity-panel';
import { OrderEntry } from '@/widgets/order-entry';
import { Portfolio } from '@/widgets/portfolio-panel';
import { RfqHero } from '@/widgets/rfq-panel';
import { Topbar } from '@/widgets/topbar';
import type { AssetSymbol } from '@/types';

import { MobileTradeDrawer } from './MobileTradeDrawer';

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

function useMediaQuery(query: string, defaultValue = true) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, [query]);

  return matches;
}

// Trading layout: order ticket, RFQ, activity, and portfolio.
export function TradingPage() {
  const isDesktopLayout = useMediaQuery('(min-width: 1024px)');
  const isWideDesktopLayout = useMediaQuery('(min-width: 1201px)');

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
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Topbar
        onDeposit={() => openDeposit()}
        onWithdraw={() => openWithdraw()}
      />

      <main className="min-h-0 flex-1 overflow-hidden bg-border">
        {isDesktopLayout ? (
          <div
            className={
              isWideDesktopLayout
                ? 'grid h-full min-h-0 grid-cols-[320px_minmax(0,1fr)_360px] gap-px overflow-hidden bg-border'
                : 'grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)] gap-px overflow-hidden bg-border'
            }
          >
            <div className="min-h-0 overflow-y-auto bg-background p-4">
              <OrderEntry />
            </div>

            <div className="flex min-h-0 flex-col overflow-y-auto bg-background">
              <RfqHero />

              <section className="min-h-[420px] shrink-0 border-t border-border">
                <ActivityPanel />
              </section>

              {!isWideDesktopLayout && (
                <section className="shrink-0 border-t border-border">
                  <Portfolio
                    onDeposit={openDeposit}
                    onWithdraw={openWithdraw}
                  />
                </section>
              )}
            </div>

            {isWideDesktopLayout && (
              <div className="min-h-0 overflow-y-auto bg-background p-0">
                <Portfolio
                  onDeposit={openDeposit}
                  onWithdraw={openWithdraw}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-full min-h-0 overflow-hidden bg-background">
            <MobileTradeDrawer>
              <OrderEntry />
            </MobileTradeDrawer>

            <div className="h-full min-h-0 overflow-y-auto bg-background">
              <RfqHero />

              <div className="border-t border-border">
                <ActivityPanel />
              </div>

              <div className="border-t border-border">
                <Portfolio
                  onDeposit={openDeposit}
                  onWithdraw={openWithdraw}
                />
              </div>
            </div>
          </div>
        )}
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