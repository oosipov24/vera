import { useState, type ReactNode, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/useUiStore';



//  Toaster 
const TOAST_ICON: Record<string, ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 4.5v4M8 11h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 7.5v4M8 5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
};

// Renders the live toast queue (top-right). Reads from the UI store
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`} role="status">
          <div className="toast-ico">{TOAST_ICON[t.kind]}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
          <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

//  Tooltip (truncated cell hover) 
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

  const show = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // Estimate the bubble height; refined for above/below placement only.
    const estH = 36;
    const above = r.top - estH - 12 > 8;
    setTip({
      top: above ? r.top - 10 : r.bottom + 10,
      left: r.left,
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
            className={`vtip ${tip.place}`}
            style={{
              top: tip.top,
              left: Math.min(Math.max(8, tip.left), window.innerWidth - 292),
              transform: tip.place === 'above' ? 'translateY(-100%)' : undefined,
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
