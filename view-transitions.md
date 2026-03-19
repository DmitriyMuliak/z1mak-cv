# Feature: Section Reveal Animation (Framer Motion)

## Decision

View Transitions API was evaluated for per-section streaming reveals but rejected — it captures a full-page snapshot and is designed for page-to-page navigation morphing (shared elements between routes), not for animating individual blocks into existence during an SSE stream.

**VT CSS keyframes are kept in `globals.css`** for future use with Next.js App Router page transitions.

## What Was Implemented

Report sections animate in one at a time using **Framer Motion** `motion.div` with `variants`.

## Files Modified

### `src/features/cv-checker/components/ReportRenderer/components/ReportContent.tsx`

`displayedSections` state accumulates section keys as SSE patches arrive. Each key added triggers Framer Motion enter animation.

```typescript
const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.34, 1.2, 0.64, 1] },
  },
};
```

**Session detection** — synchronous Zustand snapshot:
```typescript
const [showImmediately] = useState(
  () => useAnalysisStore.getState().status === 'completed',
);
```
- `completed` on mount → page reload → `initial={false}` → sections appear instantly
- `in_progress` on mount → live SSE → sections animate from `hidden` → `visible`

**`knownSections` ref** — guards against re-adding sections on re-renders caused by unrelated store updates.

### `src/app/globals.css`

VT keyframes retained for future page transition use:
```css
@keyframes vt-section-in { ... }
::view-transition-old(*) { animation: none; }
::view-transition-new(*) { animation: 450ms cubic-bezier(0.34, 1.2, 0.64, 1) both vt-section-in; }
```
