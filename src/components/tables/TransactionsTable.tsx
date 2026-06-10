import { useMemo, useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import type { AssetSymbol, MethodFilter, RailFilter, StatusFilter } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Dropdown } from '@/components/ui/Dropdown';
import { TooltipCell } from '@/components/ui/feedback';
import { FIAT_METHODS } from '@/constants/assets';
import { fmtAsset } from '@/lib/format';

const RAIL_OPTS: RailFilter[] = ['All Rails', 'Fiat', 'Crypto'];
const STATUS_OPTS: StatusFilter[] = ['All Status', 'Completed', 'Pending', 'RFI Hold', 'Rejected'];
const FIAT_METHOD_SET: string[] = [...FIAT_METHODS];

/**
 * Deposits / withdrawals table.
 *
 * Filters: payment rail (All / Fiat / Crypto), method, and status.
 * The "method" dropdown is dynamic and lists CONCRETE values:
 *   • Fiat rail   → the fiat rails present (SEPA / SWIFT)
 *   • Crypto rail → the specific assets present (BTC, USDT, …)
 *   • All rails   → both
 * Matching: fiat methods match `t.method`; asset values match `t.asset`.
 */
export function TransactionsTable() {
  const transactions = useTradeStore((s) => s.transactions);
  const [rail, setRail] = useState<RailFilter>('All Rails');
  const [method, setMethod] = useState<MethodFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All Status');

  // Derive the method options from the actual data, scoped to the chosen rail.
  const methodOptions = useMemo<MethodFilter[]>(() => {
    const fiatRails = [...new Set(transactions.filter((t) => FIAT_METHOD_SET.includes(t.method)).map((t) => t.method))] as MethodFilter[];
    const cryptoAssets = [...new Set(transactions.filter((t) => t.method === 'Crypto').map((t) => t.asset))] as MethodFilter[];
    if (rail === 'Fiat') return ['All', ...fiatRails];
    if (rail === 'Crypto') return ['All', ...cryptoAssets];
    return ['All', ...fiatRails, ...cryptoAssets];
  }, [transactions, rail]);

  const onRail = (r: RailFilter) => {
    setRail(r);
    setMethod('All'); // reset method when rail changes
  };

  const rows = transactions.filter((t) => {
    if (rail === 'Fiat' && !FIAT_METHOD_SET.includes(t.method)) return false;
    if (rail === 'Crypto' && t.method !== 'Crypto') return false;
    if (method !== 'All') {
      const matches = FIAT_METHOD_SET.includes(method)
        ? t.method === method
        : t.asset === (method as AssetSymbol);
      if (!matches) return false;
    }
    if (status !== 'All Status' && t.status !== status) return false;
    return true;
  });

  const methodLabel = (m: MethodFilter | '') => (m === 'All' || m === '' ? 'All Methods' : m);
  
  const downloadStatement = () => {
    const rows = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      asset: t.asset,
      amount: t.amount,
      method: t.method,
      status: t.status,
      created: t.created,
      reason: t.reason,
    }));

    const csv = [
      'id,type,asset,amount,method,status,created,reason',
      ...rows.map((r) =>
        [r.id, r.type, r.asset, r.amount, r.method, r.status, r.created, r.reason]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'statement.csv';
    a.click();

    URL.revokeObjectURL(url);
  };
  return (
    <div className="activity-table">
      <div className="filters-row">
        <Dropdown value={status} options={STATUS_OPTS} onChange={setStatus} className="filter-dd" />
        <Dropdown value={rail} options={RAIL_OPTS} onChange={onRail} className="filter-dd" />
        <Dropdown
          value={method}
          options={methodOptions}
          onChange={setMethod}
          className="filter-dd"
          renderValue={(v) => methodLabel(v)}
        />
        <button className="btn-statement" type="button" onClick={downloadStatement}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v7m0 0L4 6m3 3l3-3M2.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Statement
        </button>
      </div>

      <div className="vt-wrap">
        <table className="vt">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Created</th>
              <th>Note / Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const isRFI = t.status === 'RFI Hold';
              return (
                <tr key={t.id}>
                  <td className="td-mono">{t.id}</td>
                  <td>
                    <span className={`type-tag ${t.type.toLowerCase()}`}>{t.type}</span>
                  </td>
                  <td className="td-pair">{t.asset}</td>
                  <td className="td-mono">{fmtAsset(t.asset, t.amount)}</td>
                  <td>{t.method}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="td-time">{t.created}</td>
                  <td className="td-reason">
                    {t.reason ? (
                      <TooltipCell text={t.reason} className={`reason-cell ${isRFI ? 'rfi' : ''}`}>
                        {isRFI ? '⚠ ' : ''}
                        {t.reason}
                      </TooltipCell>
                    ) : (
                      <span style={{ color: 'var(--t4)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="td-empty">No transactions match your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="vt-foot">
        <span className="vt-count">{rows.length} rows</span>
      </div>
    </div>
  );
}
