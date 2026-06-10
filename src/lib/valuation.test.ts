import { describe, it, expect } from 'vitest';
import {
  valueInUSD,
  cryptoTotalUSD,
  fiatTotalUSD,
  majorsTotalUSD,
  stablesTotalUSD,
  grandTotalUSD,
  quoteFor,
  splitPair,
} from './valuation';
import type { BalanceMap } from '@/types';

// The seed portfolio from the prototype / store.
const PORTFOLIO: BalanceMap = {
  USDT: 99385, BTC: 10, ETH: 25, USDC: 50000, ADA: 10000, BNB: 1, SOL: 300,
  EUR: 75000, USD: 120000, GBP: 48000, CHF: 30000, AED: 200000,
};

describe('valueInUSD', () => {
  it('prices crypto from the reference table', () => {
    expect(valueInUSD('BTC', 1)).toBe(68240);
    expect(valueInUSD('ETH', 2)).toBe(7600);
  });

  it('does not confuse XRP price with a quote price', () => {
    expect(valueInUSD('XRP', 1)).toBeCloseTo(0.618, 3);
  });

  it('treats a missing amount as zero', () => {
    expect(valueInUSD('BTC', undefined)).toBe(0);
  });
});

describe('portfolio totals', () => {
  it('grand total equals crypto + fiat', () => {
    expect(grandTotalUSD(PORTFOLIO)).toBeCloseTo(
      cryptoTotalUSD(PORTFOLIO) + fiatTotalUSD(PORTFOLIO),
      6,
    );
  });

  it('matches the known prototype figure', () => {
    expect(grandTotalUSD(PORTFOLIO)).toBe(1_330_370);
  });

  it('crypto total is majors + stables', () => {
    expect(majorsTotalUSD(PORTFOLIO) + stablesTotalUSD(PORTFOLIO)).toBe(
      cryptoTotalUSD(PORTFOLIO),
    );
  });
});

describe('quoteFor', () => {
  it('derives a mid around the implied price', () => {
    const q = quoteFor('BNB/USDT');
    expect((q.bid + q.ask) / 2).toBeCloseTo(615, 1);
  });

  it('returns ask above bid with the configured spread', () => {
    const q = quoteFor('BTC/USDT');
    expect(q.ask).toBeGreaterThan(q.bid);
    expect(q.spreadBps).toBe(9.1);
  });

  it('honours a custom spread', () => {
    const tight = quoteFor('ETH/USDT', 1);
    const wide = quoteFor('ETH/USDT', 50);
    expect(wide.ask - wide.bid).toBeGreaterThan(tight.ask - tight.bid);
  });
});

describe('splitPair', () => {
  it('splits base and quote', () => {
    expect(splitPair('BTC/USDT')).toEqual({ base: 'BTC', quote: 'USDT' });
  });

  it('rejects malformed trading pairs', () => {
    expect(() => splitPair('BTC' as never)).toThrow(/Invalid trading pair/);
    expect(() => splitPair('BTC/' as never)).toThrow(/Invalid trading pair/);
    expect(() => splitPair('/USDT' as never)).toThrow(/Invalid trading pair/);
    expect(() => splitPair('ABC/XYZ' as never)).toThrow(/Invalid trading pair/);
  });
});

