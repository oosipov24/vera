import type { ChangeEvent } from 'react';
import { useOrderStore, deriveTicket } from '@/store/useOrderStore';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import { Dropdown } from '@/components/ui/Dropdown';
import { TRADING_PAIRS } from '@/constants/market';
import { fmtAsset } from '@/lib/format';
import { priceDecimals, splitPair } from '@/lib/valuation';

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
    <div className="order-entry">
      {/* Buy / Sell */}
      <div className="bs-toggle">
        <button className={`bs-btn buy ${side === 'buy' ? 'on' : ''}`} onClick={() => setSide('buy')}>
          Buy
        </button>
        <button className={`bs-btn sell ${side === 'sell' ? 'on' : ''}`} onClick={() => setSide('sell')}>
          Sell
        </button>
      </div>

      {/* Market */}
      <label className="oe-label">Market</label>
      <div className="oe-static">CRYPTO SPOT (OTC)</div>

      {/* Symbol */}
      <label className="oe-label">Symbol</label>
      <Dropdown
        value={pair}
        options={TRADING_PAIRS}
        onChange={(v) => setPair(v)}
        searchable
        searchPlaceholder="Search symbol…"
        className="oe-symbol"
      />

      {/* Quantity */}
      <label className="oe-label">Quantity</label>
      <div className="qty-row">
        <input
          className="qty-inp"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={qty}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQty(e.target.value)}
        />
        <div className="qty-units">
          <button className={`qty-btn ${unit === 'asset' ? 'on' : ''}`} onClick={() => setUnit('asset')}>
            {base}
          </button>
          <button className={`qty-btn ${unit === 'quote' ? 'on' : ''}`} onClick={() => setUnit('quote')}>
            {quoteCcy}
          </button>
        </div>
      </div>

      {/* Strategy */}
      <label className="oe-label">Strategy</label>
      <div className="oe-plaque">
        <span className="plaque-badge green">SOR</span>
        <span className="plaque-text">Smart Order Routing</span>
      </div>

      {/* Order type */}
      <label className="oe-label">Order Type</label>
      <div className="oe-plaque">
        <span className="plaque-badge purple">RFQ</span>
        <span className="plaque-text">Request for Quote — best available price</span>
      </div>

      {/* Summary */}
      <div className="order-summary">
        <div className="os-title">Order Summary</div>
        <div className="os-row">
          <span>Pair</span>
          <span className="os-val">
            {base} / {quoteCcy}
          </span>
        </div>
        <div className="os-row">
          <span>Side</span>
          <span className="os-val" style={{ color: side === 'buy' ? 'var(--green)' : 'var(--red)' }}>
            {side === 'buy' ? 'Buy' : 'Sell'}
          </span>
        </div>
        <div className="os-row">
          <span>Price</span>
          <span className="os-val">{raw > 0 ? fmtPrice(price) : '—'}</span>
        </div>
        <div className="os-row">
          <span>Quantity</span>
          <span className="os-val">{raw > 0 ? `${assetQty.toFixed(4)} ${base}` : '—'}</span>
        </div>
        <div className="os-row">
          <span>Est. slippage</span>
          <span className="os-val" style={{ color: 'var(--green)' }}>
            0%
          </span>
        </div>
        <div className="os-row strong">
          <span>You pay</span>
          <span className="os-val">
            {raw > 0
              ? side === 'buy'
                ? fmtQuote(total)
                : `${fmtAsset(base, assetQty)} ${base}`
              : '—'}
          </span>
        </div>
        <div className="os-row strong">
          <span>You receive</span>
          <span className="os-val">
            {raw > 0
              ? side === 'buy'
                ? `${fmtAsset(base, assetQty)} ${base}`
                : fmtQuote(total)
              : '—'}
          </span>
        </div>
      </div>

      {alert && (
        <div className={`rfq-alert ${alert.kind}`}>{alert.msg}</div>
      )}

      {/* LP plaque */}
      <div className="lp-plaque">
        <span className="lp-conn-dot" />
        <span className="lp-label">Vera Finance · Active LP</span>
        <span className="lp-conn">: Connected</span>
      </div>

      <button className={`submit-btn ${side}`} onClick={onSubmit}>
        {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
      </button>
    </div>
  );
}
