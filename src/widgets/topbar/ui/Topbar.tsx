import { PalettePicker } from './PalettePicker';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
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
import { lazy, Suspense, useState } from 'react';

interface TopbarProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

type SettingsTab = 'email' | '2fa' | 'password';

const SettingsDialog = lazy(() =>
  import('@/features/change-settings').then((module) => ({
    default: module.SettingsDialog,
  })),
);
const TICKER = [
  { sym: 'BNB/USDT', price: '615.00', chg: '+1.24%', trend: 'up' },
  { sym: 'BTC/USDT', price: '68,240', chg: '-0.38%', trend: 'down' },
  { sym: 'ETH/USDT', price: '3,812', chg: '+2.11%', trend: 'up' },
  { sym: 'ADA/USDT', price: '0.4210', chg: '+0.87%', trend: 'up' },
  { sym: 'SOL/USDT', price: '165.40', chg: '-1.02%', trend: 'down' },
  { sym: 'XRP/USDT', price: '0.6183', chg: '+0.54%', trend: 'up' },
] as const;

export function Topbar({ onDeposit, onWithdraw }: TopbarProps) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const accountType = useTradeStore((state) => state.accountType);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('email');

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <>
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
                      className={`size-1.5 rounded-full ${
                        isUp ? 'bg-primary' : 'bg-destructive'
                      }`}
                    />
                    <span className="font-bold text-muted-foreground">
                      {item.sym}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        isUp ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {item.price}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
                        isUp
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}
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

          <PalettePicker />

          <Button
            size="icon"
            variant="outline"
            type="button"
            onClick={toggleTheme}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
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

              <DropdownMenuItem onClick={() => openSettings('email')}>
                <Mail className="size-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openSettings('password')}>
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

      <Suspense fallback={null}>
        {settingsOpen && (
          <SettingsDialog
            open={settingsOpen}
            initialTab={settingsTab}
            onOpenChange={setSettingsOpen}
          />
        )}
      </Suspense>
    </>
  );
}
