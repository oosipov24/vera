import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Dropdown } from '@/shared/ui/Dropdown';
import type { AssetSymbol, ExecutionStatus } from '@/types';

import { StatusBadge } from './StatusBadge';

const FILTER_CONTROL_CLASS =
  'h-8 w-36 rounded-r8 border-border bg-card px-2 py-1 text-xs font-normal text-muted-foreground hover:border-primary';

const FILTER_CONTROL_CLASS_DATE =
'h-8 w-36 rounded-r8 border-border bg-card px-2 py-1 text-xs !font-mono font-normal text-muted-foreground hover:border-primary';

const SEARCH_CONTROL_CLASS =
  'h-8 w-36 rounded-r8 border-border bg-card px-2 py-1 text-xs hover:border-primary';

const FOOTER_BUTTON_CLASS =
  'h-8 rounded-r8 border-border bg-popover px-3 py-1 text-xs  font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground';

const PAGE_SIZE_OPTIONS = ['10', '20', '50'] as const;

type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

const COLUMN_LABELS: Record<string, string> = {
  id: 'OrderId',
  pair: 'CurrencyPair',
  side: 'Side',
  amount: 'Amount',
  price: 'Price',
  total: 'Total',
  status: 'Status',
  created: 'CreatedAt',
  executed: 'ExecutedAt',
};

export interface ExecutionTableRow {
  id: string;
  pair: string;
  side: string;
  asset: AssetSymbol;
  amount: number;
  price: number;
  total: number;
  status: ExecutionStatus;
  created: string;
  executed: string;
}

interface ExecutionsTableViewProps {
  rows: ExecutionTableRow[];
  status: 'All Status' | ExecutionStatus;
  statusOptions: Array<'All Status' | ExecutionStatus>;
  query: string;
  createdDate?: string;
  executedDate?: string;
  onStatusChange: (status: 'All Status' | ExecutionStatus) => void;
  onQueryChange: (query: string) => void;
  onCreatedDateChange?: (date: string) => void;
  onExecutedDateChange?: (date: string) => void;
}

const columnHelper = createColumnHelper<ExecutionTableRow>();

export function ExecutionsTableView({
  rows,
  status,
  statusOptions,
  query,
  createdDate,
  executedDate,
  onCreatedDateChange,
  onExecutedDateChange,
  onStatusChange,
  onQueryChange,
}: ExecutionsTableViewProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [columnSearch, setColumnSearch] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Order ID',
        cell: (info) => (
          <span className="font-mono text-dropdown-muted text-control-lg">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('pair', {
        header: 'Pair',
        cell: (info) => (
          <span className="font-bold text-dropdown-muted text-control-lg">
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
            <span className="trading-mono text-xs font-bold text-dropdown-muted">
              {formatExecutionAmount(info.getValue())}{' '}
              <span className="text-dropdown-placeholder font-normal text-caption">
                {execution.asset}
              </span>
            </span>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => (
          <span className="font-mono text-dropdown-muted">
            {info.getValue().toLocaleString('en-US')}
          </span>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-mono text-dropdown-muted">
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
          <span className="font-mono text-xs text-dropdown-muted">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('executed', {
        header: 'Executed',
        cell: (info) => (
          <span className="font-mono text-xs text-dropdown-muted">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rowCount = table.getPrePaginationRowModel().rows.length;
  const visibleRows = table.getRowModel().rows;
  const pageSizeValue = String(pagination.pageSize) as PageSizeOption;
  const normalizedColumnSearch = columnSearch.trim().toLowerCase();
  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const filteredColumns = hideableColumns.filter((column) =>
    getColumnLabel(column.id).toLowerCase().includes(normalizedColumnSearch),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-muted-foreground">
        <Dropdown
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
          className={FILTER_CONTROL_CLASS}
        />

        <Input
          className={SEARCH_CONTROL_CLASS}
          placeholder="Search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        
        <Input
          type="date"
          aria-label="Created date"
          className={FILTER_CONTROL_CLASS_DATE}
          value={createdDate ?? ''}
          onChange={(event) => onCreatedDateChange?.(event.target.value)}
        />

        <Input
          type="date"
          aria-label="Executed date"
          className={FILTER_CONTROL_CLASS_DATE}
          value={executedDate ?? ''}
          onChange={(event) => onExecutedDateChange?.(event.target.value)}
        />

      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-background"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 whitespace-nowrap bg-background px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground"
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
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/40 "
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-2 py-2 align-middle text-xs text-muted-foreground"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {rowCount === 0 && (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-3 py-8 text-center text-xs text-muted-foreground"
                >
                  No executions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <div className="text-xs text-muted-foreground">{rowCount} rows</div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={FOOTER_BUTTON_CLASS}
              >
                Columns
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-[80] w-48 rounded-r8 border border-border bg-popover p-1 text-popover-foreground shadow-2xl"
            >
              <div className="border-b border-border px-2 py-2">
                <Input
                  value={columnSearch}
                  onChange={(event) => setColumnSearch(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder="Search columns..."
                  className="h-8 rounded-r8 border-border bg-card px-2 py-1 text-xs"
                />
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {filteredColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                    onSelect={(event) => event.preventDefault()}
                    className="h-8 rounded-r6 px-2 pr-8 text-xs font-medium text-muted-foreground focus:bg-muted focus:text-foreground"
                  >
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}

                {filteredColumns.length === 0 && (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    No columns found
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dropdown
            value={pageSizeValue}
            options={PAGE_SIZE_OPTIONS}
            onChange={(value) => table.setPageSize(Number(value))}
            className="h-8 w-14 rounded-r8 border-border bg-popover px-2 py-1 text-xs !font-mono font-semibold text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

function getColumnLabel(columnId: string) {
  return COLUMN_LABELS[columnId] ?? columnId;
}

function SideTag({ side }: { side: string }) {
  const isBuy = side.toLowerCase() === 'buy';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-r4 px-2 py-0.5 !text-caption font-bold uppercase',
        isBuy
          ? 'bg-success-surface/10 text-success-action'
          : 'bg-danger-surface text-danger-action',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {side}
    </span>
  );
}

function formatExecutionAmount(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}
