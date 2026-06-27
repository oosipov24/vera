import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RfqHeroViewProps {
  base: string;
  quoteCcy: string;
  timerText: string;
  timerTone: 'danger' | 'warning' | 'muted';
  notionalText: string;
  bidPrice: string;
  askPrice: string;
  spreadText: string;
  spreadBpsText: string;
  liquidityProvider: string;
  onRefresh: () => void;
}

// Center panel: live two-sided RFQ quote with spread, countdown and notional.
export function RfqHeroView({
  base,
  quoteCcy,
  timerText,
  timerTone,
  notionalText,
  bidPrice,
  askPrice,
  spreadText,
  spreadBpsText,
  liquidityProvider,
  onRefresh,
}: RfqHeroViewProps) {
  const timerClassName = {
    danger: 'text-destructive',
    warning: 'text-warning',
    muted: 'text-muted-foreground',
  }[timerTone];

  return (
    <section className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5">
      {/* Header row: pair info + notional + LP */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
            {base} / {quoteCcy} · OTC RFQ
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-caption font-bold text-success">
              <span className="size-1.5 rounded-full bg-success" />
              QUOTE ACTIVE
            </span>
            <span className={cn('font-mono text-xs', timerClassName)}>
              {timerText}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-end">
          <div className="flex flex-col gap-1 sm:text-right">
            <div className="text-[10px] font-normal tracking-wide text-muted-foreground">
              Notional
            </div>
            <div className="font-mono text-sm font-bold text-foreground">
              {notionalText}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-r8 border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {liquidityProvider}
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onRefresh}
              title="Refresh quote"
              aria-label="Refresh quote"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quote cards: stacked on mobile, side-by-side lg+ */}
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <QuoteCard
          tone="bid"
          label="BID — YOU SELL"
          price={bidPrice}
          currency={quoteCcy}
          tag="Best bid"
        />

        {/* Spread: inline on mobile between cards, center column lg+ */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dropdown-border bg-dropdown-surface px-4 py-2 lg:h-auto lg:w-20 lg:flex-col lg:items-center lg:justify-center lg:p-2 lg:text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Spread
          </div>
          <div className="flex items-baseline gap-2 lg:flex-col lg:items-center lg:gap-0">
            <div className="font-mono text-lg font-bold text-foreground">
              {spreadText}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {spreadBpsText}
            </div>
          </div>
        </div>

        <QuoteCard
          tone="ask"
          label="ASK — YOU BUY"
          price={askPrice}
          currency={quoteCcy}
          tag="Best ask"
        />
      </div>
    </section>
  );
}

function QuoteCard({
  tone,
  label,
  price,
  currency,
  tag,
}: {
  tone: 'bid' | 'ask';
  label: string;
  price: string;
  currency: string;
  tag: string;
}) {
  const isBid = tone === 'bid';

  return (
    <div
      className={cn(
        'relative rounded-xl border px-4 py-3 sm:py-4 sm:px-4.5',
        isBid
          ? 'border-success/20 bg-success-surface/10'
          : 'border-destructive/20 bg-destructive/10',
      )}
    >
      <div
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide',
          isBid ? 'text-success' : 'text-destructive',
        )}
      >
        {label}
      </div>

      {/* Price scales down on mobile */}
      <div
        className={cn(
          'mt-1 font-mono font-bold tracking-tight',
          'text-2xl sm:text-[34px]',
          isBid ? 'text-success' : 'text-destructive',
        )}
      >
        {price}
      </div>

      <div className="mt-1 trading-mono text-xs text-muted-foreground">
        <span aria-hidden="true">≈ </span>
        {price} {currency}
      </div>

      <span
        className={cn(
          'absolute bottom-3 right-3 rounded-md px-2 py-1 text-[10px] font-bold',
          isBid
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive',
        )}
      >
        {tag}
      </span>
    </div>
  );
}