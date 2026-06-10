import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import type { AssetSymbol, PortfolioView } from '@/types';
import { BalanceCard } from './BalanceCard';
import { MAJORS, STABLES, FIAT_SET } from '@/constants/assets';
import { fmtMoneyParts } from '@/lib/format';
import {
  grandTotalUSD,
  fiatTotalUSD,
  majorsTotalUSD,
  stablesTotalUSD,
} from '@/lib/valuation';

interface PortfolioProps {
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

const VIEWS: Array<{ key: PortfolioView; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'fiat', label: 'Fiat' },
  { key: 'stables', label: 'Stables' },
  { key: 'majors', label: 'Majors' },
];

type SectionKey = 'fiat' | 'majors' | 'stables';

const ALL_SECTIONS: Array<{
  key: SectionKey;
  label: string;
  set: AssetSymbol[];
  note?: boolean;
}> = [
  { key: 'fiat', label: 'Fiat Balances', set: FIAT_SET, note: true },
  { key: 'majors', label: 'Major Crypto', set: MAJORS },
  { key: 'stables', label: 'Stablecoins', set: STABLES },
];

/** Right column: portfolio value, view tabs, and balance lists. */
export function Portfolio({ onDeposit, onWithdraw }: PortfolioProps) {
  const balances = useTradeStore((state) => state.balances);
  const displayCcy = useUiStore((state) => state.displayCcy);
  const setDisplayCcy = useUiStore((state) => state.setDisplayCcy);

  const [view, setView] = useState<PortfolioView>('all');
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    fiat: false,
    majors: false,
    stables: false,
  });

  const segUSD = useMemo(() => {
    switch (view) {
      case 'fiat':
        return fiatTotalUSD(balances);
      case 'stables':
        return stablesTotalUSD(balances);
      case 'majors':
        return majorsTotalUSD(balances);
      default:
        return grandTotalUSD(balances);
    }
  }, [view, balances]);

  const { whole, cents, symbol } = fmtMoneyParts(segUSD, displayCcy);

  const toggleSection = (key: SectionKey) => {
    setCollapsed((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const heldIn = (set: AssetSymbol[]) =>
    set.filter((asset) => (balances[asset] ?? 0) > 0);

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
              onClick={() => setDisplayCcy('USD')}
            >
              USD
            </Button>

            <Button
              type="button"
              size="sm"
              variant={displayCcy === 'EUR' ? 'default' : 'ghost'}
              className="h-7 px-3 font-mono text-xs"
              onClick={() => setDisplayCcy('EUR')}
            >
              EUR
            </Button>
          </div>
        </div>

        <div className="font-mono text-4xl font-bold tracking-tight text-emerald-500">
          {symbol}
          {whole}
          <span className="text-2xl opacity-60">{cents}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-muted p-1">
        {VIEWS.map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={view === item.key ? 'default' : 'ghost'}
            className="h-8 px-2 text-xs font-bold"
            onClick={() => setView(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'all' ? (
          <AllView
            collapsed={collapsed}
            toggleSection={toggleSection}
            heldIn={heldIn}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ) : (
          <SingleView
            view={view}
            balances={balances}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        )}
      </div>
    </aside>
  );
}

function AllView({
  collapsed,
  toggleSection,
  heldIn,
  onDeposit,
  onWithdraw,
}: {
  collapsed: Record<SectionKey, boolean>;
  toggleSection: (key: SectionKey) => void;
  heldIn: (set: AssetSymbol[]) => AssetSymbol[];
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}) {
  const sections = ALL_SECTIONS.map((section) => ({
    ...section,
    held: heldIn(section.set),
  })).filter((section) => section.held.length > 0);

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
            onClick={() => toggleSection(section.key)}
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

              {section.held.map((asset) => (
                <BalanceCard
                  key={asset}
                  asset={asset}
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

function SingleView({
  view,
  balances,
  onDeposit,
  onWithdraw,
}: {
  view: Exclude<PortfolioView, 'all'>;
  balances: Record<string, number | undefined>;
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}) {
  const config: Record<
    Exclude<PortfolioView, 'all'>,
    { set: AssetSymbol[]; label: string; note?: boolean }
  > = {
    fiat: { set: FIAT_SET, label: 'Fiat Balances', note: true },
    stables: { set: STABLES, label: 'Stablecoin Balances' },
    majors: { set: MAJORS, label: 'Major Crypto Balances' },
  };

  const { set, label, note } = config[view];
  const held = set.filter((asset) => (balances[asset] ?? 0) > 0);

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      {note && (
        <div className="text-xs text-muted-foreground">
          Indicative. Confirm with statement.
        </div>
      )}

      {held.length === 0 ? (
        <EmptyState>No balances in this segment</EmptyState>
      ) : (
        held.map((asset) => (
          <BalanceCard
            key={asset}
            asset={asset}
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