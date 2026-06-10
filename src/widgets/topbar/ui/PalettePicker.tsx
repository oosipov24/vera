import { Palette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { PALETTES } from '@/constants/market';
import { cn } from '@/lib/utils';

const PALETTE_SWATCH_CLASS_NAMES = [
  'bg-[var(--palette-0)]',
  'bg-[var(--palette-1)]',
  'bg-[var(--palette-2)]',
  'bg-[var(--palette-3)]',
  'bg-[var(--palette-4)]',
  'bg-[var(--palette-5)]',
  'bg-[var(--palette-6)]',
  'bg-[var(--palette-7)]',
] as const;

interface PalettePickerProps {
  paletteIndex: number;
  onPaletteChange: (index: number) => void;
}

/**
 * Accent palette picker. UI-only component.
 */
export function PalettePicker({
  paletteIndex,
  onPaletteChange,
}: PalettePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        size="icon"
        variant="outline"
        title="Accent color"
        aria-label="Accent color"
        onClick={() => setOpen((current) => !current)}
      >
        <Palette className="size-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Accent color
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PALETTES.map((palette, index) => (
              <button
                key={palette.name}
                type="button"
                className={cn(
                  'relative size-8 rounded-full border-2 border-transparent transition-transform hover:scale-110',
                  PALETTE_SWATCH_CLASS_NAMES[index] ?? 'bg-primary',
                  index === paletteIndex && 'border-foreground',
                )}
                title={palette.name}
                aria-label={palette.name}
                onClick={() => {
                  onPaletteChange(index);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}