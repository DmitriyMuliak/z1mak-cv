# New Feature Plan: Senior-Level Frontend Enhancements

## Context

The backend SSE streaming architecture (RFC 6902 JSON Patches) is sophisticated, but the visual presentation is completely flat — plain bold numbers, basic 0.8s opacity fades, static text. These 5 features close that gap and demonstrate senior-level frontend craftsmanship.

---

## Implementation Order

| # | Feature | Status | Files |
|---|---------|--------|-------|
| 1 | Score Rings — Odometer + Radial SVG Progress | `pending` | `score-rings.md` |
| 2 | Typewriter Summary — Streaming text + Skip control | `pending` | `typewriter-summary.md` |
| 3 | Skill Radar — Recharts + IntersectionObserver | `pending` | `skill-radar.md` |
| 4 | View Transitions — Skeleton → Real Content Morph | `pending` | `view-transitions.md` |
| 5 | Section Choreography — SSE-driven reveal queue | `pending` | `section-choreography.md` |

---

## Feature 1: Score Rings (Odometer + Radial SVG Progress)

**Visual:** When `overallAnalysis` SSE patch lands, scores count up from 0 using spring-physics easing. Each number sits inside a radial SVG ring that fills simultaneously. Color is green (≥80), yellow (≥60), red (<60).

**Files created:**
- `src/hooks/useAnimatedNumber.ts`
- `src/features/cv-checker/components/ReportRenderer/components/Header/ScoreRing.tsx`

**Files modified:**
- `src/features/cv-checker/components/ReportRenderer/components/Header/Scores.tsx`

**Architect signals:** `requestAnimationFrame` with `performance.now()` timeline, spring easing (`1 - e^(-6t)*cos(10t)`), `prefers-reduced-motion` respected, zero new dependencies.

---

## Feature 2: Typewriter Summary + Skip Control

**Visual:** `suitabilitySummary` types itself out at 30ms/char when it first arrives via SSE. Skip button appears after 500ms. On page reload (data already present) — instant render. Completion glow fades out.

**Files created:**
- `src/features/cv-checker/components/ReportRenderer/components/TypewriterText.tsx`

**Files modified:**
- `src/features/cv-checker/components/ReportRenderer/components/Header/index.tsx`

**Architect signals:** `hasStreamedThisSession` ref pattern distinguishes SSE-live vs hydrated data without polluting Zustand store; reuses existing `useTypewriter.ts` (open/closed principle).

---

## Feature 3: Skill Radar Chart (Recharts + IntersectionObserver)

**Visual:** Animated `RadarChart` above Skills list. Animates only when scrolled into viewport. Individual skill rows get left-border color strips mapped to `status` via `--chart-*` CSS variables.

**Files created:**
- `src/hooks/useIntersectionTrigger.ts`
- `src/features/cv-checker/utils/deriveRadarData.ts`
- `src/features/cv-checker/components/ReportRenderer/components/SkillRadar.tsx`

**Files modified:**
- `src/features/cv-checker/components/ReportRenderer/components/Skills.tsx`

**New dependency:** `recharts`

**Architect signals:** One-shot `IntersectionObserver` for animation gating, pure `deriveRadarData` function (independently testable), CSS variable color mapping respects dark mode.

---

## Feature 4: View Transitions API — Skeleton → Real Content Morph

**Visual:** Each section card has a `view-transition-name`. When SSE patch lands and real component replaces skeleton, browser morphs the skeleton geometry into real content. Per-section skeletons (not full-page blur).

**Files created:**
- `src/features/cv-checker/components/ReportRenderer/components/ProgressiveReportSkeleton.tsx`

**Files modified:**
- `src/features/cv-checker/components/ReportRenderer/components/ReportContent.tsx`
- `src/features/cv-checker/components/ReportRenderer/components/ui/ReportSection.tsx`
- `src/app/globals.css`

**Architect signals:** View Transitions as progressive enhancement (degrades gracefully), per-section skeleton model, native browser API.

---

## Feature 5: SSE-Driven Section Reveal Choreography

**Visual:** Each section slides in from below with spring animation exactly when its SSE patch arrives. Pulsing "streaming" indicator below last section shrinks away with `scale(0)` on completion.

**Files created:**
- `src/features/cv-checker/hooks/useSectionRevealQueue.ts`
- `src/features/cv-checker/components/ReportRenderer/components/StreamingTail.tsx`

**Files modified:**
- `src/features/cv-checker/components/ReportRenderer/components/ReportContent.tsx`

**Architect signals:** Imperative Zustand `.subscribe()` API for queue management (avoids re-renders), Framer Motion `layout` for automatic FLIP, `StreamingTail` as single-slice subscriber.
