import { useState, type ChangeEvent } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import type { ExecutionStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Dropdown } from '@/components/ui/Dropdown';
import { fmtAsset } from '@/lib/format';

const STATUS_OPTS: Array<'All Status' | ExecutionStatus> = ['All Status', 'Executed', 'Pending', 'Rejected'];

/** Executions (trade history) table with a status + search filter. */
export function ExecutionsTable() {
  const executions = useTradeStore((s) => s.executions);
  const [status, setStatus] = useState<'All Status' | ExecutionStatus>('All Status');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const rows = executions.filter((e) => {
    if (status !== 'All Status' && e.status !== status) return false;

    if (
      q &&
      !e.pair.toLowerCase().includes(q) &&
      !e.id.toLowerCase().includes(q)
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="activity-table">
      <div className="filters-row">
        <Dropdown
          value={status}
          options={STATUS_OPTS}
          onChange={setStatus}
          className="filter-dd"
        />
        <input
          className="filter-search"
          placeholder="Search"
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
      </div>

      <div className="vt-wrap">
        <table className="vt">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Pair</th>
              <th>Side</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
              <th>Executed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="td-mono">{e.id}</td>
                <td className="td-pair">{e.pair}</td>
                <td>
                  <span className={`side-tag ${e.side.toLowerCase()}`}>{e.side}</span>
                </td>
                <td className="td-mono">
                  {fmtAsset(e.asset, e.amount)} <span className="td-unit">{e.asset}</span>
                </td>
                <td className="td-mono">{e.price.toLocaleString('en-US')}</td>
                <td className="td-mono">{e.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td><StatusBadge status={e.status} /></td>
                <td className="td-time">{e.created}</td>
                <td className="td-time">{e.executed}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="td-empty">No executions match your filters</td>
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
