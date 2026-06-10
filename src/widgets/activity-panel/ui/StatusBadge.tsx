import type { ExecutionStatus, TxnStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<string, string> = {
  Executed: 'bg-emerald-500/10 text-emerald-500',
  Completed: 'bg-emerald-500/10 text-emerald-500',
  Pending: 'bg-amber-500/10 text-amber-500',
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