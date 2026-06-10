import { useOrderStore, deriveTicket } from '@/store/useOrderStore';
import { useUiStore } from '@/store/useUiStore';
import { useCountdown } from '@/hooks/useCountdown';
import { priceDecimals } from '@/lib/valuation';
import { fmtAsset } from '@/lib/format';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

//  Center panel: live two-sided RFQ quote with spread, countdown and notional.
export function RfqHero() {
  const { quote, side, qty, unit } = useOrderStore();
  const refreshQuote = useOrderStore((s) => s.refreshQuote);
  const pushToast = useUiStore((s) => s.pushToast); 

  const { secs, reset } = useCountdown({
    start: 28,
    resetTo: 30,
    onExpire: () => refreshQuote(),
  });

  const { base, quote: quoteCcy, bid, ask, spreadBps } = quote;
  const dp = priceDecimals((bid + ask) / 2);
  const { assetQty } = deriveTicket({ qty, unit, side, quote });
  const notionalQty = assetQty > 0 ? assetQty : 1;

  const spread = ask - bid;
  const timerClassName =
    secs <= 5
      ? 'text-destructive'
      : secs <= 10
        ? 'text-amber-500'
        : 'text-muted-foreground';
        
  const onRefresh = () => {
    refreshQuote();
    reset();
    pushToast('info', 'Quote refreshed', 'New bid/ask prices loaded.');
  };

  return (
    <section className="flex flex-col gap-4 border-b border-border px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-foreground">
            {base} / {quoteCcy} · OTC RFQ
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            QUOTE ACTIVE
          </span>

          <span className={cn('font-mono text-xs', timerClassName)}>
            {secs > 0 ? `Expires in ${secs}s` : 'Refreshing…'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="text-left lg:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Notional
            </div>
            <div className="font-mono text-sm font-bold text-foreground">
              {fmtAsset(base, notionalQty)} {base}
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
          price={bid.toLocaleString('en-US', {
            minimumFractionDigits: dp,
            maximumFractionDigits: dp,
          })}
          currency={quoteCcy}
          tag="Best bid"
        />

        <div className="flex min-w-24 flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 lg:flex-col lg:justify-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Spread
          </div>

          <div className="font-mono text-lg font-bold text-foreground">
            {spread.toLocaleString('en-US', {
              minimumFractionDigits: dp,
              maximumFractionDigits: dp,
            })}
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            {spreadBps.toFixed(1)} bps
          </div>
        </div>

        <QuoteCard
          tone="ask"
          label="ASK — YOU BUY"
          price={ask.toLocaleString('en-US', {
            minimumFractionDigits: dp,
            maximumFractionDigits: dp,
          })}
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
          ? 'border-emerald-500/20 bg-emerald-500/10'
          : 'border-red-500/20 bg-red-500/10',
      )}
    >
      <div
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide',
          isBid ? 'text-emerald-500' : 'text-red-500',
        )}
      >
        {label}
      </div>

      <div
        className={cn(
          'mt-1 font-mono text-3xl font-bold tracking-tight',
          isBid ? 'text-emerald-500' : 'text-red-500',
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
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-red-500/10 text-red-500',
        )}
      >
        {tag}
      </span>
    </div>
  );
}