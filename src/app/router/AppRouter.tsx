import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { TradingPage } from '@/pages/trading';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/trading" replace />} />
        <Route path="/trading" element={<TradingPage />} />
      </Routes>
    </BrowserRouter>
  );
}