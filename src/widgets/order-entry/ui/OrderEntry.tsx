import { Radio, Wifi } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useOrderStore, deriveTicket } from '@/store/useOrderStore';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import { Dropdown } from '@/shared/ui/Dropdown';
import { TRADING_PAIRS } from '@/constants/market';
import { fmtAsset } from '@/lib/format';
import { priceDecimals, splitPair } from '@/lib/valuation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OrderEntry() {
  const { pair, side, qty, unit, quote } = useOrderStore();
  const { setPair, setSide, setQty, setUnit } = useOrderStore();
  const submitOrder = useTradeStore((s) => s.submitOrder);
  const balances = useTradeStore((s) => s.balances);
  const pushToast = useUiStore((s) => s.pushToast);

  const { base, quote: quoteCcy } = splitPair(pair);
  const { raw, price, assetQty, total } = deriveTicket({ qty, unit, side, quote });
  const dp = priceDecimals(price);

  // Showing the local balance check before submit.
  let alert: { kind: 'danger' | 'info'; msg: string } | null = null;
  if (raw > 0) {
    if (side === 'sell' && assetQty > (balances[base] ?? 0)) {
      alert = { kind: 'danger', msg: `Insufficient ${base} — you hold ${fmtAsset(base, balances[base] ?? 0)} ${base}` };
    } else if (side === 'buy' && total > (balances[quoteCcy] ?? 0)) {
      alert = { kind: 'danger', msg: `Insufficient ${quoteCcy} — need ${fmtAsset(quoteCcy, total)}, have ${fmtAsset(quoteCcy, balances[quoteCcy] ?? 0)}` };
    }
  }

  const onSubmit = () => {
    if (!raw || raw <= 0) {
      pushToast('error', 'Invalid quantity', 'Please enter a valid quantity.');
      return;
    }
    const res = submitOrder({ pair, side, assetQty, price });
    if (!res.ok) {
      pushToast('error', 'Order not filled', `${res.reason} for this order.`);
      return;
    }
    pushToast(
      'success',
      `${side === 'buy' ? 'Bought' : 'Sold'} ${fmtAsset(base, assetQty)} ${base}`,
      `Executed at ${price.toFixed(2)} ${quoteCcy} · balances updated.`,
    );
    setQty('');
  };

  const fmtPrice = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmtQuote = (n: number) => `${fmtAsset(quoteCcy, n)} ${quoteCcy}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
        <Button
          type="button"
          variant={side === 'buy' ? 'default' : 'ghost'}
          className={cn(
            'h-10',
            side === 'buy' &&
              'bg-emerald-500 text-white hover:bg-emerald-500/90',
          )}
          onClick={() => setSide('buy')}
        >
          Buy
        </Button>

        <Button
          type="button"
          variant={side === 'sell' ? 'default' : 'ghost'}
          className={cn(
            'h-10',
            side === 'sell' && 'bg-red-500 text-white hover:bg-red-500/90',
          )}
          onClick={() => setSide('sell')}
        >
          Sell
        </Button>
      </div>

      <div className="space-y-2">
        <LabelText>Market</LabelText>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground">
          CRYPTO SPOT (OTC)
        </div>
      </div>

      <div className="space-y-2">
        <LabelText>Symbol</LabelText>
        <Dropdown
          value={pair}
          options={TRADING_PAIRS}
          onChange={(value) => setPair(value)}
          searchable
          searchPlaceholder="Search symbol…"
        />
      </div>

      <div className="space-y-2">
        <LabelText>Quantity</LabelText>

        <div className="flex items-center gap-2">
          <input
            className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={qty}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQty(event.target.value)
            }
          />

          <div className="flex overflow-hidden rounded-md border border-border bg-muted">
            <Button
              type="button"
              size="sm"
              variant={unit === 'asset' ? 'default' : 'ghost'}
              className="rounded-none px-3 font-mono text-xs"
              onClick={() => setUnit('asset')}
            >
              {base}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={unit === 'quote' ? 'default' : 'ghost'}
              className="rounded-none px-3 font-mono text-xs"
              onClick={() => setUnit('quote')}
            >
              {quoteCcy}
            </Button>
          </div>
        </div>
      </div>

      <InfoPlaque badge="SOR" tone="green">
        Smart Order Routing
      </InfoPlaque>

      <InfoPlaque badge="RFQ" tone="primary">
        Request for Quote — best available price
      </InfoPlaque>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Order Summary
        </div>

        <SummaryRow label="Pair" value={`${base} / ${quoteCcy}`} />

        <SummaryRow
          label="Side"
          value={side === 'buy' ? 'Buy' : 'Sell'}
          valueClassName={side === 'buy' ? 'text-emerald-500' : 'text-red-500'}
        />

        <SummaryRow label="Price" value={raw > 0 ? fmtPrice(price) : '—'} />

        <SummaryRow
          label="Quantity"
          value={raw > 0 ? `${assetQty.toFixed(4)} ${base}` : '—'}
        />

        <SummaryRow
          label="Est. slippage"
          value="0%"
          valueClassName="text-emerald-500"
        />

        <div className="border-t border-border pt-3">
          <SummaryRow
            label="You pay"
            value={
              raw > 0
                ? side === 'buy'
                  ? fmtQuote(total)
                  : `${fmtAsset(base, assetQty)} ${base}`
                : '—'
            }
            strong
          />

          <div className="mt-2">
            <SummaryRow
              label="You receive"
              value={
                raw > 0
                  ? side === 'buy'
                    ? `${fmtAsset(base, assetQty)} ${base}`
                    : fmtQuote(total)
                  : '—'
              }
              strong
            />
          </div>
        </div>
      </div>

      {alert && (
        <div
          className={cn(
            'rounded-xl border px-3 py-2 text-sm leading-5',
            alert.kind === 'danger'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-primary/20 bg-primary/10 text-primary',
          )}
        >
          {alert.msg}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>

        <Wifi className="size-4 text-emerald-500" />

        <span className="font-semibold text-foreground">
          Vera Finance · Active LP
        </span>

        <span className="text-emerald-500">Connected</span>
      </div>

      <Button
        type="button"
        className={cn(
          'h-12 text-base font-bold',
          side === 'buy'
            ? 'bg-emerald-500 text-white hover:bg-emerald-500/90'
            : 'bg-red-500 text-white hover:bg-red-500/90',
        )}
        onClick={onSubmit}
      >
        {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
      </Button>
    </div>
  );
}
function LabelText({ children }: { children: string }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function InfoPlaque({
  badge,
  tone,
  children,
}: {
  badge: string;
  tone: 'green' | 'primary';
  children: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold',
          tone === 'green'
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-primary/10 text-primary',
        )}
      >
        <Radio className="size-3" />
        {badge}
      </span>

      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  valueClassName,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 text-sm',
        strong ? 'font-semibold text-foreground' : 'text-muted-foreground',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-right font-mono font-semibold text-foreground',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
