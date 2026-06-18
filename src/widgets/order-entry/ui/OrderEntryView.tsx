import type { ReactNode } from 'react';
import type { LiquidityProvider } from '@/constants/market';
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
  market: string;
  marketOptions: string[];
  onMarketChange: (value: string) => void;
  liquidityProvider: LiquidityProvider;
  liquidityProviderOptions: readonly LiquidityProvider[];
  onLiquidityProviderChange: (value: LiquidityProvider) => void;
  alert: OrderEntryAlert | null;
  onPairChange: (value: TPair) => void;
  onSideChange: (value: OrderSide) => void;
  onQtyChange: (value: string) => void;
  onUnitChange: (value: OrderUnit) => void;
  onSubmit: () => void;
  
}

export function OrderEntryView<TPair extends string>({
  market,
  marketOptions,
  pair,
  liquidityProvider,
  liquidityProviderOptions,
  pairOptions,
  side,
  qty,
  unit,
  base,
  quoteCcy,
  summary,
  alert,
  onMarketChange,
  onLiquidityProviderChange,
  onPairChange,
  onSideChange,
  onQtyChange,
  onUnitChange,
  onSubmit,
}: OrderEntryViewProps<TPair>) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
        OTC Order Entry
      </div>

      <div className="mb-3 grid grid-cols-2 gap-0.5 rounded-[10px] border border-border bg-card p-[3px]">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-8 rounded-[8px] text-[12px] font-semibold text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground',
            side === 'buy' &&
              'bg-success-surface text-success hover:bg-success-surface',
          )}
          onClick={() => onSideChange('buy')}
        >
          Buy
        </Button>

        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-8 rounded-[8px] text-[12px] font-semibold text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground',
            side === 'sell' &&
              'bg-danger-surface text-danger hover:bg-danger-surface',
          )}
          onClick={() => onSideChange('sell')}
        >
          Sell
        </Button>
      </div>

      <FieldBlock label="Market">
        <Dropdown
          value={market}
          options={marketOptions}
          onChange={onMarketChange}
          className="h-9 rounded-[8px] border-border bg-card px-[11px] text-xs font-semibold w-full text-[12px]"
        />
      </FieldBlock>

      <FieldBlock label="Symbol">
        <Dropdown
          value={pair}
          options={pairOptions}
          onChange={onPairChange}
          searchable
          searchPlaceholder="Search symbol…"
          placeholder="Select symbol"
          className="h-9 rounded-[8px] border-border bg-card px-[11px] text-xs font-semibold w-full text-[12px]"
        />
      </FieldBlock>

      <FieldBlock label="Quantity">
        <div className="flex h-9 overflow-hidden rounded-[8px] border border-border bg-card">
          <Input
            className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-[11px] text-[11px] text-foreground shadow-none placeholder:text-muted-foreground/50 hover:bg-muted focus-visible:ring-0"
            type="number"
            inputMode="decimal"
            placeholder={unit === 'quote' ? `0.00 ${quoteCcy}` : '0.00'}
            value={qty}
            onChange={(event) => onQtyChange(event.target.value)}
          />

          <div className="flex shrink-0 bg-card">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                'h-full rounded-none px-[11px] trading-mono text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                unit === 'asset' && 'bg-muted text-foreground',
              )}
              onClick={() => onUnitChange('asset')}
            >
              {base}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                'h-full rounded-none px-[11px] trading-mono text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                unit === 'quote' && 'bg-muted text-foreground',
              )}
              onClick={() => onUnitChange('quote')}
            >
              {quoteCcy}
            </Button>
          </div>
        </div>
      </FieldBlock>

      <FieldBlock label="Liquidity Provider">
        <Dropdown
          value={liquidityProvider}
          options={liquidityProviderOptions}
          onChange={onLiquidityProviderChange}
          placeholder="Select LP"
          className="h-9 rounded-[8px] border-border bg-card px-[11px] text-xs font-medium w-full"
        />
      </FieldBlock>

      <FieldBlock label="Strategy">
        <InfoPlaque badge="SOR" tone="green">
          Smart Order Routing
        </InfoPlaque>
      </FieldBlock>
      
      <FieldBlock label="Order Type">
        <InfoPlaque badge="RFQ" tone="primary">
          Request for Quote — executed at best available price
        </InfoPlaque>
      </FieldBlock>

      <div className="mt-1 rounded-[10px] border border-border bg-card px-[13px] py-3">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
          Order Summary
        </div>

        <SummaryRow label="Pair" value={summary.pair} />
        <SummaryRow
          label="Side"
          value={summary.side}
          valueClassName={side === 'buy' ? 'text-success' : 'text-danger'}
        />
        <SummaryRow label="Price" value={summary.price} />
        <SummaryRow label="Quantity" value={summary.quantity} />

        <div className="my-2 h-px bg-border" />

        <SummaryRow
          label="You pay"
          value={summary.youPay}
          strong
          valueClassName={side === 'buy' ? 'text-danger' : 'text-success'}
        />

        <SummaryRow
          label="You receive"
          value={summary.youReceive}
          strong
          valueClassName={side === 'buy' ? 'text-success' : 'text-danger'}
        />
      </div>

      {alert && (
        <div
          className={cn(
            'mt-3 rounded-[10px] border px-3 py-2 text-xs leading-5',
            alert.kind === 'danger'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-primary/20 bg-primary/10 text-primary',
          )}
        >
          {alert.msg}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between rounded-[8px] border border-border bg-card px-2.5 py-[7px] w-full">
        <span className="text-[11px] font-medium text-muted-foreground">
          {liquidityProvider} · Active LP
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold leading-none text-success-action">
          <PulsingDot className="bg-success-action" />
          Connected
        </span>
      </div>
      <Button
        type="button"
        className={cn(
          'mt-2 h-11 rounded-[10px] text-[13px] font-bold tracking-[0.02em]',
          side === 'buy'
            ? 'bg-success-action text-success-action-foreground hover:bg-success-action/90'
            : 'bg-danger-action text-danger-action-foreground hover:bg-danger-action/90',
        )}
        onClick={onSubmit}
      >
        {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
      </Button>

    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <LabelText>{label}</LabelText>
      {children}
    </div>
  );
}

function LabelText({ children }: { children: string }) {
  return (
    <div className="mb-[5px] text-[11px] font-medium text-muted-foreground">
      {children}
    </div>
  );
}

function PulsingDot({ className }: { className: string }) {
  return (
    <span
      className="relative flex size-3 items-center justify-center"
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute inline-flex size-2 animate-ping rounded-full opacity-40',
          className,
        )}
      />
      <span
        className={cn('relative inline-flex size-1.5 rounded-full', className)}
      />
    </span>
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
  const dotClassName = tone === 'green' ? 'bg-success-action' : 'bg-primary';

  return (
    <div className="flex min-h-9 items-center gap-2 rounded-[8px] border border-border bg-card px-[11px] py-2">
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-[9px] py-[3px] text-[11px] font-bold tracking-[0.04em]',
          tone === 'green'
            ? 'border-success-surface-strong bg-success-surface text-success-action'
            : 'border-primary/25 bg-brand-surface text-primary',
        )}
      >
      <PulsingDot className={dotClassName} />

        {badge}
      </span>

      <span className="text-[11px] text-muted-foreground">{children}</span>
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
    <div className="mb-1.5 flex items-center justify-between gap-3 last:mb-0">
      <span
        className={cn(
          'text-[11px]',
          strong ? 'font-semibold text-muted-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'text-right font-mono text-[11px] font-medium text-foreground',
          strong && 'text-[13px] font-semibold',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
