import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { TradingPage } from '@/pages/trading';
import { ROUTES } from '@/shared/config/routes';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.root} element={<Navigate to={ROUTES.trading} replace />} />
        <Route path={ROUTES.trading} element={<TradingPage />} />
        <Route path="*" element={<Navigate to={ROUTES.trading} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
