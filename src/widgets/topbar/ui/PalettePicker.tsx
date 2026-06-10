import { Palette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PALETTES } from '@/constants/market';
import { useUiStore } from '@/store/useUiStore';

/**
 * Accent palette picker. Opens a popover of swatches; selecting one retints the
 * whole platform via the UI store, which calls the palette engine.
 */
export function PalettePicker() {
  const paletteIndex = useUiStore((state) => state.paletteIndex);
  const setPalette = useUiStore((state) => state.setPalette);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

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
                  index === paletteIndex && 'border-foreground',
                )}
                style={{ background: palette.sw }}
                title={palette.name}
                aria-label={palette.name}
                onClick={() => {
                  setPalette(index);
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
