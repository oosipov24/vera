import { useUiStore } from '@/store/useUiStore';
import { useTradeStore } from '@/store/useTradeStore';
import { PalettePicker } from '@/components/layout/PalettePicker';
import { useEffect, useRef, useState } from 'react';
import { SettingsDialog } from '@/features/change-settings';

interface TopbarProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

const TICKER = [
  { sym: 'BNB/USDT', price: '615.00', chg: '+1.24%', up: true },
  { sym: 'BTC/USDT', price: '68,240', chg: '-0.38%', up: false },
  { sym: 'ETH/USDT', price: '3,812', chg: '+2.11%', up: true },
  { sym: 'ADA/USDT', price: '0.4210', chg: '+0.87%', up: true },
  { sym: 'SOL/USDT', price: '165.40', chg: '-1.02%', up: false },
  { sym: 'XRP/USDT', price: '0.6183', chg: '+0.54%', up: true },
];

// Global top navigation bar
export function Topbar({ onDeposit, onWithdraw }: TopbarProps) {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const accountType = useTradeStore((s) => s.accountType);

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'email' | '2fa' | 'password'>('email');

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);
  
  return (
    <>
    <header className="topbar">
      <div className="tb-left">
        <div className="logo">
          <div className="logomark">V</div>
          <span className="logo-name">
            Vera Finance<span>*</span>
          </span>
        </div>

        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span className="t-item" key={i}>
                <span className="t-dot" style={{ background: t.up ? 'var(--green)' : 'var(--red)' }} />
                <span className="t-sym">{t.sym}</span>
                <span className="t-price" style={{ color: t.up ? 'var(--green)' : 'var(--red)' }}>
                  {t.price}
                </span>
                <span className={`t-chg ${t.up ? 'up' : 'dn'}`}>{t.chg}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-right">
        <button className="btn-dep" onClick={onDeposit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v7m0 0l-3-3m3 3l3-3M2.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Deposit
        </button>
        <button className="btn-wd" onClick={onWithdraw}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 9V2m0 0L4 5m3-3l3 3M2.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Withdraw
        </button>

        <PalettePicker />

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M15 10.5A6.5 6.5 0 017.5 3a6.5 6.5 0 100 13 6.5 6.5 0 007.5-5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.8 3.8l1.4 1.4M12.8 12.8l1.4 1.4M3.8 14.2l1.4-1.4M12.8 5.2l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className="acct-type-pill">{accountType}</div>
          <div className="live-pill">
            <span className="live-dot" />
            Live Account
          </div>
        <div className="user-menu-wrap" ref={userMenuRef}>
          <button
            className={`user-btn ${open ? 'open' : ''}`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="user-av">T1</span>
            <span className="user-nm">Test 11</span>

            <svg
              className="user-chevron"
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4.5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <div className="user-menu" role="menu">
              <div className="um-header">
                <div className="um-name">Test 11</div>
                <div className="um-email">test@vera-finance.com</div>
              </div>

              <div className="um-list">
                <button
                  className="um-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSettingsTab('email');
                    setSettingsOpen(true);
                    setOpen(false);
                  }}
                >
                  Settings
                </button>

                <button
                  className="um-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSettingsTab('password');
                    setSettingsOpen(true);
                    setOpen(false);
                  }}
                >
                  Reset Password
                </button>

                <div className="um-divider" />

                <button className="um-item danger" type="button" role="menuitem">
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <SettingsDialog
      open={settingsOpen}
      initialTab={settingsTab}
      onClose={() => setSettingsOpen(false)}
    />
    </>
  );
}
