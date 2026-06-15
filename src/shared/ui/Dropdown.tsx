import type { ReactNode } from 'react';

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

function normalizeOption<T extends string>(
  option: DropdownOption<T> | T,
): DropdownOption<T> {
  return typeof option === 'string' ? { value: option } : option;
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className,
  renderValue,
}: DropdownProps<T>) {
  const normalizedOptions = options.map(normalizeOption);

  const placeholderContent = renderValue ? (
    renderValue('')
  ) : (
    <span className="text-dropdown-placeholder">{placeholder}</span>
  );

  return (
    <Select
      value={value || undefined}
      onValueChange={(nextValue) => onChange(nextValue as T)}
    >
      <SelectTrigger
        className={cn(
          'h-9 rounded-[8px] border border-border bg-card px-[11px] text-left text-xs font-medium text-dropdown-foreground shadow-none',
          'hover:bg-muted focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary data-[state=open]:bg-muted',
          className,
        )}
      >
        <SelectValue placeholder={placeholderContent} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        sideOffset={4}
        className={cn(
          'z-[9999] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px]',
          'border border-dropdown-border bg-dropdown-surface p-1 text-dropdown-foreground',
          'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4),0_16px_40px_-4px_rgba(0,0,0,0.5)]',
        )}
      >
        {normalizedOptions.map((option) => {
          const label = renderValue
            ? renderValue(option.value)
            : option.label ?? option.value;

          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                'cursor-pointer rounded-[6px] px-2.5 py-[7px] pl-8 text-xs font-medium text-dropdown-muted',
                'focus:bg-dropdown-option-hover focus:text-dropdown-foreground',
                'data-[state=checked]:text-dropdown-foreground',
                '[&_svg]:text-primary',
              )}
            >
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}