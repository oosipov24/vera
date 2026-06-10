import type { AssetSymbol } from '@/types';
import { ASSET_ICON_SVG } from './assetIconSvg';

interface AssetIconProps {
  asset: AssetSymbol;
  /** Pixel size of the round icon. Defaults to 32 (the SVG's native size). */
  size?: number;
  className?: string;
}

// Renders the local SVG icon of the asset or fallback with a ticker.
export function AssetIcon({ asset, size = 32, className }: AssetIconProps) {
  const svg = ASSET_ICON_SVG[asset];
  const style = { width: size, height: size } as const;

  if (!svg) {
    return (
      <div className={`coin-ico ${className ?? ''}`} style={style}>
        <span style={{ fontSize: 9, fontWeight: 700 }}>{asset}</span>
      </div>
    );
  }

  return (
    <div
      className={`coin-ico ${className ?? ''}`}
      style={style}
      // Static, trusted SVG constants — safe to inject.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
