import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const statusClassName =
    normalizedStatus === 'executed' || normalizedStatus === 'completed'
      ? 'bg-success-surface/10 text-success-action'
      : normalizedStatus === 'pending'
        ? 'bg-warning-surface text-warning'
        : 'bg-danger-surface text-danger-action';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-r4 px-2 py-0.5 !text-caption font-bold uppercase',
        statusClassName,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
