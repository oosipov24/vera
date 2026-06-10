import type { CSSProperties } from 'react';

import type { AssetSymbol } from '@/types';
import { cn } from '@/lib/utils';

import { ASSET_ICON_SVG } from './assetIconSvg';

interface AssetIconProps {
  asset: AssetSymbol;
  /** Pixel size of the round icon. Defaults to 32, the SVG native size. */
  size?: number;
  className?: string;
}

// Renders the local SVG icon of the asset or fallback with a ticker.
export function AssetIcon({ asset, size = 32, className }: AssetIconProps) {
  const svg = ASSET_ICON_SVG[asset];

  const style: CSSProperties = {
    width: size,
    height: size,
  };

  const wrapperClassName = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
    className,
  );

  if (!svg) {
    return (
      <div className={wrapperClassName} style={style}>
        <span className="text-[9px] font-bold">{asset}</span>
      </div>
    );
  }

  return (
    <div
      className={wrapperClassName}
      style={style}
      // Static, trusted SVG constants — safe to inject.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}