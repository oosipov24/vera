import { Check, CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastContentProps {
  title: string;
  message?: string;
  type: ToastKind;
}

const TOAST_ICON_CLASS: Record<ToastKind, string> = {
  success: 'border-success-action/25 bg-success-surface/20 text-success-action',
  error: 'border-danger-action/25 bg-danger-surface/20 text-danger-action',
  info: 'border-primary/30 bg-primary/10 text-primary',
};

const TOAST_ICON: Record<ToastKind, ReactNode> = {
  success: <Check className="size-3.5" />,
  error: <CircleAlert className="size-3.5" />,
  info: <Info className="size-3.5" />,
};

export function ToastContent({ title, message, type }: ToastContentProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
          TOAST_ICON_CLASS[type],
        )}
        aria-hidden="true"
      >
        {TOAST_ICON[type]}
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold leading-5 text-foreground">
          {title}
        </div>

        {message && (
          <div className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}