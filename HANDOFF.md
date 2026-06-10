# Vera Finance — OTC RFQ Platform · Frontend Handoff

A React + TypeScript port of the approved Vera Finance OTC RFQ prototype, structured for a frontend team to wire to a real backend.

This document explains the architecture, the state model, **where to plug the backend in**, and how the pieces fit together.

---

## 1. Quick start

```bash
npm install
npm run dev          # Vite dev server (http://localhost:5173)

npm run build        # type-check + production build → dist/
npm run preview      # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest (unit tests for the pure logic + store)
```

Requirements: Node 18+ and npm. No environment variables are needed to run the UI — it currently uses in-memory seed data.

---

## 2. Tech stack & key decisions

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite 5** + `@vitejs/plugin-react` | Fast dev server, standard React-TS toolchain |
| Language | **TypeScript** (strict) | Full domain typing; safe refactors |
| State | **Zustand** (3 small stores) | Minimal boilerplate, selector-based re-renders, trivial to swap action bodies for API calls |
| Styling | **CSS variables + plain CSS** (3 layers) | Faithful to the locked design; theming/palette via custom properties; no build-time CSS deps |
| Icons | Inline SVG constants | Self-contained coin/fiat marks; no icon font/network |
| Tests | **Vitest** | Unit tests for valuation, formatting, QR, and the trade store |

**Why Zustand and not Redux/Context?** The app is read-heavy with a handful of mutating actions (submit order, deposit, withdraw). Zustand gives a single source of truth with selector subscriptions (components re-render only on the slices they read) and lets the backend team replace the body of an action without touching any component. If your house style is Redux Toolkit / TanStack Query, the store files are the only thing you'd rewrite — the component tree and types stay.

**Styling layers** (imported once in `src/main.tsx`):
1. `styles/tokens.css` — design tokens (CSS variables) for dark + light.
2. `styles/base.css` — element reset + shared keyframes.
3. `styles/components.css` — all component styles (the single component stylesheet).

Class names are intentionally semantic. A team that prefers CSS Modules or Tailwind can migrate component-by-component; the **token layer stays** and keeps theming working.

---

## 3. Project structure

```
src/
├─ main.tsx                  # React entry; mounts <App/>, imports the 3 CSS layers
├─ App.tsx                   # Shell: 3-column grid + modals + toaster; applies default palette
│
├─ types/
│  └─ index.ts               # All domain types (the backend response contracts)
│
├─ constants/
│  ├─ assets.ts              # Asset sets, prices, FX, metadata, networks, bank-field schemas
│  └─ market.ts              # Palettes, tradeable pairs, spread/TTL constants
│
├─ lib/                      # Pure, framework-free logic (easy to unit-test)
│  ├─ format.ts              # Money/asset/number/timestamp/id formatting
│  ├─ valuation.ts           # USD valuation, portfolio totals, quote derivation
│  ├─ palette.ts             # Runtime HSL retint engine (writes CSS vars)
│  └─ qr.ts                  # Deterministic QR-style SVG (see §6)
│
├─ store/                    # Zustand stores (state + actions = backend seams)
│  ├─ useTradeStore.ts       # SINGLE SOURCE OF TRUTH: balances, executions, transactions
│  ├─ useOrderStore.ts       # Active order ticket: pair/side/qty/unit/quote
│  └─ useUiStore.ts          # Theme, palette, display currency, toast queue
│
├─ hooks/
│  └─ useCountdown.ts        # RFQ quote countdown / auto-refresh
│
├─ components/
│  ├─ icons/                 # AssetIcon + the 15 inline SVG marks
│  ├─ ui/                    # Dropdown, Modal, Toaster, TooltipCell (reusable primitives)
│  ├─ layout/                # Topbar, PalettePicker
│  ├─ order/                 # OrderEntry (left column)
│  ├─ rfq/                   # RfqHero (bid/ask, spread, countdown, notional)
│  ├─ tables/                # ActivityPanel → Executions / Transactions tables + StatusBadge
│  ├─ portfolio/             # Portfolio (right column) + BalanceCard
│  └─ modals/                # DepositModal, WithdrawModal, shared parts
│
└─ styles/                   # tokens.css · base.css · components.css

Unit tests live next to the code they cover: src/lib/*.test.ts, src/store/*.test.ts (Vitest).
```

