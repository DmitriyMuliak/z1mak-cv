# Feature: Score Rings — Odometer + Radial SVG Progress

## What Changed

Replaced the plain `text-3xl font-bold` score numbers in the report header with animated radial SVG rings. When the `overallAnalysis` SSE patch arrives and the `Scores` component mounts, each score counts up from 0 to its final value using spring-physics easing, while the SVG ring fills simultaneously.

## Files Created

### `src/hooks/useAnimatedNumber.ts`

Generic hook that animates a number from 0 to `target` using `requestAnimationFrame` + `performance.now()`. EaseOut formula. `prefers-reduced-motion`: returns the target immediately without animation.

### `src/features/cv-checker/components/ReportRenderer/components/Header/ScoreRing.tsx`

Client component that wraps `useAnimatedNumber` with a pure SVG radial progress ring (96×96px by default). Ring color transitions automatically based on score range:

- `≥ 80` → teal (`--chart-2`) — strong match
- `≥ 60` → yellow (`--chart-4`) — moderate
- `< 60` → red (`--destructive`) — weak

## Files Modified

### `src/features/cv-checker/components/ReportRenderer/components/Header/Scores.tsx`

- Replaced `<div className="text-3xl font-bold">` with `<ScoreRing value={item.value} label={t(item.tKey)} />`
- Changed layout from `grid sm:grid-cols-2` to `flex flex-wrap gap-4` to better accommodate circular rings
- Added TypeScript type predicate in `.filter()` for correct narrowing of `number | undefined` to `number`

## Architect Signals

- `requestAnimationFrame` with `performance.now()` — proper frame-budget animation, not `setInterval`
- Spring easing in pure math — no animation library needed
- `prefers-reduced-motion` respected — accessibility first
- SVG `stroke-dasharray`/`stroke-dashoffset` — GPU-composited, no layout thrashing
- Zero new dependencies
