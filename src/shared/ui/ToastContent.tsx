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
  success: 'bg-success-surface text-success-action',
  error: 'bg-danger-surface text-danger-action',
  info: 'bg-brand-surface text-primary',
};

const TOAST_ICON: Record<ToastKind, ReactNode> = {
  success: <Check className="size-4" />,
  error: <CircleAlert className="size-4" />,
  info: <Info className="size-4" />,
};

export function ToastContent({ title, message, type }: ToastContentProps) {
  return (
    <div className="flex min-w-0 items-start gap-4">
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
          TOAST_ICON_CLASS[type],
        )}
        aria-hidden="true"
      >
        {TOAST_ICON[type]}
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-lg font-bold leading-6 text-foreground">
          {title}
        </div>

        {message && (
          <div className="mt-1 text-base leading-7 text-muted-foreground">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}