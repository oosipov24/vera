import type { AssetSymbol, DisplayCurrency } from '@/types';
import { FX, isFiat } from '@/constants/assets';

/** Format an asset amount: fiat → 2dp, crypto → up to 4dp (trimmed), with thousands. */
export function fmtAsset(asset: AssetSymbol, amount: number): string {
  if (isFiat(asset)) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // crypto: show up to 4 decimals, but keep whole numbers clean
  const decimals = Number.isInteger(amount) ? 0 : 4;
  return amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: 4 });
}

/** Currency symbol for the active display currency. */
export function ccySymbol(ccy: DisplayCurrency): string {
  return ccy === 'EUR' ? '€' : '$';
}

/** Convert a USD figure into the active display currency. */
export function toDisplay(usd: number, ccy: DisplayCurrency): number {
  return usd * (FX[ccy] ?? 1);
}

/**
 * Format a USD value in the active display currency.
 * Returns the whole part and cents separately so the UI can style cents dimmer.
 */
export function fmtMoneyParts(usd: number, ccy: DisplayCurrency): { whole: string; cents: string; symbol: string } {
  const v = toDisplay(usd, ccy);
  const whole = Math.floor(v);
  const cents = (v - whole).toFixed(2).slice(1); // ".00"
  return {
    whole: whole.toLocaleString('en-US'),
    cents,
    symbol: ccySymbol(ccy),
  };
}

/** Single-string money format, e.g. "$1,330,370.00". */
export function fmtMoney(usd: number, ccy: DisplayCurrency): string {
  const { whole, cents, symbol } = fmtMoneyParts(usd, ccy);
  return `${symbol}${whole}${cents}`;
}

/** "27.05 10:46" style timestamp from a Date. */
export function fmtTimestamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Pseudo order id, e.g. "de5b874f...2ca8". */
export function makeOrderId(): string {
  const hex = (n: number) => Math.random().toString(16).slice(2, 2 + n);
  return `${hex(8)}...${hex(4)}`;
}

/** Monotonic-ish transaction id. */
let txnSeq = 8842;
export function nextTxnId(): string {
  txnSeq += 1;
  return `TXN-${txnSeq}`;
}