---

## 4. State model

Three stores, separated by concern so re-renders stay scoped.

### `useTradeStore` — the domain source of truth
```ts
{
  accountType: 'Individual' | 'Corporate';
  balances: Partial<Record<AssetSymbol, number>>;   // asset → amount held
  reserved: Partial<Record<AssetSymbol, number>>;
  executions: Execution[];                            // trade history
  transactions: Transaction[];                        // deposits / withdrawals ledger

  submitOrder(input): { ok: true; execution } | { ok: false; reason };
  deposit(asset, amount, method): Transaction;        // records Pending; credited on approval
  withdraw(asset, amount, method): boolean;           // debits + records; false if insufficient
  recordTxn(partial): Transaction;                    // low-level ledger append
}
```

### `useOrderStore` — the working order ticket
`pair`, `side`, `qty`, `unit`, `quote`, plus setters and `refreshQuote()`.
Helper `deriveTicket(state)` returns `{ raw, price, assetQty, total }` for the current ticket.

### `useUiStore` — presentation
`theme`, `paletteIndex`, `displayCcy`, `toasts`, plus `toggleTheme()`, `setPalette()`, `setDisplayCcy()`, `pushToast()`, `dismissToast()`.

**Usage pattern** (selector subscription):
```ts
const balances = useTradeStore((s) => s.balances);          // re-renders only when balances change
const submitOrder = useTradeStore((s) => s.submitOrder);
```

---

## 5. Component tree

```
App
├─ Topbar                       logo · ticker · Deposit/Withdraw · PalettePicker · theme · account
│  └─ PalettePicker             accent swatches → useUiStore.setPalette
├─ col-left
│  └─ OrderEntry                Buy/Sell · Symbol(Dropdown) · Qty · summary · submit → submitOrder
├─ col-center
│  ├─ RfqHero                   bid/ask · spread · countdown(useCountdown) · notional
│  └─ ActivityPanel
│     ├─ ExecutionsTable        status + search filters
│     └─ TransactionsTable      rail + method + status filters; reason tooltip
├─ col-right
│  └─ Portfolio                 total(green) + USD/EUR · 4 tabs · All = 3 collapsible sections
│     └─ BalanceCard            per-asset row + quick deposit/withdraw
├─ DepositModal                 5-step flow → deposit()
├─ WithdrawModal                3-step flow → withdraw()
└─ Toaster                      reads useUiStore.toasts
```

UI behaviours preserved from the prototype: portfolio tabs **All / Fiat / Stables / Majors**; the **All** view splits into three independently collapsible sections **Fiat / Major Crypto / Stablecoins**; the USD/EUR switch sits in the portfolio header; the total is green; the transaction **method filter lists concrete values** (fiat rails for the Fiat rail, specific assets for the Crypto rail); RFI/rejected rows show a hover tooltip with the reason.

---

## 6. Backend integration seams

Every integration point is marked in code with a `BACKEND SEAM` comment. Replace the body; keep the signature and the return shape, and no component needs to change.

