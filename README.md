# Vera Finance — OTC RFQ Platform

React + TypeScript frontend for the Vera Finance over-the-counter RFQ trading desk.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check + production build to `dist/`
- `npm run preview` — preview the production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run test` — Vitest unit tests

## Stack
React 18 · TypeScript (strict) · Vite 5 · Zustand.

## Where things live
- `src/store/` — application state + the actions that become backend calls
- `src/lib/` — pure logic (valuation, formatting, quotes, palette, qr)
- `src/components/` — UI, grouped by area
- `src/styles/` — design tokens (`tokens.css`), reset (`base.css`), components (`components.css`)
- `src/types/` — domain types

## For integrators
See **HANDOFF.md** for the architecture, the state model, and the full list of
**backend integration seams** (every place to swap mock data for real API calls
is marked with a `BACKEND SEAM` comment in the code).
