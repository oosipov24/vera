import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import type { AssetSymbol } from '@/types';
import { AssetIcon } from '@/shared/ui/asset-icon';
import { ASSET_META, isFiat } from '@/constants/assets';
import { fmtAsset, fmtMoney } from '@/lib/format';
import { valueInUSD } from '@/lib/valuation';

interface BalanceCardProps {
  asset: AssetSymbol;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

/** A single asset balance row with quick deposit/withdraw actions. */
export function BalanceCard({ asset, onDeposit, onWithdraw }: BalanceCardProps) {
  const bal = useTradeStore((state) => state.balances[asset] ?? 0);
  const reserved = useTradeStore((state) => state.reserved[asset] ?? 0);
  const displayCcy = useUiStore((state) => state.displayCcy);

  const meta = ASSET_META[asset];
  const fiat = isFiat(asset);

  const amount = fiat
    ? `${meta.symbol ?? ''}${fmtAsset(asset, bal)}`
    : fmtAsset(asset, bal);

  const sub = fiat ? `${asset} · ${meta.rail ?? ''}` : asset;

  const secondary = fiat
    ? fmtMoney(valueInUSD(asset, bal), displayCcy)
    : reserved > 0
      ? `${fmtAsset(asset, reserved)} reserved`
      : '0 reserved';

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 p-3">
        <AssetIcon asset={asset} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {meta.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">{sub}</div>
        </div>

        <div className="text-right">
          <div className="font-mono text-sm font-bold text-foreground">
            {amount}
          </div>
          <div className="text-xs text-muted-foreground">{secondary}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-none border-r border-border text-xs text-muted-foreground hover:bg-success/10 hover:text-success"
          onClick={() => onDeposit(asset)}
        >
          <ArrowDownToLine className="size-3.5" />
          Deposit
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-none text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
          onClick={() => onWithdraw(asset)}
        >
          <ArrowUpFromLine className="size-3.5" />
          Withdraw
        </Button>
      </div>
    </div>
  );
}
