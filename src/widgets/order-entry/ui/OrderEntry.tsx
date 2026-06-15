import { fmtAsset } from '@/lib/format';
import { priceDecimals, splitPair } from '@/lib/valuation';
import { deriveTicket, useOrderStore } from '@/store/useOrderStore';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import type { AssetSymbol } from '@/types';
import { OrderEntryView } from './OrderEntryView';
import { LIQUIDITY_PROVIDER_OPTIONS, TRADING_PAIRS } from '@/constants/market';

export function OrderEntry() {
  const { pair, side, qty, unit, quote, liquidityProvider } = useOrderStore();
  const {
    setPair,
    setSide,
    setQty,
    setUnit,
    setLiquidityProvider,
  } = useOrderStore();
  const submitOrder = useTradeStore((state) => state.submitOrder);
  const balances = useTradeStore((state) => state.balances);
  const pushToast = useUiStore((state) => state.pushToast);

  const { base, quote: quoteCcy } = splitPair(pair);
  const { raw, price, assetQty, total } = deriveTicket({
    qty,
    unit,
    side,
    quote,
  });

  const pricePrecision = priceDecimals(price);

  const alert = getBalanceAlert({
    raw,
    side,
    assetQty,
    total,
    base,
    quoteCcy,
    balances,
  });

  const formatPrice = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: pricePrecision,
      maximumFractionDigits: pricePrecision,
    });

  const formatQuote = (value: number) => `${fmtAsset(quoteCcy, value)} ${quoteCcy}`;

  const summary = {
    pair: `${base} / ${quoteCcy}`,
    side: side === 'buy' ? 'Buy' : 'Sell',
    price: raw > 0 ? formatPrice(price) : '—',
    quantity: raw > 0 ? `${assetQty.toFixed(4)} ${base}` : '—',
    youPay:
      raw > 0
        ? side === 'buy'
          ? formatQuote(total)
          : `${fmtAsset(base, assetQty)} ${base}`
        : '—',
    youReceive:
      raw > 0
        ? side === 'buy'
          ? `${fmtAsset(base, assetQty)} ${base}`
          : formatQuote(total)
        : '—',
  };

  const onSubmit = () => {
    if (!raw || raw <= 0) {
      pushToast('error', 'Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    const result = submitOrder({ pair, side, assetQty, price });

    if (!result.ok) {
      pushToast('error', 'Order not filled', `${result.reason} for this order.`);
      return;
    }

    pushToast(
      'success',
      `${side === 'buy' ? 'Bought' : 'Sold'} ${fmtAsset(base, assetQty)} ${base}`,
      `Executed at ${price.toFixed(2)} ${quoteCcy} · balances updated.`,
    );

    setQty('');
  };

  return (
    <OrderEntryView
      market="CRYPTO"
      marketOptions={['CRYPTO', 'FOREX', 'COMMODITIES']}
      onMarketChange={() => undefined}
      liquidityProvider={liquidityProvider}
      liquidityProviderOptions={LIQUIDITY_PROVIDER_OPTIONS}
      onLiquidityProviderChange={setLiquidityProvider}
      pair={pair}
      pairOptions={TRADING_PAIRS}
      side={side}
      qty={qty}
      unit={unit}
      base={base}
      quoteCcy={quoteCcy}
      summary={summary}
      alert={alert}
      onPairChange={setPair}
      onSideChange={setSide}
      onQtyChange={setQty}
      onUnitChange={setUnit}
      onSubmit={onSubmit}
    />
  );
}

function getBalanceAlert({
  raw,
  side,
  assetQty,
  total,
  base,
  quoteCcy,
  balances,
}: {
  raw: number;
  side: 'buy' | 'sell';
  assetQty: number;
  total: number;
  base: AssetSymbol;
  quoteCcy: AssetSymbol;
  balances: Partial<Record<AssetSymbol, number>>;
}) {
  if (raw <= 0) {
    return null;
  }

  if (side === 'sell' && assetQty > (balances[base] ?? 0)) {
    return {
      kind: 'danger' as const,
      msg: `Insufficient ${base} — you hold ${fmtAsset(base, balances[base] ?? 0)} ${base}`,
    };
  }

  if (side === 'buy' && total > (balances[quoteCcy] ?? 0)) {
    return {
      kind: 'danger' as const,
      msg: `Insufficient ${quoteCcy} — need ${fmtAsset(quoteCcy, total)}, have ${fmtAsset(
        quoteCcy,
        balances[quoteCcy] ?? 0,
      )}`,
    };
  }

  return null;
}