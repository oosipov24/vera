# Vera Finance - Frontend Handoff

React + TypeScript frontend for the Vera Finance OTC RFQ prototype. The project is a frontend-only demo with in-memory seed data. The current implementation follows the target frontend stack and Feature-Sliced Design structure. Backend integration is prepared through a shared API boundary, but live backend calls are not connected yet.

---

## 1. Current project status

1. `pnpm typecheck` passes.
2. `pnpm lint` passes.
3. `pnpm test` passes: 3 test files, 27 tests.
4. `pnpm build` passes and outputs the production build to `dist/`.
5. The production build currently reports a Vite/Rollup chunk-size warning for the main bundle above 500 kB. This is a performance warning, not a build failure.
6. The project is frontend-only and uses static demo data for balances, transactions, executions, prices, FX, user identity, bank details, and crypto deposit addresses.
7. The UI is currently wired to local Zustand stores. These stores are the replacement points for backend API integration.

---

## 2. Quick start

```bash
pnpm install
pnpm dev          # Vite dev server: http://localhost:5173

pnpm typecheck    # TypeScript check for app + config files
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm build        # typecheck + production build -> dist/
pnpm preview      # serve the production build
```

Recommended clean setup after receiving a ZIP:

```bash
rm -rf node_modules dist *.tsbuildinfo
pnpm install
pnpm dev
```

Windows PowerShell equivalent:

```powershell
Remove-Item -Recurse -Force node_modules, dist -ErrorAction SilentlyContinue
Remove-Item -Force *.tsbuildinfo -ErrorAction SilentlyContinue
pnpm install
pnpm dev
```

Requirements:

1. Node.js version compatible with Vite 7.
2. pnpm.
3. No backend service is required to run the current UI demo.
4. `.env.example` exists and defines `VITE_API_BASE_URL=` for future API integration.
5. No Docker, local HTTPS, or external API is required for the current frontend-only demo.

---

## 3. Tech stack

1. React 19.
2. TypeScript in strict mode.
3. Vite 7 with `@vitejs/plugin-react`.
4. pnpm package management.
5. Tailwind CSS v4 through `@tailwindcss/vite`.
6. shadcn/ui primitives in `src/components/ui`.
7. lucide-react for standard icons.
8. vite-plugin-svgr for custom SVG icons.
9. react-hook-form with Zod validation and `@hookform/resolvers`.
10. TanStack React Table v8 for activity tables.
11. react-toastify for toast rendering.
12. react-router v7 for application routing.
13. Zustand for current local demo state.
14. `qrcode` package for crypto deposit QR generation.
15. Vitest for unit tests.

---

## 4. Project structure

```text
src/
├─ main.tsx
├─ App.tsx
│
├─ app/
│  ├─ providers/
│  │  ├─ AppProviders.tsx
│  │  ├─ ToastProvider.tsx
│  │  └─ index.ts
│  ├─ router/
│  │  ├─ AppRouter.tsx
│  │  └─ index.ts
│  └─ styles/
│     └─ index.css
│
├─ pages/
│  └─ trading/
│     ├─ ui/TradingPage.tsx
│     └─ index.ts
│
├─ widgets/
│  ├─ topbar/
│  │  ├─ ui/Topbar.tsx
│  │  ├─ ui/TopbarView.tsx
│  │  ├─ ui/PalettePicker.tsx
│  │  └─ index.ts
│  ├─ order-entry/
│  │  ├─ ui/OrderEntry.tsx
│  │  ├─ ui/OrderEntryView.tsx
│  │  └─ index.ts
│  ├─ rfq-panel/
│  │  ├─ ui/RfqHero.tsx
│  │  ├─ ui/RfqHeroView.tsx
│  │  └─ index.ts
│  ├─ activity-panel/
│  │  ├─ ui/ActivityPanel.tsx
│  │  ├─ ui/ExecutionsTable.tsx
│  │  ├─ ui/ExecutionsTableView.tsx
│  │  ├─ ui/TransactionsTable.tsx
│  │  ├─ ui/TransactionsTableView.tsx
│  │  ├─ ui/StatusBadge.tsx
│  │  └─ index.ts
│  └─ portfolio-panel/
│     ├─ ui/Portfolio.tsx
│     ├─ ui/PortfolioView.tsx
│     ├─ ui/BalanceCard.tsx
│     └─ index.ts
│
├─ features/
│  ├─ deposit-funds/
│  │  ├─ ui/DepositDialog.tsx
│  │  ├─ ui/DepositDialogView.tsx
│  │  ├─ model/schemas.ts
│  │  └─ index.ts
│  ├─ withdraw-funds/
│  │  ├─ ui/WithdrawDialog.tsx
│  │  ├─ ui/WithdrawDialogView.tsx
│  │  ├─ model/schemas.ts
│  │  └─ index.ts
│  └─ change-settings/
│     ├─ ui/SettingsDialog.tsx
│     ├─ ui/EmailSettingsForm.tsx
│     ├─ ui/PasswordResetForm.tsx
│     ├─ ui/TwoFactorForm.tsx
│     ├─ model/schemas.ts
│     └─ index.ts
│
├─ shared/
│  ├─ api/
│  │  ├─ client.ts
│  │  ├─ mock.ts
│  │  └─ index.ts
│  └─ ui/
│     ├─ Dropdown.tsx
│     ├─ feedback.tsx
│     ├─ transfer-flow-parts.tsx
│     ├─ data-table-parts.tsx
│     └─ asset-icon/
│        ├─ AssetIcon.tsx
│        ├─ index.ts
│        └─ icons/*.svg
│
├─ components/
│  └─ ui/                    # shadcn/ui primitives
│
├─ constants/
│  ├─ assets.ts
│  └─ market.ts
│
├─ hooks/
│  └─ useCountdown.ts
│
├─ lib/
│  ├─ format.ts
│  ├─ palette.ts
│  └─ valuation.ts
│
├─ store/
│  ├─ useTradeStore.ts
│  ├─ useOrderStore.ts
│  └─ useUiStore.ts
│
└─ types/
   └─ index.ts
```

