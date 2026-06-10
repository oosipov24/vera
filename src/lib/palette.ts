import type { ThemeMode } from '@/types';
import { PALETTES } from '@/constants/market';

//  Applies the runtime palette via CSS custom properties.
export function applyPalette(index: number, theme: ThemeMode): void {
  const palette = PALETTES[index] ?? PALETTES[0];
  const H = palette.hue;
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  const hsl = (s: number, l: number, a?: number) =>
    `hsl(${H} ${s}% ${l}%${a != null ? ` / ${a}` : ''})`;

  if (theme === 'light') {
    set('--bg', hsl(28, 96));
    set('--bg2', hsl(30, 99.5));
    set('--bg3', '#FFFFFF');
    set('--bg4', hsl(26, 95));
    set('--bg5', hsl(24, 91));
    set('--b1', hsl(22, 90));
    set('--b2', hsl(20, 84));
    set('--b3', hsl(18, 74));
    set('--t1', hsl(30, 12));
    set('--t2', hsl(20, 32));
    set('--t3', hsl(16, 52));
    set('--t4', hsl(16, 68));
    const ac = hsl(72, 52);
    set('--purple', ac);
    set('--purple-bg', hsl(72, 52, 0.1));
    set('--purple-dim', hsl(72, 52, 0.26));
  } else {
    set('--bg', hsl(18, 5));
    set('--bg2', hsl(16, 7.5));
    set('--bg3', hsl(15, 9.5));
    set('--bg4', hsl(14, 12.5));
    set('--bg5', hsl(13, 16.5));
    set('--b1', hsl(16, 17));
    set('--b2', hsl(16, 23));
    set('--b3', hsl(15, 31));
    set('--t1', hsl(20, 95));
    set('--t2', hsl(16, 70));
    set('--t3', hsl(15, 55));
    set('--t4', hsl(14, 40));
    const ac = hsl(82, 68);
    set('--purple', ac);
    set('--purple-bg', hsl(82, 68, 0.12));
    set('--purple-dim', hsl(82, 68, 0.3));
  }
}
