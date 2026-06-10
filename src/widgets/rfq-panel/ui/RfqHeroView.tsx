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
  onRefresh,
}: RfqHeroViewProps) {
  const timerClassName = {
    danger: 'text-destructive',
    warning: 'text-warning',
    muted: 'text-muted-foreground',
  }[timerTone];

  return (
    <section className="flex flex-col gap-4 border-b border-border px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-foreground">
            {base} / {quoteCcy} · OTC RFQ
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
            <span className="size-1.5 rounded-full bg-success" />
            QUOTE ACTIVE
          </span>

          <span className={cn('font-mono text-xs', timerClassName)}>
            {timerText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="text-left lg:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Notional
            </div>

            <div className="font-mono text-sm font-bold text-foreground">
              {notionalText}
            </div>
          </div>

          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Vera Finance
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

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <QuoteCard
          tone="bid"
          label="BID — YOU SELL"
          price={bidPrice}
          currency={quoteCcy}
          tag="Best bid"
        />

        <div className="flex min-w-24 flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 lg:flex-col lg:justify-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Spread
          </div>

          <div className="font-mono text-lg font-bold text-foreground">
            {spreadText}
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            {spreadBpsText}
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
        'relative rounded-xl border p-4',
        isBid
          ? 'border-success/20 bg-success/10'
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

      <div
        className={cn(
          'mt-1 font-mono text-3xl font-bold tracking-tight',
          isBid ? 'text-success' : 'text-destructive',
        )}
      >
        {price}
      </div>

      <div className="mt-1 font-mono text-xs text-muted-foreground">
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