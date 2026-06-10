import { useMemo, useState } from 'react';
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
const ALL_SECTIONS: Array<{ key: SectionKey; label: string; set: AssetSymbol[]; note?: boolean }> = [
  { key: 'fiat', label: 'Fiat Balances', set: FIAT_SET, note: true },
  { key: 'majors', label: 'Major Crypto', set: MAJORS },
  { key: 'stables', label: 'Stablecoins', set: STABLES },
];

/** Right column: portfolio value, view tabs, and balance lists. */
export function Portfolio({ onDeposit, onWithdraw }: PortfolioProps) {
  const balances = useTradeStore((s) => s.balances);
  const displayCcy = useUiStore((s) => s.displayCcy);
  const setDisplayCcy = useUiStore((s) => s.setDisplayCcy);

  const [view, setView] = useState<PortfolioView>('all');
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    fiat: false,
    majors: false,
    stables: false,
  });

  const segUSD = useMemo(() => {
    switch (view) {
      case 'fiat': return fiatTotalUSD(balances);
      case 'stables': return stablesTotalUSD(balances);
      case 'majors': return majorsTotalUSD(balances);
      default: return grandTotalUSD(balances);
    }
  }, [view, balances]);

  const { whole, cents, symbol } = fmtMoneyParts(segUSD, displayCcy);
  const toggleSection = (key: SectionKey) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const heldIn = (set: AssetSymbol[]) => set.filter((a) => (balances[a] ?? 0) > 0);

  return (
    <aside className="portfolio">
      <div className="port-total">
        <div className="port-total-head">
          <div className="port-total-label">Estimated Portfolio Value</div>
          <div className="ccy-switch">
            <button className={`ccy-btn ${displayCcy === 'USD' ? 'on' : ''}`} onClick={() => setDisplayCcy('USD')}>
              USD
            </button>
            <button className={`ccy-btn ${displayCcy === 'EUR' ? 'on' : ''}`} onClick={() => setDisplayCcy('EUR')}>
              EUR
            </button>
          </div>
        </div>
        <div className="port-total-val">
          {symbol}
          {whole}
          <span>{cents}</span>
        </div>
      </div>

      <div className="port-toggle">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={`pt-btn ${view === v.key ? 'on' : ''}`}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="port-list">
        {view === 'all' ? (
          <AllView
            collapsed={collapsed}
            toggleSection={toggleSection}
            heldIn={heldIn}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ) : (
          <SingleView view={view} balances={balances} onDeposit={onDeposit} onWithdraw={onWithdraw} />
        )}
      </div>
    </aside>
  );
}

// ── All view: three collapsible sections ─────────────────────────────────────
function AllView({
  collapsed,
  toggleSection,
  heldIn,
  onDeposit,
  onWithdraw,
}: {
  collapsed: Record<SectionKey, boolean>;
  toggleSection: (k: SectionKey) => void;
  heldIn: (set: AssetSymbol[]) => AssetSymbol[];
  onDeposit: (a: AssetSymbol) => void;
  onWithdraw: (a: AssetSymbol) => void;
}) {
  const sections = ALL_SECTIONS.map((s) => ({ ...s, held: heldIn(s.set) })).filter((s) => s.held.length > 0);

  if (sections.length === 0) {
    return <div className="port-empty">No balances yet</div>;
  }

  return (
    <>
      {sections.map((s) => (
        <div key={s.key}>
          <button className="port-sec-head" onClick={() => toggleSection(s.key)}>
            <svg
              className={`sec-caret ${collapsed[s.key] ? 'collapsed' : ''}`}
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path d="M4 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{s.label}</span>
          </button>
          {!collapsed[s.key] && (
            <div className="port-section-body">
              {s.note && <div className="port-note">Indicative. Confirm with statement.</div>}
              {s.held.map((a) => (
                <BalanceCard key={a} asset={a} onDeposit={onDeposit} onWithdraw={onWithdraw} />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ── Single segment view ──────────────────────────────────────────────────────
function SingleView({
  view,
  balances,
  onDeposit,
  onWithdraw,
}: {
  view: Exclude<PortfolioView, 'all'>;
  balances: Record<string, number | undefined>;
  onDeposit: (a: AssetSymbol) => void;
  onWithdraw: (a: AssetSymbol) => void;
}) {
  const config: Record<typeof view, { set: AssetSymbol[]; label: string; note?: boolean }> = {
    fiat: { set: FIAT_SET, label: 'Fiat Balances', note: true },
    stables: { set: STABLES, label: 'Stablecoin Balances' },
    majors: { set: MAJORS, label: 'Major Crypto Balances' },
  };
  const { set, label, note } = config[view];
  const held = set.filter((a) => (balances[a] ?? 0) > 0);

  return (
    <>
      <div className="port-section-label">{label}</div>
      {note && <div className="port-note">Indicative. Confirm with statement.</div>}
      <div className="port-section-body">
        {held.length === 0 && <div className="port-empty">No balances in this segment</div>}
        {held.map((a) => (
          <BalanceCard key={a} asset={a} onDeposit={onDeposit} onWithdraw={onWithdraw} />
        ))}
      </div>
    </>
  );
}
