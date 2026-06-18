import type { ReactNode } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipCellProps {
  text: string;
  className?: string;
  children: ReactNode;
}

// Shows the full text of a cropped cell using the shadcn tooltip primitive.
export function TooltipCell({ text, className, children }: TooltipCellProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>

      <TooltipContent className="max-w-72 text-xs leading-5">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
