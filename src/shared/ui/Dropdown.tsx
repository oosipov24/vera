import { useEffect, useId, useRef, useState, type ReactNode, type ChangeEvent } from 'react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label?: ReactNode;
  search?: string;
}

interface DropdownProps<T extends string> {
  value: T | '';
  options: Array<DropdownOption<T> | T>;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  renderValue?: (value: T | '') => ReactNode;
}

// Local dropdown
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  searchPlaceholder = 'Search…',
  className,
  renderValue,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const norm = (o: DropdownOption<T> | T): DropdownOption<T> =>
    typeof o === 'string' ? { value: o } : o;
  const opts = options.map(norm);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = query
    ? opts.filter((o) => (o.search ?? o.value).toLowerCase().includes(query.toLowerCase()))
    : opts;

  const triggerContent = renderValue
    ? renderValue(value)
    : value || <span className="ph">{placeholder}</span>;

  return (
    <div className={`dd ${className ?? ''}`} ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`dd-trig ${open ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dd-val">{triggerContent}</span>
        <svg className="dd-caret" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="dd-menu open" id={id} role="listbox">
          {searchable && (
            <div className="dd-search-wrap">
              <input
                className="dd-search-inp"
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="dd-list">
            {filtered.length === 0 && <div className="dd-empty">No matches</div>}
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={`dd-opt ${o.value === value ? 'sel' : ''}`}
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
              >
                {o.label ?? o.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
