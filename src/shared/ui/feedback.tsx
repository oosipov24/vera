import { useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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
