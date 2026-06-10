import { useEffect, useRef, useState } from 'react';
import { QUOTE_TTL } from '@/constants/market';

// Timer RFQ quotes with auto-update.
export function useCountdown(opts?: { start?: number; resetTo?: number; onExpire?: () => void }) {
  const start = opts?.start ?? QUOTE_TTL;
  const resetTo = opts?.resetTo ?? 30;
  const [secs, setSecs] = useState(start);
  const onExpire = useRef(opts?.onExpire);
  onExpire.current = opts?.onExpire;

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecs((prev) => {
        if (prev > 1) return prev - 1;
        onExpire.current?.();
        return resetTo;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [resetTo]);

  return { secs, reset: () => setSecs(resetTo) };
}

