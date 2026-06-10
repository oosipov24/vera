import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Sun,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ThemeMode } from '@/types';

import { PalettePicker } from './PalettePicker';

export type SettingsTab = 'email' | '2fa' | 'password';

interface TopbarViewProps {
  theme: ThemeMode;
  accountType: string;
  paletteIndex: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onThemeToggle: () => void;
  onPaletteChange: (index: number) => void;
  onOpenSettings: (tab: SettingsTab) => void;
}

const TICKER = [
  { sym: 'BNB/USDT', price: '615.00', chg: '+1.24%', trend: 'up' },
  { sym: 'BTC/USDT', price: '68,240', chg: '-0.38%', trend: 'down' },
  { sym: 'ETH/USDT', price: '3,812', chg: '+2.11%', trend: 'up' },
  { sym: 'ADA/USDT', price: '0.4210', chg: '+0.87%', trend: 'up' },
  { sym: 'SOL/USDT', price: '165.40', chg: '-1.02%', trend: 'down' },
  { sym: 'XRP/USDT', price: '0.6183', chg: '+0.54%', trend: 'up' },
] as const;

export function TopbarView({
  theme,
  accountType,
  paletteIndex,
  onDeposit,
  onWithdraw,
  onThemeToggle,
  onPaletteChange,
  onOpenSettings,
}: TopbarViewProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            V
          </div>

          <span className="whitespace-nowrap text-sm font-bold tracking-tight text-foreground">
            Vera Finance<span className="text-primary">*</span>
          </span>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden" aria-hidden="true">
          <div className="flex w-max animate-[ticker_38s_linear_infinite] items-center gap-6 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((item, index) => {
              const isUp = item.trend === 'up';

              return (
                <span
                  className="inline-flex items-center gap-1.5 text-xs"
                  key={`${item.sym}-${index}`}
                >
                  <span
                    className={
                      isUp
                        ? 'size-1.5 rounded-full bg-primary'
                        : 'size-1.5 rounded-full bg-destructive'
                    }
                  />
                  <span className="font-bold text-muted-foreground">
                    {item.sym}
                  </span>
                  <span
                    className={
                      isUp
                        ? 'font-mono font-semibold text-primary'
                        : 'font-mono font-semibold text-destructive'
                    }
                  >
                    {item.price}
                  </span>
                  <span
                    className={
                      isUp
                        ? 'rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary'
                        : 'rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[11px] text-destructive'
                    }
                  >
                    {item.chg}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={onDeposit}>
          <ArrowDownToLine className="size-4" />
          Deposit
        </Button>

        <Button size="sm" variant="outline" onClick={onWithdraw}>
          <ArrowUpFromLine className="size-4" />
          Withdraw
        </Button>

        <PalettePicker
          paletteIndex={paletteIndex}
          onPaletteChange={onPaletteChange}
        />

        <Button
          size="icon"
          variant="outline"
          type="button"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </Button>

        <div className="hidden items-center rounded-full border border-border bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-flex">
          {accountType}
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:inline-flex">
          <span className="size-1.5 rounded-full bg-primary" />
          Live Account
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <span className="flex size-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary">
                T1
              </span>
              <span className="hidden sm:inline">Test 11</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Test 11</span>
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  test@vera-finance.com
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onOpenSettings('email')}>
              <Mail className="size-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onOpenSettings('password')}>
              <LockKeyhole className="size-4" />
              Reset Password
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}