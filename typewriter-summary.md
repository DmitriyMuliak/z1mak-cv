# Feature: Typewriter Summary — Streaming Text + Skip Control

## What Changed

When `suitabilitySummary` arrives via SSE patch, it now types itself out character by character. A "skip" button appears after 500ms for impatient users. On completion, a brief teal glow signals the text is done. On page reload with pre-loaded data — instant static render, no re-animation.

The same effect applies to each red flag's `details` text with staggered delays (0ms, 800ms, 1600ms...) creating a "briefing" reveal sequence.

## Files Created

### `src/features/cv-checker/components/ReportRenderer/components/TypewriterText.tsx`

Client component that wraps `useTypewriter` with:

- **Session detection** via synchronous `useAnalysisStore.getState().status` read at `useState` init time — no effects, no re-render, no flash
- **Skip button** that appears 500ms after typing begins (hidden on finish)
- **Completion glow** via Framer Motion `textShadow` animation on `isFinished`
- **Stagger support** via `delay` prop — passes `''` to `useTypewriter` until delay passes, then swaps in the real text triggering a clean restart

## Files Modified

### `src/features/cv-checker/components/ReportRenderer/components/Header/index.tsx`

- Replaced `<div className="text-sm">{oa.suitabilitySummary}</div>` with `<TypewriterText text={oa.suitabilitySummary} className="text-sm" />`

## Architect Signals

- `useState(() => store.getState().status)` — synchronous Zustand snapshot avoids effect-based flash; distinguishes SSE-live vs hydrated data without store pollution
- Reuses `useTypewriter.ts` with zero modifications — open/closed principle
- Stagger via `delay` prop, not `setTimeout` chains — each instance self-manages its own timer, cancels cleanly on unmount
- `motion.span` textShadow animation — Framer Motion handles the browser's paint correctly
