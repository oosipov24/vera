import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

// Local dropdown with the same API as the legacy component.
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

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('keydown', onDocumentKeyDown);

    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('keydown', onDocumentKeyDown);
    };
  }, [open]);

  const normalizeOption = (option: DropdownOption<T> | T): DropdownOption<T> =>
    typeof option === 'string' ? { value: option } : option;

  const normalizedOptions = options.map(normalizeOption);

  const filteredOptions = query
    ? normalizedOptions.filter((option) =>
        (option.search ?? option.value)
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : normalizedOptions;

  const triggerContent = renderValue
    ? renderValue(value)
    : value || <span className="text-muted-foreground">{placeholder}</span>;

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors',
          'hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          open && 'border-ring ring-[3px] ring-ring/50',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 flex-1 truncate">{triggerContent}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-full min-w-40 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          id={id}
          role="listbox"
        >
          {searchable && (
            <div className="border-b border-border p-2">
              <Input
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No matches
              </div>
            )}

            {filteredOptions.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    selected
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground',
                  )}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label ?? option.value}
                  </span>

                  {selected && <Check className="size-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}