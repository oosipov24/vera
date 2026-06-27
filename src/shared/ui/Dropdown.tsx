import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface DropdownOption<T extends string = string> {
  value: T;
  label?: ReactNode;
  search?: string;
}

interface DropdownProps<T extends string> {
  value: T | '';
  options: readonly (DropdownOption<T> | T)[];
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  renderValue?: (value: T | '') => ReactNode;
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select',
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  renderValue,
}: DropdownProps<T>) {
  const [query, setQuery] = useState('');

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string'
          ? {
              value: option as T,
              label: option,
              search: option,
            }
          : {
              value: option.value,
              label: option.label ?? option.value,
              search: option.search ?? String(option.label ?? option.value),
            },
      ),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!searchable || !normalizedQuery) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) =>
      option.search.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedOptions, query, searchable]);

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        onChange(nextValue as T);
        setQuery('');
      }}
    >
      <SelectTrigger
        className={cn(
          'h-7 rounded-r8 border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-none',
          className,
        )}
      >
        <SelectValue placeholder={placeholder}>
          {renderValue ? renderValue(value) : selectedOption?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        position="popper"
        sideOffset={4}
        className={cn(
          'z-[9999] max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-r8',
          'border border-border bg-dropdown-surface px-1 text-dropdown-foreground shadow-2xl',
          'outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0',
        )}
      >
        {searchable && (
          <div className="sticky top-0 z-10 border-b border-dropdown-border bg-dropdown-surface px-3 py-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
              placeholder={searchPlaceholder}
              className="h-7 rounded-none border-0 bg-transparent px-0 py-0 text-xs font-medium text-foreground shadow-none outline-none placeholder:text-dropdown-placeholder focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}

        <div className="max-h-64 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="h-8 cursor-pointer rounded-r6 pl-8 pr-2.5 text-xs font-medium text-dropdown-muted focus:bg-dropdown-option-hover focus:text-dropdown-foreground data-[state=checked]:text-foreground"
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}