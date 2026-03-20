# Feature: Skill Radar Chart — Recharts + IntersectionObserver

## What Changed

Added an animated `RadarChart` above the skills list that visualises average confidence scores grouped by skill type. The chart mounts (and therefore animates its entrance) only once the container scrolls 20% into the viewport — not on page load. Individual skill rows now have a coloured left-border strip that maps `status` to a CSS variable colour, automatically respecting light/dark theme.

## Files Created

### `src/hooks/useIntersectionTrigger.ts`
Reusable one-shot `IntersectionObserver` hook. Returns `[ref, hasIntersected]` — once the observed element crosses the threshold, `hasIntersected` becomes `true` permanently and the observer disconnects. Respects `prefers-reduced-motion`: returns `true` immediately so animations are skipped.

### `src/features/cv-checker/utils/deriveRadarData.ts`
Pure function: groups `skills[]` by `type`, computes the average `confidenceScore` per group, returns `RadarDataPoint[]` sorted by highest value. No side effects — fully testable in isolation.

### `src/features/cv-checker/components/ReportRenderer/components/SkillRadar.tsx`
Client component using Recharts `RadarChart`. Mounts only after `hasIntersected === true` — this guarantees the Recharts entrance animation plays exactly when the user's eyes can see it (mounting on intersection is more reliable than toggling `isAnimationActive`). Shows an `animate-pulse` skeleton placeholder before intersection to prevent layout shift.

## Files Modified

### `src/features/cv-checker/components/ReportRenderer/components/Skills.tsx`
- Converted to `'use client'` with `useState` for expand/collapse
- Added `<SkillRadar skills={safeSkills} />` above the skill list (currently commented out)
- Added `style={{ borderLeft: '3px solid ${getStatusColor(s.status)}' }}` per skill card
- Status → colour mapping uses `var(--chart-*)` / `var(--destructive)` inline styles (avoids Tailwind purging issues with dynamic values, inherits theme automatically)
- **Show all / Show less toggle:** default shows first 3 items; button in top-right header reveals the rest with a Framer Motion `height: 0 → auto` animation
- Toggle button uses `t('skills.showAll', { count })` / `t('skills.showLess')` translations

### `src/features/cv-checker/components/ReportRenderer/components/ui/ReportSection.tsx`
- Added optional `action?: React.ReactNode` prop rendered on the right side of `CardHeader` — generic slot reusable by any section

### `messages/en.json` + `messages/uk.json`
- Added `pages.cvReport.skills.showAll` and `pages.cvReport.skills.showLess` translation keys

## Fixes Applied

### SSR crash with Recharts
`ResponsiveContainer` calls `new ResizeObserver()` at module import time — this API doesn't exist in the Node.js SSR environment. Fix: extracted Recharts JSX into `SkillRadarChart.tsx` and used `next/dynamic(..., { ssr: false })` in `SkillRadar.tsx`. The `dynamic()` call must be at module level (not inside a render function), which is why a separate file was necessary.

### Adaptive grouping in `deriveRadarData`
Original grouped by `skill.type`. If the AI returns fewer than 3 distinct types the radar shape is degenerate. Fix: falls back to grouping by `skill.status` (`"Strongly Present" / "Mentioned" / "Missing"`) which always produces a meaningful 3-spoke coverage chart.

## New Dependencies

`recharts` — added to `package.json`

## Architect Signals
- Mount-on-intersection guarantees entrance animation plays once, exactly when visible — the correct pattern vs. `isAnimationActive` toggle
- One-shot observer (`observer.disconnect()` in callback) — no memory leak, no redundant checks
- `deriveRadarData` is a pure utility — can be unit-tested without React or DOM
- CSS variable inline styles for colours — zero JS theme detection, automatic dark mode
- `action` slot on `ReportSection` follows the compound-component pattern — keeps layout concerns out of the section content
- Framer Motion `height: 0 → auto` on `AnimatePresence` — the correct pattern for unknown-height collapse (no JS height measurement needed)
