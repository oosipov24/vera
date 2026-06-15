import { Check, CircleAlert, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info';

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

export const showToast = {
  success: (title: string, message?: string) =>
    toast(<ToastContent type="success" title={title} message={message} />, {
      type: 'success',
    }),

  error: (title: string, message?: string) =>
    toast(<ToastContent type="error" title={title} message={message} />, {
      type: 'error',
    }),

  info: (title: string, message?: string) =>
    toast(<ToastContent type="info" title={title} message={message} />, {
      type: 'info',
    }),
};

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4200}
      hideProgressBar
      newestOnTop
      closeOnClick={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      transition={Slide}
      icon={false}
      className="top-16 w-[36rem] max-w-[calc(100vw-2rem)] p-0"
      toastClassName={() =>
        'relative mb-3 min-h-0 rounded-r8 border border-border bg-popover px-5 py-5 pr-14 text-popover-foreground shadow-2xl'
      }
      closeButton={({ closeToast }) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-4 top-4 size-8 rounded-r8 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
          onClick={closeToast}
          aria-label="Dismiss notification"
        >
          <X className="size-5" />
        </Button>
      )}
    />
  );
}