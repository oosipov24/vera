import { describe, it, expect } from 'vitest';
import { fmtAsset, ccySymbol, toDisplay, fmtMoneyParts, fmtMoney } from './format';

describe('fmtAsset', () => {
  it('formats fiat to two decimals with thousands separators', () => {
    expect(fmtAsset('USD', 1000)).toBe('1,000.00');
  });

  it('formats whole crypto amounts without decimals', () => {
    expect(fmtAsset('BTC', 10)).toBe('10');
  });

  it('formats fractional crypto to four decimals', () => {
    expect(fmtAsset('BTC', 1.23456)).toBe('1.2346');
  });
});

describe('display currency', () => {
  it('returns the right symbol', () => {
    expect(ccySymbol('USD')).toBe('$');
    expect(ccySymbol('EUR')).toBe('€');
  });

  it('converts USD to EUR at the configured rate', () => {
    expect(toDisplay(1000, 'EUR')).toBeCloseTo(926, 6);
    expect(toDisplay(1000, 'USD')).toBe(1000);
  });
});

describe('fmtMoneyParts / fmtMoney', () => {
  it('splits whole and cents and exposes the symbol', () => {
    const p = fmtMoneyParts(1_330_370, 'USD');
    expect(p.whole).toBe('1,330,370');
    expect(p.cents).toBe('.00');
    expect(p.symbol).toBe('$');
  });

  it('renders a single string', () => {
    expect(fmtMoney(1234.5, 'USD')).toBe('$1,234.50');
  });
});

