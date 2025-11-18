import { useEffect, useRef, useCallback, useState } from 'react';

export function useTypewriter(text: string, speed = 50) {
  const ref = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const frameRef = useRef<number | null>(null);

  const [isFinished, setIsFinished] = useState(false);

  const skip = useCallback(() => {
    if (!ref.current) return;
    cancelAnimationFrame(frameRef.current!);

    ref.current.textContent = text;
    animationRef.current?.finish();
    setIsFinished(true);
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.textContent = '';
    setIsFinished(false);

    // total duration = N chars * speed
    const duration = text.length * speed;

    const effect = new KeyframeEffect(el, [{ opacity: 1 }], {
      duration,
      fill: 'forwards',
      easing: 'linear',
    });

    const animation = new Animation(effect, document.timeline);
    animation.play();
    animationRef.current = animation;

    const update = () => {
      const t = animation.currentTime as number | null;
      if (t === null) {
        frameRef.current = requestAnimationFrame(update);
        return;
      }

      const progress = t / duration;
      // Floor - we don't wan't to show half letter
      // Min - progress * t can be bigger than text.length because of t
      const chars = Math.min(text.length, Math.floor(progress * text.length));

      el.textContent = text.slice(0, chars);

      if (chars >= text.length) {
        setIsFinished(true);
        return; // stop
      }

      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      animation.cancel();
      cancelAnimationFrame(frameRef.current!);
    };
  }, [text, speed]);

  return { ref, skip, isFinished };
}
