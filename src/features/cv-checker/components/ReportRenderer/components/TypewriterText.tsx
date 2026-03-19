'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useAnalysisStore } from '@/features/cv-checker/store/analysisStore';

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** ms per character (default 30) */
  speed?: number;
  /** ms delay before typing starts — use for staggered lists (default 0) */
  delay?: number;
}

/**
 * Renders text with a typewriter animation when the analysis is actively
 * streaming (status === 'in_progress' at mount time). On page reload with
 * pre-loaded data the text renders statically — no unnecessary re-animation.
 *
 * Session detection: reads `useAnalysisStore.getState().status` synchronously
 * during state initialisation — no effects, no re-renders, no flash.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className,
  speed = 30,
  delay = 0,
}) => {
  // Synchronous snapshot — true only when data is arriving live this session.
  // On page reload `status` is already 'completed', so this is false.
  const [shouldAnimate] = useState(() => useAnalysisStore.getState().status === 'in_progress');

  // Gate: hold off the text until the stagger delay has passed.
  const [ready, setReady] = useState(delay === 0);

  useEffect(() => {
    if (!shouldAnimate || delay === 0) return;
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [shouldAnimate, delay]);

  // When ready === false we pass '' — useTypewriter completes instantly (0 duration)
  // then restarts when text changes to the real value once ready becomes true.
  const { ref, skip, isFinished } = useTypewriter(ready ? text : '', speed);

  const [showSkip, setShowSkip] = useState(false);

  // Show skip button 500ms after typing begins.
  useEffect(() => {
    if (!shouldAnimate || !ready || isFinished) return;
    const t = setTimeout(() => setShowSkip(true), 500);
    return () => clearTimeout(t);
  }, [shouldAnimate, ready, isFinished]);

  // Hide skip button once animation completes.
  useEffect(() => {
    if (isFinished) setShowSkip(false);
  }, [isFinished]);

  // Static render for pre-loaded data (page reload / cached results).
  if (!shouldAnimate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={`relative ${className ?? ''}`}
      // Completion glow: brief teal pulse when typing finishes.
      animate={
        isFinished && ready
          ? {
              textShadow: ['0 0 0px transparent', '0 0 10px var(--chart-2)', '0 0 0px transparent'],
            }
          : {}
      }
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* useTypewriter writes directly to this element's textContent */}
      <span ref={ref} />

      {showSkip && (
        <button
          onClick={() => {
            skip();
            setShowSkip(false);
          }}
          className="ml-1.5 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          aria-label="Skip typewriter animation"
        >
          skip
        </button>
      )}
    </motion.span>
  );
};
