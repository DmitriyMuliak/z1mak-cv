'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

type Item = { id: string; text: string };

export default function FlipList(): React.JSX.Element {
  const [items, setItems] = useState<Item[]>([
    { id: 'a', text: '🍎 Apple' },
    { id: 'b', text: '🍌 Banana' },
    { id: 'c', text: '🍒 Cherry' },
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  // Зберігаємо "first" позиції перед мутацією
  const firstRectsRef = useRef<Map<string, DOMRect>>(new Map());

  // --- capture BEFORE mutation (ви викликаєте це прямо перед setItems)
  const captureFirstRects = () => {
    const map = new Map<string, DOMRect>();
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      const id = el.dataset.flipId!;
      map.set(id, el.getBoundingClientRect());
    });
    firstRectsRef.current = map;
  };

  const removeFirst = () => {
    // захопили старі позиції
    captureFirstRects();
    // потім змінили state (DOM зміниться у наступному commit)
    setItems((prev) => prev.slice(1));
  };

  // --- після commit (перед paint) — зчитуємо last, робимо invert і в rAF запускаємо animation
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstRects = firstRectsRef.current;
    if (!firstRects || firstRects.size === 0) return;

    // 1) Invert: застосувати transform з різницею (без transition)
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      const id = el.dataset.flipId!;
      const first = firstRects.get(id);
      if (!first) return; // наприклад, нові елементи — ігноруємо
      const last = el.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;

      if (dx !== 0 || dy !== 0) {
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        // читання стилю змушує браузер застосувати зміни синхронно (force reflow)

        el.getBoundingClientRect();
      }
    });

    // 2) Play: в наступному кадрі включаємо transition і скидаємо transform
    requestAnimationFrame(() => {
      container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
        // якщо ми раніше поставили трансформ — анімуємо назад
        if (el.style.transform && el.style.transform !== 'none') {
          el.style.transition = 'transform 300ms ease';
          el.style.transform = 'translate(0, 0)';

          const cleanup = () => {
            // прибираємо інлайни після анімації — щоб не накопичувати стилі
            el.style.transition = '';
            el.style.transform = '';
            el.removeEventListener('transitionend', cleanup);
          };
          el.addEventListener('transitionend', cleanup);
        }
      });

      // очистимо firstRectsRef, щоб наступна операція не сприймала застарілі дані
      firstRectsRef.current = new Map();
    });
  }, [items]); // запускається кожного разу після commit, коли items змінився

  return (
    <div style={{ padding: 20 }}>
      <button onClick={removeFirst}>Remove first</button>

      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 20,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-flip-id={item.id}
            style={{
              background: 'lightblue',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
