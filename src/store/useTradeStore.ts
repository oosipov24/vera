import { create } from 'zustand';
import type {
  AccountType,
  AssetSymbol,
  BalanceMap,
  Execution,
  OrderSide,
  PaymentMethod,
  Transaction,
  TxnStatus,
  TradingPair,
} from '@/types';
import { fmtTimestamp, makeOrderId, nextTxnId } from '@/lib/format';
import { quoteFor, splitPair } from '@/lib/valuation';

/**
 * The trading domain store. This is the single source of truth that the
 * backend team will hook into: replace the action bodies with API calls and
 * keep the same shape so components don't change.
 */
export interface TradeState {
  accountType: AccountType;
  balances: BalanceMap;
  reserved: BalanceMap;
  executions: Execution[];
  transactions: Transaction[];

  // ── Trade actions ──────────────────────────────────────────────────────────
  /**
   * Execute an RFQ order against current balances.
   * Returns an outcome the caller can surface as a toast / alert.
   */
  submitOrder(input: {
    pair: TradingPair;
    side: OrderSide;
    /** Quantity in the base asset (already converted from USD if needed). */
    assetQty: number;
    /** Quote-currency price per unit of base. */
    price: number;
  }): { ok: true; execution: Execution } | { ok: false; reason: string };

  // ── Ledger actions ─────────────────────────────────────────────────────────
  /** Record a deposit (held as Pending until verified — balance not credited). */
  deposit(asset: AssetSymbol, amount: number, method: PaymentMethod): Transaction;
  /** Debit a withdrawal from balance + record it. Returns false if insufficient. */
  withdraw(asset: AssetSymbol, amount: number, method: PaymentMethod): boolean;
  /** Low-level ledger append (used by deposit/withdraw, exposed for testing). */
  recordTxn(t: Omit<Transaction, 'id' | 'created'>): Transaction;
}

const INITIAL_BALANCES: BalanceMap = {
  USDT: 99385, BTC: 10, ETH: 25, USDC: 50000, ADA: 10000, BNB: 1, SOL: 300,
  EUR: 75000, USD: 120000, GBP: 48000, CHF: 30000, AED: 200000,
};

// BACKEND SEAM: replace seeds below with GET /executions and GET /transactions on load.
const SEED_EXECUTIONS: Execution[] = [
  { id: 'de5b874f...2ca8', pair: 'BNB/USDT', side: 'Buy', amount: 1, asset: 'BNB', price: 615, total: 615, status: 'Executed', created: '27.05 10:46', executed: '27.05 10:46' },
  { id: 'a1c3902e...44df', pair: 'BTC/USDT', side: 'Sell', amount: 0.5, asset: 'BTC', price: 68240, total: 34120, status: 'Pending', created: '27.05 09:12', executed: '—' },
  { id: 'f9d23a11...bc01', pair: 'ADA/USDT', side: 'Buy', amount: 5000, asset: 'ADA', price: 0.421, total: 2105, status: 'Rejected', created: '27.05 08:55', executed: '—' },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-8842', type: 'Deposit', asset: 'USD', amount: 50000, method: 'SWIFT', status: 'Completed', created: '05.06 14:22', reason: '' },
  { id: 'TXN-8839', type: 'Withdrawal', asset: 'EUR', amount: 12000, method: 'SEPA', status: 'RFI Hold', created: '05.06 09:15', reason: 'RFI raised by intermediary bank — source of funds requested' },
  { id: 'TXN-8831', type: 'Deposit', asset: 'BTC', amount: 2.5, method: 'Crypto', status: 'Completed', created: '04.06 18:40', reason: '' },
  { id: 'TXN-8825', type: 'Withdrawal', asset: 'USDT', amount: 25000, method: 'Crypto', status: 'Rejected', created: '04.06 11:03', reason: 'Destination address failed AML screening' },
  { id: 'TXN-8819', type: 'Deposit', asset: 'GBP', amount: 30000, method: 'SWIFT', status: 'Pending', created: '03.06 16:30', reason: '' },
];

function isPositiveFiniteAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  accountType: 'Corporate', // BACKEND SEAM: from auth/session profile
  balances: { ...INITIAL_BALANCES },
  reserved: {},
  executions: SEED_EXECUTIONS,
  transactions: SEED_TRANSACTIONS,

  // Demo execution, production calls RFQ execute API.
  submitOrder({ pair, side, assetQty, price }) {
    if (!assetQty || assetQty <= 0) return { ok: false, reason: 'Invalid quantity' };
    const { base, quote } = splitPair(pair);
    const quoteAmt = assetQty * price;
    const balances = get().balances;

    // Balance checks
    if (side === 'buy' && quoteAmt > (balances[quote] ?? 0)) {
      return { ok: false, reason: `Insufficient ${quote}` };
    }
    if (side === 'sell' && assetQty > (balances[base] ?? 0)) {
      return { ok: false, reason: `Insufficient ${base}` };
    }

    const ts = fmtTimestamp();
    const execution: Execution = {
      id: makeOrderId(),
      pair,
      side: side === 'buy' ? 'Buy' : 'Sell',
      amount: assetQty,
      asset: base,
      price,
      total: quoteAmt,
      status: 'Executed',
      created: ts,
      executed: ts,
    };

    set((s) => {
      const next: BalanceMap = { ...s.balances };
      if (side === 'buy') {
        next[quote] = (next[quote] ?? 0) - quoteAmt;
        next[base] = (next[base] ?? 0) + assetQty;
      } else {
        next[base] = (next[base] ?? 0) - assetQty;
        next[quote] = (next[quote] ?? 0) + quoteAmt;
      }
      return { balances: next, executions: [execution, ...s.executions] };
    });

    return { ok: true, execution };
  },

  recordTxn(t) {
    const txn: Transaction = { ...t, id: nextTxnId(), created: fmtTimestamp() };
    set((s) => ({ transactions: [txn, ...s.transactions] }));
    return txn;
  },

  // BACKEND SEAM: POST /deposits (+ proof upload). Credit balance on backend
  // approval, not on submit.
  deposit(asset, amount, method) {
    if (!isPositiveFiniteAmount(amount)) {
      throw new Error('Deposit amount must be a positive finite number');
    }

    return get().recordTxn({
      type: 'Deposit',
      asset,
      amount,
      method,
      status: 'Pending' as TxnStatus,
      reason: '',
    });
  },

  // BACKEND SEAM: POST /withdrawals. Keep the insufficient-funds guard server-side too.
  withdraw(asset, amount, method) {
    if (!isPositiveFiniteAmount(amount)) return false;

    const available = get().balances[asset] ?? 0;
    if (amount > available) return false;

    set((s) => ({
      balances: {
        ...s.balances,
        [asset]: available - amount,
      },
    }));

    get().recordTxn({
      type: 'Withdrawal',
      asset,
      amount,
      method,
      status: 'Pending',
      reason: '',
    });

    return true;
  },
}));

/** Convenience re-export so components don't import valuation directly for quotes. */
export { quoteFor };
