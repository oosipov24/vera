import type { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
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

function normalizeOption<T extends string>(
  option: DropdownOption<T> | T,
): DropdownOption<T> {
  return typeof option === 'string' ? { value: option } : option;
}

/**
 * Shared select wrapper backed by shadcn/ui Select.
 *
 * The searchable props are kept for API compatibility with the old local
 * dropdown. Searchable selects should later move to a Popover + Command wrapper.
 */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className,
  renderValue,
}: DropdownProps<T>) {
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  const triggerContent = renderValue
    ? renderValue(value)
    : selectedOption?.label ??
      (value ? value : <span className="text-muted-foreground">{placeholder}</span>);

  return (
    <Select
      value={value || undefined}
      onValueChange={(nextValue) => onChange(nextValue as T)}
    >
      <SelectTrigger
        className={cn(
          'h-10 min-w-32 rounded-md border-border bg-background px-3 text-sm text-foreground shadow-none',
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {triggerContent}
        </span>
      </SelectTrigger>

      <SelectContent>
        {normalizedOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label ?? option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}