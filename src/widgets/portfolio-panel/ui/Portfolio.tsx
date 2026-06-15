import { useCallback, useMemo, useState } from 'react';

import {
  ASSET_META,
  FIAT_SET,
  MAJORS,
  STABLES,
  isFiat,
} from '@/constants/assets';
import { fmtAsset, fmtMoney, fmtMoneyParts } from '@/lib/format';
import {
  fiatTotalUSD,
  grandTotalUSD,
  majorsTotalUSD,
  stablesTotalUSD,
  valueInUSD,
} from '@/lib/valuation';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import type {
  AssetSymbol,
  PortfolioView as PortfolioSegment,
} from '@/types';

import {
  PortfolioView,
  type PortfolioBalanceItem,
  type PortfolioSection,
  type SectionKey,
} from './PortfolioView';

interface PortfolioProps {
  onDeposit: (asset: AssetSymbol) => void;
  onWithdraw: (asset: AssetSymbol) => void;
}

const VIEWS: Array<{ key: PortfolioSegment; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'fiat', label: 'Fiat' },
  { key: 'stables', label: 'Stables' },
  { key: 'majors', label: 'Majors' },
];

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

const SINGLE_VIEW_CONFIG: Record<
  Exclude<PortfolioSegment, 'all'>,
  { key: SectionKey; set: AssetSymbol[]; label: string; note?: boolean }
> = {
  fiat: { key: 'fiat', set: FIAT_SET, label: 'Fiat Balances', note: true },
  stables: { key: 'stables', set: STABLES, label: 'Stablecoin Balances' },
  majors: { key: 'majors', set: MAJORS, label: 'Major Crypto Balances' },
};

export function Portfolio({ onDeposit, onWithdraw }: PortfolioProps) {
  const balances = useTradeStore((state) => state.balances);
  const reserved = useTradeStore((state) => state.reserved);
  const displayCcy = useUiStore((state) => state.displayCcy);
  const setDisplayCcy = useUiStore((state) => state.setDisplayCcy);

  const [view, setView] = useState<PortfolioSegment>('all');
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    fiat: false,
    majors: false,
    stables: false,
  });

  const segmentTotalUsd = useMemo(() => {
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

  const total = fmtMoneyParts(segmentTotalUsd, displayCcy);

  const buildBalanceItem = useCallback(
    (asset: AssetSymbol): PortfolioBalanceItem => {
      const balance = balances[asset] ?? 0;
      const reservedAmount = reserved[asset] ?? 0;
      const meta = ASSET_META[asset];
      const fiat = isFiat(asset);

      return {
        asset,
        name: meta.name,
        sub: fiat ? `${asset} · ${meta.rail ?? ''}` : asset,
        amount: fiat
          ? `${meta.symbol ?? ''}${fmtAsset(asset, balance)}`
          : fmtAsset(asset, balance),
        estimate: fmtMoney(valueInUSD(asset, balance), displayCcy),
        secondary: reservedAmount > 0
          ? `${fmtAsset(asset, reservedAmount)} reserved`
          : '0 reserved',
      };
    },
    [balances, displayCcy, reserved],
  );

  const sections = useMemo<PortfolioSection[]>(
    () =>
      ALL_SECTIONS.map((section) => ({
        key: section.key,
        label: section.label,
        note: section.note,
        items: section.set
          .filter((asset) => (balances[asset] ?? 0) > 0)
          .map(buildBalanceItem),
      })).filter((section) => section.items.length > 0),
    [balances, buildBalanceItem],
  );

  const currentSection = useMemo<PortfolioSection | null>(() => {
    if (view === 'all') {
      return null;
    }

    const config = SINGLE_VIEW_CONFIG[view];

    return {
      key: config.key,
      label: config.label,
      note: config.note,
      items: config.set
        .filter((asset) => (balances[asset] ?? 0) > 0)
        .map(buildBalanceItem),
    };
  }, [view, balances, buildBalanceItem]);

  const toggleSection = (key: SectionKey) => {
    setCollapsed((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <PortfolioView
      displayCcy={displayCcy}
      view={view}
      views={VIEWS}
      total={total}
      sections={sections}
      currentSection={currentSection}
      collapsed={collapsed}
      onDisplayCcyChange={setDisplayCcy}
      onViewChange={setView}
      onToggleSection={toggleSection}
      onDeposit={onDeposit}
      onWithdraw={onWithdraw}
    />
  );
}