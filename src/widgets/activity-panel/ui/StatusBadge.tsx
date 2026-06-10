import type { ExecutionStatus, TxnStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<string, string> = {
  Executed: 'bg-success/10 text-success',
  Completed: 'bg-success/10 text-success',
  Pending: 'bg-warning/10 text-warning',
  'RFI Hold': 'bg-primary/10 text-primary',
  Rejected: 'bg-destructive/10 text-destructive',
};

/** Coloured status pill used in both activity tables. */
export function StatusBadge({ status }: { status: ExecutionStatus | TxnStatus }) {
  const tone = STATUS_CLASS[status] ?? 'bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
