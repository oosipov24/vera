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

/** Executions table container with status and search filtering. */
export function ExecutionsTable() {
  const executions = useTradeStore((state) => state.executions);

  const [status, setStatus] = useState<'All Status' | ExecutionStatus>(
    'All Status',
  );
  const [query, setQuery] = useState('');

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

  return (
    <ExecutionsTableView
      rows={filteredExecutions}
      status={status}
      statusOptions={STATUS_OPTS}
      query={query}
      onStatusChange={setStatus}
      onQueryChange={setQuery}
    />
  );
}