import { useMemo, useState } from 'react';

import { FIAT_METHODS } from '@/constants/assets';
import { useTradeStore } from '@/store/useTradeStore';
import type { AssetSymbol, MethodFilter, RailFilter, StatusFilter } from '@/types';

import { TransactionsTableView } from './TransactionsTableView';

const RAIL_OPTS: RailFilter[] = ['All Rails', 'Fiat', 'Crypto'];
const STATUS_OPTS: StatusFilter[] = [
  'All Status',
  'Completed',
  'Pending',
  'RFI Hold',
  'Rejected',
];

const FIAT_METHOD_SET: string[] = [...FIAT_METHODS];

/**
 * Deposits / withdrawals table container.
 *
 * Filters: payment rail, method, status, and created date.
 */
export function TransactionsTable() {
  const transactions = useTradeStore((state) => state.transactions);

  const [rail, setRail] = useState<RailFilter>('All Rails');
  const [method, setMethod] = useState<MethodFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All Status');
  const [createdDate, setCreatedDate] = useState('');

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
      if (rail === 'Fiat' && !FIAT_METHOD_SET.includes(transaction.method)) {
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

      if (
        createdDate &&
        normalizeDateForFilter(transaction.created) !== createdDate
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, rail, method, status, createdDate]);

  const onRailChange = (nextRail: RailFilter) => {
    setRail(nextRail);
    setMethod('All');
  };

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
    <TransactionsTableView
      rows={filteredTransactions}
      status={status}
      statusOptions={STATUS_OPTS}
      rail={rail}
      railOptions={RAIL_OPTS}
      method={method}
      methodOptions={methodOptions}
      createdDate={createdDate}
      onStatusChange={setStatus}
      onRailChange={onRailChange}
      onMethodChange={setMethod}
      onCreatedDateChange={setCreatedDate}
      onDownloadStatement={downloadStatement}
    />
  );
}

function normalizeDateForFilter(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const europeanMatch = trimmedValue.match(
    /^(\d{1,2})[./](\d{1,2})[./](\d{4})/,
  );

  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return '';
}
