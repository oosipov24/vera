import { Radio, Wifi } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Dropdown } from '@/shared/ui/Dropdown';

type OrderSide = 'buy' | 'sell';
type OrderUnit = 'asset' | 'quote';

interface OrderEntryAlert {
  kind: 'danger' | 'info';
  msg: string;
}

interface OrderEntryViewProps<TPair extends string> {
  pair: TPair;
  pairOptions: TPair[];
  side: OrderSide;
  qty: string;
  unit: OrderUnit;
  base: string;
  quoteCcy: string;
  summary: {
    pair: string;
    side: string;
    price: string;
    quantity: string;
    youPay: string;
    youReceive: string;
  };
  alert: OrderEntryAlert | null;
  onPairChange: (value: TPair) => void;
  onSideChange: (value: OrderSide) => void;
  onQtyChange: (value: string) => void;
  onUnitChange: (value: OrderUnit) => void;
  onSubmit: () => void;
}

export function OrderEntryView<TPair extends string>({
  pair,
  pairOptions,
  side,
  qty,
  unit,
  base,
  quoteCcy,
  summary,
  alert,
  onPairChange,
  onSideChange,
  onQtyChange,
  onUnitChange,
  onSubmit,
}: OrderEntryViewProps<TPair>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
        <Button
          type="button"
          variant={side === 'buy' ? 'default' : 'ghost'}
          className={cn(
            'h-10',
            side === 'buy' &&
              'bg-success text-success-foreground hover:bg-success/90',
          )}
          onClick={() => onSideChange('buy')}
        >
          Buy
        </Button>

        <Button
          type="button"
          variant={side === 'sell' ? 'default' : 'ghost'}
          className={cn(
            'h-10',
            side === 'sell' &&
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          )}
          onClick={() => onSideChange('sell')}
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
          options={pairOptions}
          onChange={onPairChange}
          searchable
          searchPlaceholder="Search symbol…"
        />
      </div>

      <div className="space-y-2">
        <LabelText>Quantity</LabelText>

        <div className="flex items-center gap-2">
          <Input
            className="min-w-0 flex-1 font-mono"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={qty}
            onChange={(event) => onQtyChange(event.target.value)}
          />

          <div className="flex overflow-hidden rounded-md border border-border bg-muted">
            <Button
              type="button"
              size="sm"
              variant={unit === 'asset' ? 'default' : 'ghost'}
              className="rounded-none px-3 font-mono text-xs"
              onClick={() => onUnitChange('asset')}
            >
              {base}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={unit === 'quote' ? 'default' : 'ghost'}
              className="rounded-none px-3 font-mono text-xs"
              onClick={() => onUnitChange('quote')}
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

        <SummaryRow label="Pair" value={summary.pair} />

        <SummaryRow
          label="Side"
          value={summary.side}
          valueClassName={side === 'buy' ? 'text-success' : 'text-destructive'}
        />

        <SummaryRow label="Price" value={summary.price} />
        <SummaryRow label="Quantity" value={summary.quantity} />

        <SummaryRow
          label="Est. slippage"
          value="0%"
          valueClassName="text-success"
        />

        <div className="border-t border-border pt-3">
          <SummaryRow label="You pay" value={summary.youPay} strong />

          <div className="mt-2">
            <SummaryRow label="You receive" value={summary.youReceive} strong />
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
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>

        <Wifi className="size-4 text-success" />

        <span className="font-semibold text-foreground">
          Vera Finance · Active LP
        </span>

        <span className="text-success">Connected</span>
      </div>

      <Button
        type="button"
        className={cn(
          'h-12 text-base font-bold',
          side === 'buy'
            ? 'bg-success text-success-foreground hover:bg-success/90'
            : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
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
            ? 'bg-success/10 text-success'
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