import { useEffect, useRef, useState } from 'react';

// A4 at 96 dpi: 210mm × 297mm
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export function useA4Scale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / A4_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, scale };
}
