import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const statusClassName =
    normalizedStatus === 'executed' || normalizedStatus === 'completed'
      ? 'bg-success-surface text-success-action'
      : normalizedStatus === 'pending'
        ? 'bg-warning-surface text-warning'
        : 'bg-danger-surface text-danger-action';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-r8 px-2.5 py-1 text-control-sm font-bold uppercase',
        statusClassName,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}