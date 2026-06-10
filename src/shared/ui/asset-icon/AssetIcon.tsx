import type { ComponentType, SVGProps } from 'react';

import { cn } from '@/lib/utils';
import type { AssetSymbol } from '@/types';

import AaveIcon from './icons/aave.svg?react';
import AdaIcon from './icons/ada.svg?react';
import AedIcon from './icons/aed.svg?react';
import AvaxIcon from './icons/avax.svg?react';
import BnbIcon from './icons/bnb.svg?react';
import BtcIcon from './icons/btc.svg?react';
import ChfIcon from './icons/chf.svg?react';
import EthIcon from './icons/eth.svg?react';
import EurIcon from './icons/eur.svg?react';
import GbpIcon from './icons/gbp.svg?react';
import SolIcon from './icons/sol.svg?react';
import UsdcIcon from './icons/usdc.svg?react';
import UsdtIcon from './icons/usdt.svg?react';
import UsdIcon from './icons/usd.svg?react';
import XrpIcon from './icons/xrp.svg?react';

type AssetIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface AssetIconProps {
  asset: AssetSymbol;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ASSET_ICON_SIZE_CLASS_NAMES: Record<
  NonNullable<AssetIconProps['size']>,
  string
> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
};

const ASSET_ICON_COMPONENTS: Partial<Record<AssetSymbol, AssetIconComponent>> = {
  AAVE: AaveIcon,
  ADA: AdaIcon,
  AED: AedIcon,
  AVAX: AvaxIcon,
  BNB: BnbIcon,
  BTC: BtcIcon,
  CHF: ChfIcon,
  ETH: EthIcon,
  EUR: EurIcon,
  GBP: GbpIcon,
  SOL: SolIcon,
  USDC: UsdcIcon,
  USDT: UsdtIcon,
  USD: UsdIcon,
  XRP: XrpIcon,
};

export function AssetIcon({
  asset,
  size = 'md',
  className,
}: AssetIconProps) {
  const Icon = ASSET_ICON_COMPONENTS[asset];

  const wrapperClassName = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
    ASSET_ICON_SIZE_CLASS_NAMES[size],
    className,
  );

  if (!Icon) {
    return (
      <div className={wrapperClassName}>
        <span className="text-[9px] font-bold">{asset}</span>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <Icon className="size-full" aria-hidden focusable="false" />
    </div>
  );
}