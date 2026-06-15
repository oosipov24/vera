import { useCountdown } from '@/hooks/useCountdown';
import { fmtAsset } from '@/lib/format';
import { priceDecimals } from '@/lib/valuation';
import { deriveTicket, useOrderStore } from '@/store/useOrderStore';
import { useUiStore } from '@/store/useUiStore';

import { RfqHeroView } from './RfqHeroView';

export function RfqHero() {
  const { quote, side, qty, unit, liquidityProvider } = useOrderStore();
  const refreshQuote = useOrderStore((state) => state.refreshQuote);
  const pushToast = useUiStore((state) => state.pushToast);

  const { secs, reset } = useCountdown({
    start: 28,
    resetTo: 30,
    onExpire: () => refreshQuote(),
  });

  const { base, quote: quoteCcy, bid, ask, spreadBps } = quote;
  const pricePrecision = priceDecimals((bid + ask) / 2);
  const { assetQty } = deriveTicket({ qty, unit, side, quote });
  const notionalQty = assetQty > 0 ? assetQty : 1;
  const spread = ask - bid;

  const formatPrice = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: pricePrecision,
      maximumFractionDigits: pricePrecision,
    });

  const onRefresh = () => {
    refreshQuote();
    reset();
    pushToast('info', 'Quote refreshed', 'New bid/ask prices loaded.');
  };

  return (
    <RfqHeroView
      base={base}
      quoteCcy={quoteCcy}
      timerText={secs > 0 ? `Expires in ${secs}s` : 'Refreshing…'}
      timerTone={getTimerTone(secs)}
      notionalText={`${fmtAsset(base, notionalQty)} ${base}`}
      bidPrice={formatPrice(bid)}
      askPrice={formatPrice(ask)}
      spreadText={formatPrice(spread)}
      spreadBpsText={`${spreadBps.toFixed(1)} bps`}
      onRefresh={onRefresh}
      liquidityProvider={liquidityProvider}
    />
  );
}

function getTimerTone(secs: number) {
  if (secs <= 5) {
    return 'danger';
  }

  if (secs <= 10) {
    return 'warning';
  }

  return 'muted';
}