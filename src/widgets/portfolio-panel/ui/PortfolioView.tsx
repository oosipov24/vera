import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  AssetSymbol,
  DisplayCurrency,
  PortfolioView as PortfolioSegment,
} from '@/types';

import { BalanceCard } from './BalanceCard';

export type SectionKey = 'fiat' | 'majors' | 'stables';

export interface PortfolioBalanceItem {
  asset: AssetSymbol;
  name: string;
  sub: string;
  amount: string;
  secondary: string;
}

export interface PortfolioSection {
  key: SectionKey;
  label: string;
  note?: boolean;
  items: PortfolioBalanceItem[];
}

interface PortfolioViewProps {
  displayCcy: DisplayCurrency;
  view: PortfolioSegment;
  views: Array<{ key: PortfolioSegment; label: string }>;
  total: {
    symbol: string;
    whole: string;
    cents: string;
  };
  sections: PortfolioSection[];
  currentSection: PortfolioSection | null;
  collapsed: Record<SectionKey, boolean>;
  onDisplayCcyChange: (ccy: DisplayCurrency) => void;
  onViewChange: (view: PortfolioSegment) => void;
  onToggleSection: (key: SectionKey) => void;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

/** Right column: portfolio value, view tabs, and balance lists. */
export function PortfolioView({
  displayCcy,
  view,
  views,
  total,
  sections,
  currentSection,
  collapsed,
  onDisplayCcyChange,
  onViewChange,
  onToggleSection,
  onDeposit,
  onWithdraw,
}: PortfolioViewProps) {
  return (
    <aside className="flex h-full flex-col gap-4 p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Estimated Portfolio Value
          </div>

          <div className="flex rounded-lg border border-border bg-muted p-1">
            <Button
              type="button"
              size="sm"
              variant={displayCcy === 'USD' ? 'default' : 'ghost'}
              className="h-7 px-3 font-mono text-xs"
              onClick={() => onDisplayCcyChange('USD')}
            >
              USD
            </Button>

            <Button
              type="button"
              size="sm"
              variant={displayCcy === 'EUR' ? 'default' : 'ghost'}
              className="h-7 px-3 font-mono text-xs"
              onClick={() => onDisplayCcyChange('EUR')}
            >
              EUR
            </Button>
          </div>
        </div>

        <div className="font-mono text-4xl font-bold tracking-tight text-success">
          {total.symbol}
          {total.whole}
          <span className="text-2xl opacity-60">{total.cents}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-muted p-1">
        {views.map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={view === item.key ? 'default' : 'ghost'}
            className="h-8 px-2 text-xs font-bold"
            onClick={() => onViewChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'all' ? (
          <AllPortfolioView
            sections={sections}
            collapsed={collapsed}
            onToggleSection={onToggleSection}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ) : currentSection ? (
          <SinglePortfolioView
            section={currentSection}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ) : (
          <EmptyState>No balances in this segment</EmptyState>
        )}
      </div>
    </aside>
  );
}

function AllPortfolioView({
  sections,
  collapsed,
  onToggleSection,
  onDeposit,
  onWithdraw,
}: {
  sections: PortfolioSection[];
  collapsed: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}) {
  if (sections.length === 0) {
    return <EmptyState>No balances yet</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.key}>
          <button
            type="button"
            className="flex w-full items-center gap-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onToggleSection(section.key)}
          >
            <ChevronRight
              className={cn(
                'size-4 shrink-0 transition-transform',
                !collapsed[section.key] && 'rotate-90',
              )}
            />
            <span>{section.label}</span>
          </button>

          {!collapsed[section.key] && (
            <div className="space-y-2 pb-3">
              {section.note && (
                <div className="text-xs text-muted-foreground">
                  Indicative. Confirm with statement.
                </div>
              )}

              {section.items.map((item) => (
                <BalanceCard
                  key={item.asset}
                  asset={item.asset}
                  name={item.name}
                  sub={item.sub}
                  amount={item.amount}
                  secondary={item.secondary}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SinglePortfolioView({
  section,
  onDeposit,
  onWithdraw,
}: {
  section: PortfolioSection;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {section.label}
      </div>

      {section.note && (
        <div className="text-xs text-muted-foreground">
          Indicative. Confirm with statement.
        </div>
      )}

      {section.items.length === 0 ? (
        <EmptyState>No balances in this segment</EmptyState>
      ) : (
        section.items.map((item) => (
          <BalanceCard
            key={item.asset}
            asset={item.asset}
            name={item.name}
            sub={item.sub}
            amount={item.amount}
            secondary={item.secondary}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ))
      )}
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}