Unit tests currently live here:

```text
src/lib/format.test.ts
src/lib/valuation.test.ts
src/store/useTradeStore.test.ts
```

---

## 5. Application shell and routing

1. `src/main.tsx` imports the single global Tailwind/shadcn stylesheet and mounts `<App />`.
2. `src/App.tsx` renders `AppProviders` and `AppRouter`.
3. `src/app/providers/AppProviders.tsx` applies the active palette/theme and provides tooltip/toast infrastructure.
4. `src/app/providers/ToastProvider.tsx` renders `react-toastify`'s `ToastContainer`.
5. `src/app/router/AppRouter.tsx` defines the application routes.
6. `src/shared/config/routes.ts` stores route constants.
7. `/` redirects to `/trading`.
8. `/trading` renders `TradingPage`.
9. Unknown routes redirect to `/trading`.

---

## 6. Styling model

1. The only project CSS file under `src` is `src/app/styles/index.css`.
2. Tailwind CSS v4 is imported through `@import "tailwindcss"`.
3. shadcn/ui theme variables are bridged to the Vera visual tokens inside `src/app/styles/index.css`.
4. Component-level styling is implemented with Tailwind utility classes.
5. Raw Tailwind colour classes are not used for application status colours; semantic tokens are used instead.
6. Current semantic colour tokens include `primary`, `destructive`, `success`, `warning`, and `info`.
7. Inline `style=` usage is not present in the current TS/TSX source.
8. `dangerouslySetInnerHTML` is not present in the current TS/TSX source.
9. Asset icons are imported as SVG React components through SVGR.
10. The palette picker swatches use CSS variables in the Tailwind entrypoint and class-based swatch mapping.
11. Visual parity with the original prototype is a separate UI refinement task. The current codebase is structured for the target stack and semantic styling.

Useful checks:

```powershell
Get-ChildItem src -Recurse -Include *.css
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern "style="
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern "dangerouslySetInnerHTML|assetIconSvg"
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern "emerald-|red-|orange-|amber-|yellow-|blue-|text-white|bg-white|bg-black"
```

Expected result:

1. Only `src/app/styles/index.css` is returned by the CSS search.
2. No application matches for inline `style=`.
3. No application matches for `dangerouslySetInnerHTML` or `assetIconSvg`.
4. No application matches for raw Tailwind colour patterns.

---

## 7. UI and logic separation

The main widgets and transfer features use a container/view split.

Container files read stores, run derived calculations, call actions, and pass props into presentational views.

Presentational view files render UI and receive data/callbacks through props.

Current container/view pairs:

```text
Topbar.tsx                    -> TopbarView.tsx
OrderEntry.tsx                -> OrderEntryView.tsx
RfqHero.tsx                   -> RfqHeroView.tsx
Portfolio.tsx                 -> PortfolioView.tsx + BalanceCard.tsx
ExecutionsTable.tsx           -> ExecutionsTableView.tsx
TransactionsTable.tsx         -> TransactionsTableView.tsx
DepositDialog.tsx             -> DepositDialogView.tsx
WithdrawDialog.tsx            -> WithdrawDialogView.tsx
```

