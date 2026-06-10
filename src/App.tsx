import { useEffect, useState } from 'react';
import type { AssetSymbol } from '@/types';
import { Topbar } from '@/widgets/topbar';
import { OrderEntry } from '@/components/order/OrderEntry';
import { RfqHero } from '@/components/rfq/RfqHero';
import { ActivityPanel } from '@/components/tables/ActivityPanel';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { DepositModal } from '@/features/deposit-funds';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { Toaster } from '@/components/ui/feedback';
import { useUiStore } from '@/store/useUiStore';
import { applyPalette } from '@/lib/palette';


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
    <div className="app-shell">
      <Topbar onDeposit={() => openDeposit()} onWithdraw={() => openWithdraw()} />

      <main className="app-grid">
        <div className="col col-left">
          <OrderEntry />
        </div>

        <div className="col col-center">
          <RfqHero />
          <ActivityPanel />
        </div>

        <div className="col col-right">
          <Portfolio onDeposit={openDeposit} onWithdraw={openWithdraw} />
        </div>
      </main>

      <DepositModal open={depOpen} onClose={() => setDepOpen(false)} initialAsset={depAsset} />
      <WithdrawModal open={wdOpen} onClose={() => setWdOpen(false)} initialAsset={wdAsset} />
      <Toaster />
    </div>
  );
}
