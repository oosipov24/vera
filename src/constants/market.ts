import type { AssetSymbol, TradingPair } from '@/types';
import { MAJORS, STABLES, FIAT_SET } from './assets';

/**
 * Accent palettes. Each is a single hue from which the whole neutral scale +
 * accent is generated at runtime (see `lib/palette.ts`). `sw` is the swatch
 * colour shown in the picker.
 */
export interface Palette {
  name: string;
  hue: number;
  sw: string;
}

export const PALETTES: Palette[] = [
  { name: 'Violet', hue: 250, sw: '#7B6EF6' },
  { name: 'Indigo', hue: 239, sw: '#6366F1' },
  { name: 'Blue', hue: 217, sw: '#3B82F6' },
  { name: 'Sky', hue: 199, sw: '#0EA5E9' },
  { name: 'Teal', hue: 174, sw: '#14B8A6' },
  { name: 'Emerald', hue: 160, sw: '#10B981' },
  { name: 'Amber', hue: 38, sw: '#F59E0B' },
  { name: 'Rose', hue: 350, sw: '#F43F5E' },
];

/** Symbols offered in the order-entry symbol dropdown. */
const PAIR_BASES: AssetSymbol[] = [...MAJORS, ...STABLES];
const QUOTES: AssetSymbol[] = ['USDT', 'USDC', 'USD', 'EUR'];

/** Build a reasonable universe of tradeable pairs (base/quote, no self-pairs). */
export const TRADING_PAIRS: TradingPair[] = PAIR_BASES.flatMap((base) =>
  QUOTES.filter((q) => q !== base).map((q) => `${base}/${q}` as TradingPair),
);

export const LIQUIDITY_PROVIDER_OPTIONS = ['RNV', 'FLX', 'Test', 'SMART'] as const;

export type LiquidityProvider = (typeof LIQUIDITY_PROVIDER_OPTIONS)[number];

export const DEFAULT_PAIR: TradingPair = 'BNB/USDT';

/** Spread (in bps) used to derive bid/ask around the mid price. */
export const SPREAD_BPS = 9.1;

/** Seconds a quote stays live before auto-refresh. */
export const QUOTE_TTL = 28;

export { MAJORS, STABLES, FIAT_SET };