| # | Seam | File | Today (mock) | Wire to |
|---|------|------|--------------|---------|
| 1 | **Reference prices** | `constants/assets.ts` → `PRICES_USD` | Static map | Live price feed (oracle / exchange ticker). Consider moving into a store + polling/websocket. |
| 2 | **FX rate** | `constants/assets.ts` → `FX` | `{ USD:1, EUR:0.926 }` | FX endpoint for the display-currency switch. |
| 3 | **RFQ quote** | `lib/valuation.ts` → `quoteFor()` | Derived mid ± spread | Real two-sided quote from your LP. `useOrderStore.refreshQuote()` and `useCountdown.onExpire` are the refresh hooks. |
| 4 | **Submit order** | `store/useTradeStore.ts` → `submitOrder()` | Mutates local balances | `POST /orders` (RFQ execute). Return the created `Execution`; surface failures via the existing `{ ok:false, reason }`. |
| 5 | **Deposit** | `store/useTradeStore.ts` → `deposit()` | Records `Pending` txn | `POST /deposits` (+ proof upload). Credit balance on backend approval, not on submit. |
| 6 | **Withdraw** | `store/useTradeStore.ts` → `withdraw()` | Debits + records txn | `POST /withdrawals`. Keep the insufficient-funds guard server-side too. |
| 7 | **History** | `store/useTradeStore.ts` seed arrays | Seed `executions` / `transactions` | `GET /executions`, `GET /transactions` on load (and refresh after actions). |
| 8 | **Deposit addresses** | `constants/assets.ts` → `NET_ADDR` | Static per-network | Per-user, per-network address generation. |
| 9 | **QR code** | `lib/qr.ts` → `makeQrSvg()` | Deterministic QR-style SVG | A real QR lib (e.g. `qrcode`) over the deposit address. |
| 10 | **Bank details** | `DepositModal` `BankDetails` | Hard-coded beneficiary | Your treasury's wire instructions per rail/currency. |
| 11 | **Account / identity** | `useTradeStore.accountType`, Topbar user | Static "Corporate" / "Test 11" | Auth/session + profile. |

Recommended approach: introduce a thin `api/` layer and call it from the store actions (and a load effect in `App`). Because components read state through selectors, swapping mock → API is invisible to them. If you adopt TanStack Query, the read paths (history, prices) map naturally to queries and the actions to mutations.

---

## 7. Theming & palettes

- **Dark/light**: `useUiStore.toggleTheme()` toggles `data-theme="light"` on `<html>` and re-applies the palette.
- **Accent palettes**: `lib/palette.ts` `applyPalette(index, theme)` generates the **entire neutral scale + accent** from a single hue (8 presets in `constants/market.ts`) and writes them as inline CSS variables on `<html>`. Picking a palette retints the whole platform cohesively.
- **Semantic colours stay fixed**: green (buy / bid / success) and red (sell / ask / error) are never retinted — they carry meaning.

---

## 8. Type reference (high level)

Domain (`types/index.ts`): `AssetSymbol`, `AssetClass`, `AssetMeta`, `AccountType`, `BalanceMap`, `OrderSide`, `QtyUnit`, `TradingPair`, `Execution`/`ExecutionStatus`, `Quote`, `PaymentRail`/`PaymentMethod`, `TxnType`/`TxnStatus`/`Transaction`, filter types (`RailFilter`/`MethodFilter`/`StatusFilter`/`TxnFilter`), `NetworkName`, `DisplayCurrency`, `PortfolioView`, `ThemeMode`, `ToastKind`/`Toast`, `FiatField`.

These are the shapes your API should return (or be adapted to) so the stores stay drop-in.

---

## 9. Implementation notes

- **Prototype parity.** This port mirrors the approved prototype 1:1 in behaviour and layout; the prototype HTML remains the visual reference for any fine detail.
- **Accessibility.** Modals render through a portal with a focus trap (focus moves in on open, Tab/Shift+Tab cycle within it, and focus is restored on close) plus Escape and backdrop-click to close. Dropdowns close on Escape and outside-click. The truncated-cell tooltip renders through a portal to `document.body` so it escapes `overflow` clipping.
- **Testing.** Unit tests (Vitest) cover the pure logic — valuation, formatting, QR — and the trade store. Run them with `npm run test`.
- **Data layer.** All wiring points to the backend are catalogued in §6 and marked in code with `BACKEND SEAM` comments; the store action signatures are designed so swapping in API calls leaves the component tree untouched.
