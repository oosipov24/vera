import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function DataTableHead({ children }: { children: string }) {
  return (
    <th className="sticky top-0 z-10 whitespace-nowrap bg-background px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </th>
  );
}

export function DataTableCell({
  children,
  mono,
  strong,
  time,
  className,
}: {
  children: ReactNode;
  mono?: boolean;
  strong?: boolean;
  time?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-3 py-3 align-middle text-muted-foreground',
        mono && 'font-mono text-foreground',
        strong && 'font-semibold text-foreground',
        time && 'font-mono text-xs text-muted-foreground',
        className,
      )}
    >
      {children}
    </td>
  );
}
