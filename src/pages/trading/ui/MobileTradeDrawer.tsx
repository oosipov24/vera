import type { ReactNode } from 'react';
import { ReceiptText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileTradeDrawerProps {
  children: ReactNode;
}

export function MobileTradeDrawer({ children }: MobileTradeDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="fixed left-0 top-1/2 z-40 h-auto -translate-y-1/2 rounded-l-none rounded-r8 border-border bg-popover px-2 py-3 text-[10px] font-bold uppercase tracking-wide text-primary shadow-2xl hover:bg-accent hover:text-primary lg:hidden"
          aria-label="Open trade panel"
        >
          <span className="flex flex-col items-center gap-1">
            <ReceiptText className="size-4" />
            <span className="">Trade</span>
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex h-dvh w-[min(340px,calc(100vw-2.5rem))] flex-col overflow-hidden border-border bg-background p-0 lg:hidden"
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3 text-left">
          <SheetTitle className="text-sm font-bold">Trade</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}