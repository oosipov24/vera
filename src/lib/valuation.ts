import type { AssetSymbol, BalanceMap, Quote, TradingPair } from '@/types';
import { PRICES_USD, MAJORS, STABLES, FIAT_SET } from '@/constants/assets';
import { SPREAD_BPS } from '@/constants/market';

const KNOWN_ASSETS = new Set<AssetSymbol>([
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'ADA',
  'XRP',
  'AVAX',
  'AAVE',
  'USDT',
  'USDC',
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'AED',
]);
// Valuation (pure) 
/** USD value of `amount` units of `asset`. */
export function valueInUSD(asset: AssetSymbol, amount: number | undefined): number {
  return (amount ?? 0) * (PRICES_USD[asset] ?? 0);
}

function sumSet(set: AssetSymbol[], balances: BalanceMap): number {
  return set.reduce((acc, a) => acc + valueInUSD(a, balances[a]), 0);
}

export const cryptoTotalUSD = (b: BalanceMap): number => sumSet([...MAJORS, ...STABLES], b);
export const fiatTotalUSD = (b: BalanceMap): number => sumSet(FIAT_SET, b);
export const majorsTotalUSD = (b: BalanceMap): number => sumSet(MAJORS, b);
export const stablesTotalUSD = (b: BalanceMap): number => sumSet(STABLES, b);
export const grandTotalUSD = (b: BalanceMap): number => cryptoTotalUSD(b) + fiatTotalUSD(b);

//  Quotes (pure) 
/** Parse a pair string into its base/quote symbols. */
export function splitPair(pair: TradingPair): { base: AssetSymbol; quote: AssetSymbol } {
  const [base, quote, extra] = pair.split('/');

  if (
    extra !== undefined ||
    !KNOWN_ASSETS.has(base as AssetSymbol) ||
    !KNOWN_ASSETS.has(quote as AssetSymbol)
  ) {
    throw new Error(`Invalid trading pair: ${pair}`);
  }

  return {
    base: base as AssetSymbol,
    quote: quote as AssetSymbol,
  };
}

/**
 * Derive a two-sided quote for a pair from reference prices.
 * Mid = price(base) / price(quote); bid/ask straddle it by SPREAD_BPS/2.
 *
 * BACKEND SEAM: replace with the real RFQ quote returned by your LP.
 */
export function quoteFor(pair: TradingPair, spreadBps = SPREAD_BPS): Quote {
  const { base, quote } = splitPair(pair);
  const pb = PRICES_USD[base] ?? 0;
  const pq = PRICES_USD[quote] ?? 1;
  const mid = pb / pq;
  const half = (spreadBps / 10_000) / 2;
  const bid = mid * (1 - half);
  const ask = mid * (1 + half);
  return { pair, base, quote, bid, ask, spreadBps };
}

/** Number of decimal places to show for a price, scaled to its magnitude. */
export function priceDecimals(mid: number): number {
  if (mid >= 1000) return 2;
  if (mid >= 1) return 2;
  if (mid >= 0.01) return 4;
  return 6;
}