Store access is expected in container files only.

Useful check:

```powershell
Get-ChildItem -Path src\widgets,src\features -Recurse -Include *.tsx,*.ts | Select-String -Pattern "useTradeStore|useOrderStore|useUiStore"
```

Expected container files with store access:

```text
src/widgets/activity-panel/ui/ExecutionsTable.tsx
src/widgets/activity-panel/ui/TransactionsTable.tsx
src/widgets/order-entry/ui/OrderEntry.tsx
src/widgets/portfolio-panel/ui/Portfolio.tsx
src/widgets/rfq-panel/ui/RfqHero.tsx
src/widgets/topbar/ui/Topbar.tsx
src/features/deposit-funds/ui/DepositDialog.tsx
src/features/withdraw-funds/ui/WithdrawDialog.tsx
```

---

## 8. State model

### 8.1 `useTradeStore`

1. Stores account type.
2. Stores balances.
3. Stores reserved balances.
4. Stores executions.
5. Stores transactions.
6. Handles local order submission.
7. Handles local deposit creation.
8. Handles local withdrawal creation.
9. Handles local transaction record creation.

Important current guards:

1. `deposit()` rejects zero, negative, `NaN`, and infinite amounts.
2. `withdraw()` rejects zero, negative, `NaN`, infinite, and over-balance amounts.
3. `submitOrder()` checks buy/sell balance before mutating local balances.

### 8.2 `useOrderStore`

1. Stores the selected pair.
2. Stores the selected side.
3. Stores the quantity input.
4. Stores the quantity unit.
5. Stores the current quote.
6. Provides setters and `refreshQuote()`.

Important current behaviour:

1. `QtyUnit` is `'asset' | 'quote'`.
2. Quote-currency entry works for supported quote currencies.
3. `deriveTicket()` converts quote notional into base asset quantity when `unit === 'quote'`.

### 8.3 `useUiStore`

1. Stores theme.
2. Stores palette index.
3. Stores display currency.
4. Dispatches toast notifications through `react-toastify`.

---

## 9. Trading screen

`TradingPage` renders the main OTC trading layout:

1. `Topbar`.
2. Left column: `OrderEntry`.
3. Centre column: `RfqHero` and `ActivityPanel`.
4. Right column: `Portfolio`.
5. Lazy-loaded `DepositDialog`.
6. Lazy-loaded `WithdrawDialog`.

`TradingPage` owns the current deposit/withdraw dialog open state and selected initial asset.

---

## 10. Topbar and Settings flow

1. `Topbar` is the container for theme, palette, account type, settings state, and lazy-loaded settings dialog.
2. `TopbarView` is the presentational topbar UI.
3. `PalettePicker` receives `paletteIndex` and `onPaletteChange` via props.
4. The profile menu uses shadcn `DropdownMenu`.
5. `Settings` opens `SettingsDialog` on the Email tab.
6. `Reset Password` opens `SettingsDialog` on the Password tab.
7. `SettingsDialog` contains Email, Two-Factor Auth, and Password tabs.
8. Settings forms use react-hook-form, Zod schemas, and shadcn form primitives.
9. `Log Out` is currently UI-only and needs backend integration.

---

## 11. Activity tables

1. `ActivityPanel` renders executions and transactions activity tabs.
2. `ExecutionsTable` is the container for execution data and filters.
3. `ExecutionsTableView` renders the TanStack execution table.
4. `TransactionsTable` is the container for transaction data and filters.
5. `TransactionsTableView` renders the TanStack transaction table.
6. Table rendering uses `@tanstack/react-table` with `useReactTable`, `createColumnHelper`, `getCoreRowModel`, and `flexRender`.
7. Transaction statement export currently generates a local CSV in the browser.

---

## 12. Deposit and withdraw flows

### 12.1 Deposit

1. `DepositDialog` is the container.
2. `DepositDialogView` renders the form and step UI.
3. Validation uses `depositSchema` with react-hook-form and Zod resolver.
4. Supported method selection is Bank or Crypto.
5. Fiat deposits support SEPA/SWIFT behaviour based on the selected asset.
6. Crypto deposits use `networksFor(asset)` and static demo addresses from `NET_ADDR`.
7. Crypto deposit QR is generated with the `qrcode` package.
8. File upload is client-side demo UI only.
9. Successful submit creates a local pending transaction through the store.

### 12.2 Withdraw

1. `WithdrawDialog` is the container.
2. `WithdrawDialogView` renders the form and step UI.
3. Validation uses `withdrawSchema` with react-hook-form and Zod resolver.
4. The view receives balances via props.
5. Available balance and over-balance checks are shown in the UI.
6. Withdrawal submit calls the store through the container.
7. File upload is client-side demo UI only.
8. Successful submit creates a local withdrawal transaction through the store.

