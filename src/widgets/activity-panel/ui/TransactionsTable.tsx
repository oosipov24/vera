import { useMemo, useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import type { AssetSymbol, MethodFilter, RailFilter, StatusFilter } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import { TooltipCell } from '@/shared/ui/feedback';
import { FIAT_METHODS } from '@/constants/assets';
import { fmtAsset } from '@/lib/format';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DataTableCell, DataTableHead } from '@/shared/ui/data-table-parts';


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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Dropdown
          value={status}
          options={STATUS_OPTS}
          onChange={setStatus}
          className="min-w-32"
        />

        <Dropdown
          value={rail}
          options={RAIL_OPTS}
          onChange={onRail}
          className="min-w-32"
        />

        <Dropdown
          value={method}
          options={methodOptions}
          onChange={setMethod}
          className="min-w-32"
          renderValue={(value) => methodLabel(value)}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto gap-2"
          onClick={downloadStatement}
        >
          <Download className="size-4" />
          Statement
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <DataTableHead>Txn ID</DataTableHead>
              <DataTableHead>Type</DataTableHead>
              <DataTableHead>Asset</DataTableHead>
              <DataTableHead>Amount</DataTableHead>
              <DataTableHead>Method</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Created</DataTableHead>
              <DataTableHead>Note / Reason</DataTableHead>
            </tr>
          </thead>

          <tbody>
            {rows.map((transaction) => {
              const isRFI = transaction.status === 'RFI Hold';

              return (
                <tr
                  key={transaction.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/40"
                >
                  <DataTableCell mono>{transaction.id}</DataTableCell>
                  <DataTableCell>
                    <TypeTag type={transaction.type} />
                  </DataTableCell>
                  <DataTableCell strong>{transaction.asset}</DataTableCell>
                  <DataTableCell mono>
                    {fmtAsset(transaction.asset, transaction.amount)}
                  </DataTableCell>
                  <DataTableCell>{transaction.method}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge status={transaction.status} />
                  </DataTableCell>
                  <DataTableCell time>{transaction.created}</DataTableCell>
                  <DataTableCell>
                    {transaction.reason ? (
                      <TooltipCell
                        text={transaction.reason}
                        className={cn(
                          'inline-block max-w-56 cursor-default overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground',
                          isRFI && 'text-primary',
                        )}
                      >
                        {isRFI ? '⚠ ' : ''}
                        {transaction.reason}
                      </TooltipCell>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </DataTableCell>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions match your filters
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

function TypeTag({ type }: { type: string }) {
  const isDeposit = type.toLowerCase() === 'deposit';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        isDeposit
          ? 'bg-emerald-500/10 text-emerald-500'
          : 'bg-orange-500/10 text-orange-500',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}