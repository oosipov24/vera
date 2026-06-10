import { useOrderStore, deriveTicket } from '@/store/useOrderStore';
import { useUiStore } from '@/store/useUiStore';
import { useCountdown } from '@/hooks/useCountdown';
import { priceDecimals } from '@/lib/valuation';
import { fmtAsset } from '@/lib/format';

/** Center panel: live two-sided RFQ quote with spread, countdown and notional. */
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
  const timerColor = secs <= 5 ? 'var(--red)' : secs <= 10 ? 'var(--yellow)' : 'var(--t3)';

  const onRefresh = () => {
    refreshQuote();
    reset();
    pushToast('info', 'Quote refreshed', 'New bid/ask prices loaded.');
  };

  return (
    <section className="rfq-hero">
      <div className="rfq-top">
        <div className="rfq-pair-row">
          <span className="rfq-pair-label">
            {base} / {quoteCcy} · OTC RFQ
          </span>
          <span className="rfq-status">
            <span className="rfq-status-dot" /> QUOTE ACTIVE
          </span>
          <span className="rfq-expiry" style={{ color: timerColor }}>
            {secs > 0 ? `Expires in ${secs}s` : 'Refreshing…'}
          </span>
        </div>

        <div className="rfq-top-right">
          <div className="rfq-notional">
            <div className="rfq-not-label">Notional</div>
            <div className="rfq-not-val">
              {fmtAsset(base, notionalQty)} {base}
            </div>
          </div>
          <span className="rfq-lp-tag">Vera Finance</span>
          <button className="rfq-refresh" onClick={onRefresh} title="Refresh quote" aria-label="Refresh quote">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rfq-quotes">
        <div className="quote-card bid">
          <div className="quote-card-label">BID — YOU SELL</div>
          <div className="quote-card-price">{bid.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}</div>
          <div className="quote-card-sub">
            {bid.toLocaleString('en-US', {
              minimumFractionDigits: dp,
              maximumFractionDigits: dp,
            })}{' '}
            {quoteCcy}
          </div>
          <span className="quote-tag bid-tag">Best bid</span>
        </div>

        <div className="spread-chip">
          <div className="spread-label">SPREAD</div>
          <div className="spread-val">{spread.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}</div>
          <div className="spread-bps">{spreadBps.toFixed(1)} bps</div>
        </div>

        <div className="quote-card ask">
          <div className="quote-card-label">ASK - YOU BUY</div>
          <div className="quote-card-price">{ask.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}</div>
          <div className="quote-card-sub">
            {ask.toLocaleString('en-US', {
              minimumFractionDigits: dp,
              maximumFractionDigits: dp,
            })}{' '}
            {quoteCcy}
          </div>
          <span className="quote-tag ask-tag">Best ask</span>
        </div>
      </div>
    </section>
  );
}