---

## 13. Financial and crypto rules

### 13.1 Quote-currency quantity

1. The order ticket uses `unit === 'quote'` for quote-currency entry.
2. Quote input is treated as the current pair quote currency.
3. `deriveTicket()` converts quote notional into base asset quantity.
4. `splitPair()` is used for base/quote extraction.

### 13.2 Crypto networks

Supported network names:

1. `Native Bitcoin`.
2. `ERC-20 (Ethereum)`.
3. `TRC-20 (Tron)`.
4. `BEP-20 (BSC)`.
5. `Cardano`.
6. `Solana`.
7. `XRP Ledger`.
8. `Avalanche C-Chain`.

Required rule:

1. Use `networksFor(asset)` for network lookup.
2. Do not use silent fallback logic such as `NETWORKS[asset] ?? ['ERC-20 (Ethereum)']`.
3. If a network is not configured for an asset, the issue should be caught during development.

---

## 14. API and backend integration seams

A shared API skeleton exists in:

```text
src/shared/api/client.ts
src/shared/api/mock.ts
src/shared/api/index.ts
```

`client.ts` uses `VITE_API_BASE_URL`.

Current backend integration seams:

1. Reference prices: replace `constants/assets.ts -> PRICES_USD` with live market data.
2. FX rates: replace `constants/assets.ts -> FX` with a real FX endpoint.
3. RFQ quote: replace local quote generation with an LP/RFQ quote endpoint.
4. Submit order: replace `useTradeStore.submitOrder()` with order/RFQ execution API.
5. Deposit: replace `useTradeStore.deposit()` with deposit API plus proof upload.
6. Withdraw: replace `useTradeStore.withdraw()` with withdrawal API.
7. History: replace seed executions and transactions with `GET /executions` and `GET /transactions`.
8. Deposit addresses: replace `NET_ADDR` with backend-generated per-user, per-network addresses.
9. Bank details: replace hard-coded bank instructions with treasury/wire-instruction API.
10. Account identity: replace static demo user/account details with auth/session/profile API.
11. Settings: connect settings forms to profile update, 2FA setup, OTP, password reset, and logout endpoints.

Recommended backend pattern:

1. Add endpoint-specific modules under `src/shared/api`.
2. Replace Zustand action bodies with async API calls.
3. Keep action signatures stable where practical.
4. Keep frontend validation, but treat backend validation as authoritative.

---

## 15. Production safety notes

1. Add server-side validation for deposits.
2. Add server-side validation for withdrawals.
3. Add server-side validation for order submission.
4. Add server-side validation for balances.
5. Add server-side validation for crypto destination addresses.
6. Add server-side validation for asset/network compatibility.
7. Add AML/sanctions checks for withdrawal destinations.
8. Generate deposit addresses server-side.
9. Add real auth/session/profile integration.
10. Add real 2FA QR/secret generation and verification.
11. Add real OTP/password reset flow.
12. Add logout integration.
13. Add an Error Boundary.
14. Add loading, error, and empty states for backend API calls.

---

## 16. Current known non-blocking item

1. Production build reports a chunk-size warning for the main bundle above 500 kB.
2. The warning does not fail the build.
3. A future performance pass can add route-level or feature-level code splitting/manual chunks.

Recommended future commit:

```text
Improve application code splitting
```

---

## 17. Recommended next steps

1. Restore visual parity with the approved prototype using the current Tailwind/shadcn architecture.
2. Connect store actions to real backend APIs through `src/shared/api`.
3. Replace static market/account data with backend data.
4. Connect Settings actions to backend endpoints.
5. Add Error Boundary.
6. Add API loading/error states.
7. Improve production code splitting to remove the chunk-size warning.
8. Add UI/e2e smoke tests for trading, deposit, withdraw, settings, and routing.

---

## 18. Implementation notes

1. Current project code should use pnpm commands.
2. Do not reintroduce `components.css`, `base.css`, or `tokens.css` as separate project CSS files.
3. Keep project styling in `src/app/styles/index.css` and Tailwind utility classes.
4. Do not use inline style objects in TSX.
5. Do not use raw Tailwind colour classes for application colours.
6. Use shadcn semantic tokens and project semantic tokens.
7. Use shadcn primitives where available.
8. Keep custom SVG icons as `.svg` files imported through SVGR.
9. Keep view components free from direct store imports.
10. Keep local Zustand stores as demo/backend-integration boundaries until real APIs are connected.
