import { useMemo, useState } from 'react';

import { useTradeStore } from '@/store/useTradeStore';
import type { ExecutionStatus } from '@/types';

import { ExecutionsTableView } from './ExecutionsTableView';

const STATUS_OPTS: Array<'All Status' | ExecutionStatus> = [
  'All Status',
  'Executed',
  'Pending',
  'Rejected',
];

/** Executions table container with status, date and search filtering. */
export function ExecutionsTable() {
  const executions = useTradeStore((state) => state.executions);

  const [status, setStatus] = useState<'All Status' | ExecutionStatus>(
    'All Status',
  );
  const [query, setQuery] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [executedDate, setExecutedDate] = useState('');

  const filteredExecutions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return executions.filter((execution) => {
      if (status !== 'All Status' && execution.status !== status) {
        return false;
      }

      if (
        createdDate &&
        normalizeDateForFilter(execution.created) !== createdDate
      ) {
        return false;
      }

      if (
        executedDate &&
        normalizeDateForFilter(execution.executed) !== executedDate
      ) {
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
  }, [executions, query, status, createdDate, executedDate]);

  return (
    <ExecutionsTableView
      rows={filteredExecutions}
      status={status}
      statusOptions={STATUS_OPTS}
      query={query}
      createdDate={createdDate}
      executedDate={executedDate}
      onStatusChange={setStatus}
      onQueryChange={setQuery}
      onCreatedDateChange={setCreatedDate}
      onExecutedDateChange={setExecutedDate}
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