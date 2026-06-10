import { describe, it, expect, beforeEach } from 'vitest';
import { useTradeStore } from './useTradeStore';

// Snapshot of the pristine seed state so each test starts clean.
const initial = useTradeStore.getState();
const seedBalances = { ...initial.balances };
const seedExecutions = [...initial.executions];
const seedTransactions = [...initial.transactions];

beforeEach(() => {
  useTradeStore.setState({
    balances: { ...seedBalances },
    executions: [...seedExecutions],
    transactions: [...seedTransactions],
  });
});

describe('submitOrder', () => {
  it('buys: credits base, debits quote, records an execution', () => {
    const { BNB = 0, USDT = 0 } = useTradeStore.getState().balances;
    const res = useTradeStore.getState().submitOrder({ pair: 'BNB/USDT', side: 'buy', assetQty: 2, price: 615 });

    expect(res.ok).toBe(true);
    const s = useTradeStore.getState();
    expect(s.balances.BNB).toBe(BNB + 2);
    expect(s.balances.USDT).toBeCloseTo(USDT - 1230, 6);
    expect(s.executions[0].asset).toBe('BNB');
    expect(s.executions[0].status).toBe('Executed');
  });

  it('sells: debits base, credits quote', () => {
    const { ETH = 0 } = useTradeStore.getState().balances;
    const res = useTradeStore.getState().submitOrder({ pair: 'ETH/USDT', side: 'sell', assetQty: 1, price: 3800 });
    expect(res.ok).toBe(true);
    expect(useTradeStore.getState().balances.ETH).toBe(ETH - 1);
  });

  it('rejects an order that exceeds the quote balance', () => {
    const res = useTradeStore.getState().submitOrder({ pair: 'BTC/USDT', side: 'buy', assetQty: 9999, price: 68240 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/Insufficient/);
  });

  it('rejects a non-positive quantity', () => {
    const res = useTradeStore.getState().submitOrder({ pair: 'BTC/USDT', side: 'buy', assetQty: 0, price: 68240 });
    expect(res.ok).toBe(false);
  });
});

describe('deposit', () => {
  it('records a Pending transaction without crediting the balance', () => {
    const usd = useTradeStore.getState().balances.USD;
    const count = useTradeStore.getState().transactions.length;
    const txn = useTradeStore.getState().deposit('USD', 10000, 'SWIFT');

    expect(txn.status).toBe('Pending');
    expect(useTradeStore.getState().balances.USD).toBe(usd); // not credited yet
    expect(useTradeStore.getState().transactions.length).toBe(count + 1);
  });
  it('rejects zero, negative and non-finite withdrawals', () => {
    const before = useTradeStore.getState().balances.USD ?? 0;

    expect(useTradeStore.getState().withdraw('USD', 0, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', -100, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', Number.NaN, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', Number.POSITIVE_INFINITY, 'SWIFT')).toBe(false);

    expect(useTradeStore.getState().balances.USD).toBe(before);
  });
});

describe('withdraw', () => {
  it('debits the balance and records a transaction', () => {
    const gbp = useTradeStore.getState().balances.GBP ?? 0;
    const ok = useTradeStore.getState().withdraw('GBP', 5000, 'SWIFT');
    expect(ok).toBe(true);
    expect(useTradeStore.getState().balances.GBP).toBe(gbp - 5000);
  });

  it('refuses to overdraw and leaves the balance untouched', () => {
    const chf = useTradeStore.getState().balances.CHF;
    const ok = useTradeStore.getState().withdraw('CHF', 9_000_000_000, 'SWIFT');
    expect(ok).toBe(false);
    expect(useTradeStore.getState().balances.CHF).toBe(chf);
  });

  it('rejects zero, negative and non-finite withdrawals', () => {
    const before = useTradeStore.getState().balances.USD ?? 0;

    expect(useTradeStore.getState().withdraw('USD', 0, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', -100, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', Number.NaN, 'SWIFT')).toBe(false);
    expect(useTradeStore.getState().withdraw('USD', Number.POSITIVE_INFINITY, 'SWIFT')).toBe(false);

    expect(useTradeStore.getState().balances.USD).toBe(before);
  });
});

