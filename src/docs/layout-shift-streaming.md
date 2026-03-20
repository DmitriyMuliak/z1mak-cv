# Layout Shift During Streaming Section Reveal

## Problem

When SSE patches arrive out of order, sections are inserted between already-rendered ones
(enforced by `UI_SECTION_ORDER` sorting in `ReportContent.tsx`). This causes existing
sections below the insertion point to jump down instantly — no animation.

**Example:** sections 1, 2, 5 are visible → patch for section 3 arrives → sections 5+ jump down.

### Why `layout` prop alone does not fix it

Framer Motion's `layout` FLIP animation requires a **re-render** of each element to measure
its old and new DOM position (delta). If the position delta is detected, Framer Motion
animates the element from old → new position instead of jumping.

`SectionItem` is memoized by the **React 19 Compiler** — when a new section is inserted,
existing `SectionItem` instances receive identical props (`sectionKey`, `showImmediately`)
and bail out of re-rendering. Framer Motion never measures their shifted positions, so FLIP
never fires.

```
Section 2  ── memoized, no re-render → FLIP skipped
Section 3  ── new, enter animation fires ✓
Section 5  ── memoized, no re-render → FLIP skipped → jumps instantly ✗
```

## Solution

Wrap `displayedSections.map(...)` in Framer Motion's `<LayoutGroup>`.

`LayoutGroup` maintains a shared layout context. When **any** member `motion` element
updates (new section mounts), it notifies all other members to measure their positions —
without requiring a React re-render of each individual component.

```tsx
// ReportContent.tsx
import { LayoutGroup, motion } from 'framer-motion';

// inside return:
<LayoutGroup>
  {displayedSections.map((sectionKey) => (
    <SectionItem key={sectionKey} sectionKey={sectionKey} showImmediately={showImmediately} />
  ))}
  <StreamingTail />
</LayoutGroup>
```

```tsx
// SectionItem — keep layout prop
<motion.div layout variants={sectionVariants} initial={...} animate="visible">
  <Component />
</motion.div>
```

This preserves React 19 Compiler memoization (no unnecessary re-renders) while allowing
Framer Motion to coordinate position measurements across the group.

## Files to change

- `src/features/cv-checker/components/ReportRenderer/components/ReportContent.tsx`
  - add `LayoutGroup` import
  - wrap map in `<LayoutGroup>`
  - restore `layout` prop on `SectionItem`'s `motion.div`
