import { useTradeStore } from '@/store/useTradeStore';
import type { AssetSymbol } from '@/types';
import { AssetIcon } from '@/shared/ui/asset-icon';
import { ASSET_META, isFiat } from '@/constants/assets';
import { fmtAsset, fmtMoney } from '@/lib/format';
import { valueInUSD } from '@/lib/valuation';
import { useUiStore } from '@/store/useUiStore';

interface BalanceCardProps {
  asset: AssetSymbol;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

/** A single asset balance row with quick deposit/withdraw actions. */
export function BalanceCard({ asset, onDeposit, onWithdraw }: BalanceCardProps) {
  const bal = useTradeStore((s) => s.balances[asset] ?? 0);
  const reserved = useTradeStore((s) => s.reserved[asset] ?? 0);
  const displayCcy = useUiStore((s) => s.displayCcy);
  const meta = ASSET_META[asset];
  const fiat = isFiat(asset);

  const amount = fiat ? `${meta.symbol ?? ''}${fmtAsset(asset, bal)}` : fmtAsset(asset, bal);
  const sub = fiat
    ? `${asset} · ${meta.rail ?? ''}`
    : asset;
  const secondary = fiat
    ? fmtMoney(valueInUSD(asset, bal), displayCcy)
    : reserved > 0
      ? `${fmtAsset(asset, reserved)} reserved`
      : '0 reserved';

  return (
    <div className="bal-card">
      <div className="bal-top">
        <AssetIcon asset={asset} />
        <div className="coin-info">
          <span className="coin-nm">{meta.name}</span>
          <span className="coin-tk">{sub}</span>
        </div>
        <div className="coin-bal">
          <span className="coin-amt">{amount}</span>
          <span className="coin-rsv">{secondary}</span>
        </div>
      </div>
      <div className="bal-strip">
        <button className="strip-btn dep" onClick={() => onDeposit(asset)}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 2v6m0 0L3.5 5.5M6 8l2.5-2.5M2.5 10h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Deposit
        </button>
        <button className="strip-btn wd" onClick={() => onWithdraw(asset)}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 8V2m0 0L3.5 4.5M6 2l2.5 2.5M2.5 10h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Withdraw
        </button>
      </div>
    </div>
  );
}
