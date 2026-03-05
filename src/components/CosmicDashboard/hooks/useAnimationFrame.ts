import { useEffect, useRef, useCallback } from 'react';

export function useAnimationFrame(
  callback: (elapsed: number) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    startRef.current = null;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      callbackRef.current(timestamp - startRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [enabled]);
}

export function useCountdown(targetTime: number | null): string {
  const ref = useRef<HTMLSpanElement>(null);

  const format = useCallback((ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  useAnimationFrame(() => {
    if (!targetTime || !ref.current) return;
    const remaining = targetTime - Date.now();
    ref.current.textContent = format(remaining);
  }, targetTime !== null);

  return targetTime ? format(targetTime - Date.now()) : '00:00';
}
