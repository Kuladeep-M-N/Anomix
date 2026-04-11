import { useEffect, useRef } from 'react';

/**
 * useMagneticCursor
 * Tracks cursor position globally and:
 * 1. Updates CSS --mouse-x / --mouse-y on each glass-card for the flashlight effect.
 * 2. Applies a subtle magnetic pull to elements with data-magnetic attribute.
 */
export function useMagneticCursor() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        // Flashlight & Tilt effect: update cards
        const cards = document.querySelectorAll<HTMLElement>('.glass-card');
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Flashlight position
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          // Subtle Tilt (Refraction Angle)
          // Calc normalized distance from center (-1 to 1)
          const tiltX = (e.clientX - cx) / (rect.width / 2);
          const tiltY = (e.clientY - cy) / (rect.height / 2);
          
          // Only tilt if mouse is nearby (within 300px)
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          if (dist < 300) {
            const power = (1 - dist / 300);
            card.style.setProperty('--tilt-x', `${tiltY * power * 2}deg`);
            card.style.setProperty('--tilt-y', `${-tiltX * power * 2}deg`);
          } else {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
          }
        });

        // Magnetic pull for the launch button
        const btn = document.querySelector<HTMLElement>('.launch-btn');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const radius = 100;
          if (dist < radius) {
            const strength = (1 - dist / radius) * 6;
            const dx = ((e.clientX - cx) / dist) * strength;
            const dy = ((e.clientY - cy) / dist) * strength;
            btn.style.setProperty('--btn-dx', `${dx}px`);
            btn.style.setProperty('--btn-dy', `${dy}px`);
          } else {
            btn.style.setProperty('--btn-dx', '0px');
            btn.style.setProperty('--btn-dy', '0px');
          }
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}
