import { useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import type { ExecutionStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import { fmtAsset } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DataTableCell, DataTableHead } from '@/shared/ui/data-table-parts';
import { Input } from '@/components/ui/input';

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Dropdown
          value={status}
          options={STATUS_OPTS}
          onChange={setStatus}
          className="min-w-32"
        />

        <Input
          className="min-w-32 max-w-56 flex-1"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <DataTableHead>Order ID</DataTableHead>
              <DataTableHead>Pair</DataTableHead>
              <DataTableHead>Side</DataTableHead>
              <DataTableHead>Amount</DataTableHead>
              <DataTableHead>Price</DataTableHead>
              <DataTableHead>Total</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Created</DataTableHead>
              <DataTableHead>Executed</DataTableHead>
            </tr>
          </thead>

          <tbody>
            {rows.map((execution) => (
              <tr
                key={execution.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                <DataTableCell mono>{execution.id}</DataTableCell>
                <DataTableCell strong>{execution.pair}</DataTableCell>
                <DataTableCell>
                  <SideTag side={execution.side} />
                </DataTableCell>
                <DataTableCell mono>
                  {fmtAsset(execution.asset, execution.amount)}{' '}
                  <span className="text-xs text-muted-foreground">
                    {execution.asset}
                  </span>
                </DataTableCell>
                <DataTableCell mono>
                  {execution.price.toLocaleString('en-US')}
                </DataTableCell>
                <DataTableCell mono>
                  {execution.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={execution.status} />
                </DataTableCell>
                <DataTableCell time>{execution.created}</DataTableCell>
                <DataTableCell time>{execution.executed}</DataTableCell>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No executions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-xs text-muted-foreground">
        {rows.length} rows
      </div>
    </div>
  );
}

function SideTag({ side }: { side: string }) {
  const isBuy = side.toLowerCase() === 'buy';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        isBuy
          ? 'bg-emerald-500/10 text-emerald-500'
          : 'bg-red-500/10 text-red-500',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {side}
    </span>
  );
}