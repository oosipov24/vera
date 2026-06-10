import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { PALETTES } from '@/constants/market';

/**
 * Accent palette picker. Opens a popover of swatches; selecting one retints the
 * whole platform via the UI store (which calls the palette engine).
 */
export function PalettePicker() {
  const paletteIndex = useUiStore((s) => s.paletteIndex);
  const setPalette = useUiStore((s) => s.setPalette);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="theme-toggle"
        title="Accent color"
        aria-label="Accent color"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="6.3" cy="6.8" r="1.1" fill="currentColor" />
          <circle cx="11.7" cy="6.8" r="1.1" fill="currentColor" />
          <circle cx="6.3" cy="11.2" r="1.1" fill="currentColor" />
          <circle cx="11.7" cy="11.2" r="1.1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="palette-menu show">
          <div className="palette-title">Accent color</div>
          <div className="palette-grid">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                className={`palette-sw ${i === paletteIndex ? 'on' : ''}`}
                style={{ background: p.sw }}
                title={p.name}
                aria-label={p.name}
                onClick={() => setPalette(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
