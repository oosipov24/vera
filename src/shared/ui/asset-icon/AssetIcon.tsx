import type { AssetSymbol } from '@/types';

import { cn } from '@/lib/utils';

import { ASSET_ICON_SVG } from './assetIconSvg';

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

export function AssetIcon({
  asset,
  size = 'md',
  className,
}: AssetIconProps) {
  const svg = ASSET_ICON_SVG[asset];

  const wrapperClassName = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
    ASSET_ICON_SIZE_CLASS_NAMES[size],
    className,
  );

  if (!svg) {
    return (
      <div className={wrapperClassName}>
        <span className="text-[9px] font-bold">{asset}</span>
      </div>
    );
  }

  return (
    <div
      className={wrapperClassName}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}