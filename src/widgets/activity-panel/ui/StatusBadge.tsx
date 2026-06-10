import type { ExecutionStatus, TxnStatus } from '@/types';

const STATUS_CLASS: Record<string, string> = {
  Executed: 'green',
  Completed: 'green',
  Pending: 'yellow',
  'RFI Hold': 'blue',
  Rejected: 'red',
};

/** Coloured status pill used in both activity tables. */
export function StatusBadge({ status }: { status: ExecutionStatus | TxnStatus }) {
  const tone = STATUS_CLASS[status] ?? 'gray';
  return (
    <span className={`status-badge ${tone}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
