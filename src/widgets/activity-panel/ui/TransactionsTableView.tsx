import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fmtAsset } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Dropdown } from '@/shared/ui/Dropdown';
import { TooltipCell } from '@/shared/ui/feedback';
import type { AssetSymbol, MethodFilter, RailFilter, StatusFilter } from '@/types';

import { StatusBadge } from './StatusBadge';

export interface TransactionTableRow {
  id: string;
  type: string;
  asset: AssetSymbol;
  amount: number;
  method: string;
  status: Exclude<StatusFilter, 'All Status'>;
  created: string;
  reason?: string;
}

interface TransactionsTableViewProps {
  rows: TransactionTableRow[];
  status: StatusFilter;
  statusOptions: StatusFilter[];
  rail: RailFilter;
  railOptions: RailFilter[];
  method: MethodFilter;
  methodOptions: MethodFilter[];
  createdDate: string;
  onStatusChange: (status: StatusFilter) => void;
  onRailChange: (rail: RailFilter) => void;
  onMethodChange: (method: MethodFilter) => void;
  onCreatedDateChange: (date: string) => void;
  onDownloadStatement: () => void;
}

const columnHelper = createColumnHelper<TransactionTableRow>();

const FILTER_CONTROL_CLASS =
  'h-8 w-36 rounded-r8 border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground';

const STATEMENT_BUTTON_CLASS =
  'ml-auto h-8 gap-2 rounded-r8 border-border bg-popover px-2 py-1 text-xs font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground';

export function TransactionsTableView({
  rows,
  status,
  statusOptions,
  rail,
  railOptions,
  method,
  methodOptions,
  createdDate,
  onStatusChange,
  onRailChange,
  onMethodChange,
  onCreatedDateChange,
  onDownloadStatement,
}: TransactionsTableViewProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Txn ID',
        cell: (info) => (
          <span className="trading-mono text-muted-foreground">
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
          <span className="font-semibold text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => {
          const transaction = info.row.original;

          return (
            <span className="trading-mono text-muted-foreground">
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
          <span className="trading-mono text-xs text-muted-foreground">
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
                isRFI && 'text-warning',
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
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowCount = table.getRowModel().rows.length;

  const methodLabel = (value: MethodFilter | '') =>
    value === 'All' || value === '' ? 'All Methods' : value;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-muted-foreground">
        <Dropdown
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
          className={FILTER_CONTROL_CLASS}
      
        />

        <Dropdown
          value={rail}
          options={railOptions}
          onChange={onRailChange}
          className={FILTER_CONTROL_CLASS}
        />

        <Dropdown
          value={method}
          options={methodOptions}
          onChange={onMethodChange}
          className={FILTER_CONTROL_CLASS}
          renderValue={(value) => methodLabel(value)}
        />

        <Input
          type="date"
          aria-label="Created date"
          className={FILTER_CONTROL_CLASS}
          value={createdDate}
          onChange={(event) => onCreatedDateChange(event.target.value)}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={STATEMENT_BUTTON_CLASS}
          onClick={onDownloadStatement}
        >
          <Download className="size-4" />
          Statement
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
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
                    className="sticky top-0 z-10 whitespace-nowrap bg-background px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-foreground"
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
        'inline-flex items-center gap-1.5 rounded-r4 px-2.5 py-1 text-xs font-bold uppercase',
        isDeposit
          ? 'bg-success-surface text-success-action'
          : 'bg-warning-surface text-warning',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}
