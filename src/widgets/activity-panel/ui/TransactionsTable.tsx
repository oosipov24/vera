import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FIAT_METHODS } from '@/constants/assets';
import { fmtAsset } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Dropdown } from '@/shared/ui/Dropdown';
import { TooltipCell } from '@/shared/ui/feedback';
import { useTradeStore } from '@/store/useTradeStore';
import type {
  AssetSymbol,
  MethodFilter,
  RailFilter,
  StatusFilter,
} from '@/types';

import { StatusBadge } from './StatusBadge';

type TransactionRow =
  ReturnType<typeof useTradeStore.getState>['transactions'][number];

const RAIL_OPTS: RailFilter[] = ['All Rails', 'Fiat', 'Crypto'];
const STATUS_OPTS: StatusFilter[] = [
  'All Status',
  'Completed',
  'Pending',
  'RFI Hold',
  'Rejected',
];

const FIAT_METHOD_SET: string[] = [...FIAT_METHODS];

const columnHelper = createColumnHelper<TransactionRow>();

/**
 * Deposits / withdrawals table.
 *
 * Filters: payment rail, method, and status.
 */
export function TransactionsTable() {
  const transactions = useTradeStore((state) => state.transactions);

  const [rail, setRail] = useState<RailFilter>('All Rails');
  const [method, setMethod] = useState<MethodFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All Status');

  const methodOptions = useMemo<MethodFilter[]>(() => {
    const fiatRails = [
      ...new Set(
        transactions
          .filter((transaction) => FIAT_METHOD_SET.includes(transaction.method))
          .map((transaction) => transaction.method),
      ),
    ] as MethodFilter[];

    const cryptoAssets = [
      ...new Set(
        transactions
          .filter((transaction) => transaction.method === 'Crypto')
          .map((transaction) => transaction.asset),
      ),
    ] as MethodFilter[];

    if (rail === 'Fiat') {
      return ['All', ...fiatRails];
    }

    if (rail === 'Crypto') {
      return ['All', ...cryptoAssets];
    }

    return ['All', ...fiatRails, ...cryptoAssets];
  }, [transactions, rail]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (
        rail === 'Fiat' &&
        !FIAT_METHOD_SET.includes(transaction.method)
      ) {
        return false;
      }

      if (rail === 'Crypto' && transaction.method !== 'Crypto') {
        return false;
      }

      if (method !== 'All') {
        const matches = FIAT_METHOD_SET.includes(method)
          ? transaction.method === method
          : transaction.asset === (method as AssetSymbol);

        if (!matches) {
          return false;
        }
      }

      if (status !== 'All Status' && transaction.status !== status) {
        return false;
      }

      return true;
    });
  }, [transactions, rail, method, status]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Txn ID',
        cell: (info) => (
          <span className="font-mono text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => <TypeTag type={info.getValue()} />,
      }),
      columnHelper.accessor('asset', {
        header: 'Asset',
        cell: (info) => (
          <span className="font-semibold text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => {
          const transaction = info.row.original;

          return (
            <span className="font-mono text-foreground">
              {fmtAsset(transaction.asset, info.getValue())}
            </span>
          );
        },
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('created', {
        header: 'Created',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('reason', {
        header: 'Note / Reason',
        cell: (info) => {
          const reason = info.getValue();
          const isRFI = info.row.original.status === 'RFI Hold';

          if (!reason) {
            return <span className="text-muted-foreground">—</span>;
          }

          return (
            <TooltipCell
              text={reason}
              className={cn(
                'inline-block max-w-56 cursor-default overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground',
                isRFI && 'text-primary',
              )}
            >
              {isRFI ? '⚠ ' : ''}
              {reason}
            </TooltipCell>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowCount = table.getRowModel().rows.length;

  const onRailChange = (nextRail: RailFilter) => {
    setRail(nextRail);
    setMethod('All');
  };

  const methodLabel = (value: MethodFilter | '') =>
    value === 'All' || value === '' ? 'All Methods' : value;

  const downloadStatement = () => {
    const statementRows = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      asset: transaction.asset,
      amount: transaction.amount,
      method: transaction.method,
      status: transaction.status,
      created: transaction.created,
      reason: transaction.reason,
    }));

    const csv = [
      'id,type,asset,amount,method,status,created,reason',
      ...statementRows.map((row) =>
        [
          row.id,
          row.type,
          row.asset,
          row.amount,
          row.method,
          row.status,
          row.created,
          row.reason,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'statement.csv';
    anchor.click();

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
          onChange={onRailChange}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-background"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 whitespace-nowrap bg-background px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-3 py-3 align-middle text-sm text-muted-foreground"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {rowCount === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
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
        {rowCount} rows
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
          ? 'bg-success/10 text-success'
          : 'bg-warning/10 text-warning',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}
