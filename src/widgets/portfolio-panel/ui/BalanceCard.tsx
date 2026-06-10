import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AssetIcon } from '@/shared/ui/asset-icon';
import type { AssetSymbol } from '@/types';

interface BalanceCardProps {
  asset: AssetSymbol;
  name: string;
  sub: string;
  amount: string;
  secondary: string;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

/** A single asset balance row with quick deposit/withdraw actions. */
export function BalanceCard({
  asset,
  name,
  sub,
  amount,
  secondary,
  onDeposit,
  onWithdraw,
}: BalanceCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 p-3">
        <AssetIcon asset={asset} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {name}
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