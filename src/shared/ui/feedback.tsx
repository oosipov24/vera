import { Info, X } from 'lucide-react';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/useUiStore';

const TOAST_TONE: Record<string, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-primary/20 bg-primary/10 text-primary',
};

const TOAST_ICON_TONE: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-500',
  error: 'bg-destructive/10 text-destructive',
  info: 'bg-primary/10 text-primary',
};

const TOAST_ICON: Record<string, ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 4.5v4M8 11h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  info: <Info className="size-4" />,
};

// Renders the live toast queue in the top-right corner.
export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismiss = useUiStore((state) => state.dismissToast);

  return (
    <div
      className="fixed right-4 top-4 z-[1000] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-lg',
            TOAST_TONE[toast.kind],
          )}
          role="status"
        >
          <div
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full',
              TOAST_ICON_TONE[toast.kind],
            )}
          >
            {TOAST_ICON[toast.kind]}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-foreground">
              {toast.title}
            </div>
            <div className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {toast.message}
            </div>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

interface TooltipCellProps {
  text: string;
  className?: string;
  children: ReactNode;
}

interface TipState {
  top: number;
  left: number;
  place: 'above' | 'below';
}

// Shows the full text of the cropped cell.
export function TooltipCell({ text, className, children }: TooltipCellProps) {
  const [tip, setTip] = useState<TipState | null>(null);

  const show = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 36;
    const above = rect.top - estimatedHeight - 12 > 8;

    setTip({
      top: above ? rect.top - 10 : rect.bottom + 10,
      left: rect.left,
      place: above ? 'above' : 'below',
    });
  };

  const hide = () => setTip(null);

  return (
    <>
      <span className={className} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>

      {tip &&
        createPortal(
          <div
            className="fixed z-[2000] max-w-72 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-lg"
            style={{
              top: tip.top,
              left: Math.min(Math.max(8, tip.left), window.innerWidth - 292),
              transform:
                tip.place === 'above' ? 'translateY(-100%)' : undefined,
            }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}