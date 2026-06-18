import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AssetIcon } from '@/shared/ui/asset-icon';
import type { AssetSymbol } from '@/types';

interface BalanceCardProps {
  asset: AssetSymbol;
  name: string;
  sub: string;
  amount: string;
  estimate?: string;
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
  estimate,
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
          <div className="trading-mono text-sm font-bold text-foreground">
            {amount}
          </div>

          {estimate && (
            <div className="trading-mono text-xs text-muted-foreground">
              ≈ {estimate}
            </div>
          )}

          <div className="text-xs text-muted-foreground">{secondary}</div>
        </div>
      </div>

      <div className="flex border-t border-border">
        <Button
          type="button"
          variant="ghost"
          className="h-9 flex-1 rounded-none border-0 text-xs font-semibold text-success-action shadow-none hover:bg-success-surface hover:text-success-action"
          onClick={() => onDeposit(asset)}
        >
          <ArrowDownToLine className="size-3.5" />
          Deposit
        </Button>

        <span className="w-px self-stretch bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          className="h-9 flex-1 rounded-none border-0 text-xs font-semibold text-primary shadow-none hover:bg-primary/10 hover:text-primary"
          onClick={() => onWithdraw(asset)}
        >
          <ArrowUpFromLine className="size-3.5" />
          Withdraw
        </Button>
      </div>
    </div>
  );
}