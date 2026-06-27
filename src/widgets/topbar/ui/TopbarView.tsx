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
    <header className="sticky top-0 z-50 flex h-15 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            V
          </div>

          <span className="whitespace-nowrap text-control-l font-bold tracking-tight text-foreground">
            Vera Finance<span className="text-primary">*</span>
          </span>
        </div>

        <div className="hidden min-w-0 flex-1 overflow-hidden md:block" aria-hidden="true">
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
                        ? 'size-1.5 rounded-full bg-success-action'
                        : 'size-1.5 rounded-full bg-destructive'
                    }
                  />
                  <span className="font-bold text-t1">
                    {item.sym}
                  </span>
                  <span
                    className={
                      isUp
                        ? 'font-mono font-semibold text-success-action'
                        : 'font-mono font-semibold text-destructive'
                    }
                  >
                    {item.price}
                  </span>
                  <span
                    className={
                      isUp
                        ? 'rounded bg-success-surface/10 px-1.5 py-0.5 font-mono text-[11px] text-success-action'
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
        <Button
          type="button"
          className="h-8 gap-1.5 rounded-r8 border border-success-action bg-success-action px-2.5 py-1 text-control-lg font-bold text-success-action-foreground shadow-none hover:bg-success-action-hover hover:text-success-action-foreground text-center"
          onClick={onDeposit}
        >
          <ArrowDownToLine className="size-3.5" />
          Deposit
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 rounded-r8 border border-border px-2.5 py-1 text-control-lg font-semibold text-foreground shadow-none hover:bg-accent hover:border-muted hover:text-foreground"
          onClick={onWithdraw}
        >
          <ArrowUpFromLine className="size-3.5" />
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
          className="hover:border-primary"
        >
          {theme === 'dark' ? (
            <Moon className="size-4 " />
          ) : (
            <Sun className="size-4" />
          )}
        </Button>

        <div className="hidden items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary md:inline-flex ">
          {accountType}
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-success-surface/20 bg-success-surface/10 px-3 py-1.5 text-xs font-semibold text-success-action md:inline-flex">
          <span
            className="inline-flex size-2 rounded-full bg-success-action animate-[pulse_1.4s_ease-in-out_infinite]"
            aria-hidden="true"
          />

          Live Account
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-r8 border border-border bg-popover px-3.75 py-4 font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground leading-none hover:border-primary"
            >
              <span className="flex size-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-caption font-bold text-primary">
                T1
              </span>
              <span className="hidden sm:inline text-control-lg">Test 11</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 rounded-r8 border border-border bg-popover p-1 text-popover-foreground shadow-2xl "
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col gap-1 ">
                <span className="text-xs font-semibold text-foreground">
                  Test 11
                </span>

                <span className="trading-mono text-xs font-normal text-muted-foreground">
                  test@vera-finance.com
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 bg-border" />

            <DropdownMenuItem
              className="h-8 rounded-r6 px-3 text-xs font-medium text-muted-foreground focus:bg-muted focus:text-foreground"
              onClick={() => onOpenSettings('email')}
            >
              <Mail className="size-4 text-muted-foreground" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              className="h-8 rounded-r6 px-3 text-xs font-medium text-muted-foreground focus:bg-muted focus:text-foreground"
              onClick={() => onOpenSettings('password')}
            >
              <LockKeyhole className="size-4 text-muted-foreground" />
              Reset Password
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border" />

            <DropdownMenuItem className="h-8 rounded-r6 px-3 text-xs font-medium text-danger-action focus:bg-danger-surface focus:text-danger-action">
              <LogOut className="size-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
