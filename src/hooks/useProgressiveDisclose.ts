import { useEffect, useRef, useState } from 'react';

/**
 * useProgressiveDisclose
 * Returns true after a 400ms hover dwell — used for "Expert Mode" metadata reveal.
 */
export function useProgressiveDisclose(delay = 400) {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => {
      timerRef.current = setTimeout(() => setRevealed(true), delay);
    };
    const onLeave = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRevealed(false);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay]);

  return { ref, revealed };
}
