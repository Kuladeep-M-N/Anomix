import { useEffect, useRef } from 'react';

/**
 * useScrollSync
 * Replaces @fiddle-digital/string-tune's scroll listener with a
 * high-performance rAF-based alternative. All scroll-linked animations
 * are orchestrated here, off the main layout thread.
 */
export function useScrollProgress(cb: (progress: number) => void) {
  const rafRef = useRef<number | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
        if (scrollY !== lastY.current) {
          lastY.current = scrollY;
          cb(progress);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cb]);
}

export function useScrollY(cb: (y: number) => void) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        cb(window.scrollY);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cb]);
}

/**
 * useIntersectionReveal
 * Adds 'revealed' class to elements when they enter the viewport.
 */
export function useIntersectionReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string = '.reveal-item',
  options?: IntersectionObserverInit,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = container.querySelectorAll(selector);
            items.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('revealed');
              }, i * 80);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...options },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, selector]);
}
