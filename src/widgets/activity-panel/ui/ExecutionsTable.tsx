import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { fmtAsset } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Dropdown } from '@/shared/ui/Dropdown';
import { useTradeStore } from '@/store/useTradeStore';
import type { ExecutionStatus } from '@/types';

import { StatusBadge } from './StatusBadge';

type ExecutionRow = ReturnType<typeof useTradeStore.getState>['executions'][number];

const STATUS_OPTS: Array<'All Status' | ExecutionStatus> = [
  'All Status',
  'Executed',
  'Pending',
  'Rejected',
];

const columnHelper = createColumnHelper<ExecutionRow>();

/** Executions table with status and search filtering. */
export function ExecutionsTable() {
  const executions = useTradeStore((state) => state.executions);
  const [status, setStatus] = useState<'All Status' | ExecutionStatus>(
    'All Status',
  );
  const [query, setQuery] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Order ID',
        cell: (info) => (
          <span className="font-mono text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('pair', {
        header: 'Pair',
        cell: (info) => (
          <span className="font-semibold text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('side', {
        header: 'Side',
        cell: (info) => <SideTag side={info.getValue()} />,
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => {
          const execution = info.row.original;

          return (
            <span className="font-mono text-foreground">
              {fmtAsset(execution.asset, info.getValue())}{' '}
              <span className="text-xs text-muted-foreground">
                {execution.asset}
              </span>
            </span>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => (
          <span className="font-mono text-foreground">
            {info.getValue().toLocaleString('en-US')}
          </span>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-mono text-foreground">
            {info.getValue().toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </span>
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
      columnHelper.accessor('executed', {
        header: 'Executed',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );

  const filteredExecutions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return executions.filter((execution) => {
      if (status !== 'All Status' && execution.status !== status) {
        return false;
      }

      if (
        q &&
        !execution.pair.toLowerCase().includes(q) &&
        !execution.id.toLowerCase().includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [executions, query, status]);

  const table = useReactTable({
    data: filteredExecutions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowCount = table.getRowModel().rows.length;

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
                  No executions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-xs text-muted-foreground">{rowCount} rows</div>
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