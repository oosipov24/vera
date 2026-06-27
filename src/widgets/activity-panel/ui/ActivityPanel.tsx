import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ExecutionsTable } from './ExecutionsTable';
import { TransactionsTable } from './TransactionsTable';

type Tab = 'executions' | 'transactions';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'executions', label: 'Executions' },
  { value: 'transactions', label: 'Deposits/Withdrawals' },
];

/** Center activity area: tabbed Executions / Deposits-Withdrawals tables. */
export function ActivityPanel() {
  const [tab, setTab] = useState<Tab>('executions');

  return (
    <section className="flex min-h-0 flex-1 flex-col px-5 py-3">
      <div className="mb-4 flex gap-2 border-b border-border">
        {TABS.map((item) => {
          const active = tab === item.value;

          return (
            <Button
              key={item.value}
              type="button"
              variant="ghost"
              className={cn(
                '-mb-px h-auto rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-2 py-2 text-sm font-semibold text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground',
                active && 'border-primary text-foreground hover:text-foreground',
              )}
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab === 'executions' ? <ExecutionsTable /> : <TransactionsTable />}
    </section>
  );
}
