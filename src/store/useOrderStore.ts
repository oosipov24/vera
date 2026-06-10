import { create } from 'zustand';
import type { OrderSide, QtyUnit, Quote, TradingPair } from '@/types';
import { DEFAULT_PAIR } from '@/constants/market';
import { quoteFor } from '@/lib/valuation';

/**
 * Cross-component state for the active order ticket: which pair, side, quantity,
 * and the live quote. The left order-entry panel writes here; the center RFQ
 * hero and order summary read from it.
 */
interface OrderState {
  pair: TradingPair;
  side: OrderSide;
  /** Raw quantity as typed (interpreted via `unit`). */
  qty: string;
  unit: QtyUnit;
  quote: Quote;

  setPair(pair: TradingPair): void;
  setSide(side: OrderSide): void;
  setQty(qty: string): void;
  setUnit(unit: QtyUnit): void;
  /** Refresh the quote (BACKEND SEAM: fetch a fresh RFQ from the LP). */
  refreshQuote(): void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  pair: DEFAULT_PAIR,
  side: 'buy',
  qty: '',
  unit: 'asset',
  quote: quoteFor(DEFAULT_PAIR),

  setPair(pair) {
    set({ pair, quote: quoteFor(pair) });
  },
  setSide(side) {
    set({ side });
  },
  setQty(qty) {
    set({ qty });
  },
  setUnit(unit) {
    set({ unit });
  },
  refreshQuote() {
    set({ quote: quoteFor(get().pair) });
  },
}));

/**
 * Derive the working numbers for the current ticket: the asset quantity, the
 * effective price for the chosen side, and the quote-currency total.
 */
export function deriveTicket(state: Pick<OrderState, 'qty' | 'unit' | 'side' | 'quote'>) {
  const raw = parseFloat(state.qty) || 0;
  const price = state.side === 'buy' ? state.quote.ask : state.quote.bid;
  const assetQty = state.unit === 'quote' ? (price ? raw / price : 0) : raw;
  const total = assetQty * price;
  return { raw, price, assetQty, total };
}
