import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Check, ChevronDown, Download } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  query: string;
  createdDateFrom: string;
  createdDateTo: string;
  onStatusChange: (status: StatusFilter) => void;
  onRailChange: (rail: RailFilter) => void;
  onMethodChange: (method: MethodFilter) => void;
  onQueryChange: (query: string) => void;
  onCreatedDateFromChange: (date: string) => void;
  onCreatedDateToChange: (date: string) => void;
  onDownloadStatement: () => void;
}

const columnHelper = createColumnHelper<TransactionTableRow>();

const FILTER_CONTROL_CLASS =
  'h-8 w-auto rounded-r8 border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground hover:border-primary';

const FILTER_CONTROL_CLASS_DATE =
  'h-8 w-auto rounded-r8 border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground hover:border-primary !font-mono';

const SEARCH_CONTROL_CLASS =
  'h-8 w-36 rounded-r8 border-border bg-card px-2 py-1 text-xs hover:border-primary';

const STATEMENT_BUTTON_CLASS =
  'ml-auto h-8 gap-2 rounded-r8 border-border bg-popover px-2 py-1 text-xs font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground hover:border-primary';

const FOOTER_BUTTON_CLASS =
  'h-8 rounded-r8 border-border bg-popover px-3 py-1 text-xs font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground';

const PAGE_SIZE_OPTIONS = ['10', '20', '50'] as const;

type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

const COLUMN_LABELS: Record<string, string> = {
  id: 'TxnId',
  type: 'Type',
  asset: 'Asset',
  amount: 'Amount',
  method: 'Method',
  status: 'Status',
  created: 'CreatedAt',
  reason: 'Note / Reason',
};

export function TransactionsTableView({
  rows,
  status,
  statusOptions,
  rail,
  railOptions,
  method,
  methodOptions,
  query,
  createdDateFrom,
  createdDateTo,
  onStatusChange,
  onRailChange,
  onMethodChange,
  onQueryChange,
  onCreatedDateFromChange,
  onCreatedDateToChange,
  onDownloadStatement,
}: TransactionsTableViewProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [columnSearch, setColumnSearch] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Txn ID',
        cell: (info) => (
          <span className="trading-mono text-dropdown-muted">
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
          <span className="font-semibold text-dropdown-muted">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => {
          const transaction = info.row.original;

          return (
            <span className="trading-mono text-dropdown-muted">
              {fmtAsset(transaction.asset, info.getValue())}
            </span>
          );
        },
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: (info) => (
          <span className="text-dropdown-muted">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('created', {
        header: 'Created',
        cell: (info) => (
          <span className="trading-mono text-xs text-dropdown-muted">
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
            return <span className="text-dropdown-muted">—</span>;
          }

          return (
            <TooltipCell
              text={reason}
              className={cn(
                'inline-block max-w-56 cursor-default overflow-hidden text-ellipsis whitespace-nowrap text-dropdown-muted',
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
          className={SEARCH_CONTROL_CLASS}
          placeholder="Search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />

        <Input
          type="date"
          aria-label="Created date from"
          className={FILTER_CONTROL_CLASS_DATE}
          value={createdDateFrom}
          onChange={(event) => onCreatedDateFromChange(event.target.value)}
        />

        <Input
          type="date"
          aria-label="Created date to"
          className={FILTER_CONTROL_CLASS_DATE}
          value={createdDateTo}
          onChange={(event) => onCreatedDateToChange(event.target.value)}
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
            {visibleRows.map((row) => (
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
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <div className="text-xs text-muted-foreground">
          {rowCount} rows
        </div>

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

          <PageSizeDropdown
            value={pageSizeValue}
            onChange={(value) => table.setPageSize(Number(value))}
          />
        </div>
      </div>
    </div>
  );
}

function PageSizeDropdown({
  value,
  onChange,
}: {
  value: PageSizeOption;
  onChange: (value: PageSizeOption) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-14 justify-between rounded-r8 border-border bg-popover px-2 py-1 text-xs font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground"
        >
          {value}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[80] min-w-16 rounded-r8 border border-border bg-popover p-1 text-popover-foreground shadow-2xl"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className="h-8 rounded-r6 px-2 text-xs font-semibold text-muted-foreground focus:bg-muted focus:text-foreground"
          >
            <Check
              className={cn(
                'mr-2 size-3.5 text-primary opacity-0',
                option === value && 'opacity-100',
              )}
            />
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumnLabel(columnId: string) {
  return COLUMN_LABELS[columnId] ?? columnId;
}

function TypeTag({ type }: { type: string }) {
  const isDeposit = type.toLowerCase() === 'deposit';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-r4 px-2 py-0.5 !text-caption font-bold uppercase',
        isDeposit
          ? 'bg-success-surface/10 text-success-action'
          : 'bg-info-surface text-info',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}
