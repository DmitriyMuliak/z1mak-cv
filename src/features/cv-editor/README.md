# CV Editor — Feature Overview

## Sections

- **Header** — name, email, phone, location, LinkedIn, website (with optional display labels)
- **Summary** — rich-text professional summary (bold, italic, lists); always rendered on page 1
- **Experience** — multiple work entries with job title, company, dates, location, rich-text description
- **Education** — institution, degree, field of study, dates, GPA
- **Skills** — grouped skill categories with tag-style items
- **Certifications** — name, issuer, date, optional URL
- **Languages** — language + proficiency level
- **Template** — switch between ATS Clean and ATS Modern styles; choose Roboto or PT Serif font

## Multi-page support

- Add/delete pages via the **Pages** tab
- Each entry (experience, education, skills, certifications, languages) carries a `page` index — it belongs exclusively to one page
- Switch between pages inside each section form using the **Page** select — the list shows only entries for the selected page; new entries are created for that page
- Deleting a page moves its entries to the previous page automatically

### Section order per page

- In the **Pages** tab, each page tile shows badges for all its sections in the current render order
- Badges with content are fully visible; empty sections appear as a dashed outline (pre-arrangement possible)
- Drag any badge to reorder sections within a page — the live preview and PDF reflect the new order immediately

## Editor UX

- **Live preview** — A4 canvas updates in real time as you type
- **Drag & drop** reordering within each section list
- **Collapse / expand** individual entries to reduce visual noise
- **Undo / Redo** — full edit history (up to 100 steps) via zundo
- **Reset** — restore to empty document
- **Unsaved indicator** — toolbar flags unsaved changes

## Export

- **Export PDF** — offloaded to a Web Worker so the UI stays responsive during generation
- Two templates: `ATS Clean` and `ATS Modern`
- Two fonts: `Roboto` (sans-serif, ATS-friendly) and `PT Serif` (serif, classic look), both supporting Latin and Cyrillic
- Multi-page PDFs respect per-page entry assignment and section order

## Mobile

- On small screens the preview is hidden; a **Live Preview** button opens a full-screen overlay
- On `lg+` breakpoint the overlay closes automatically and the standard side-by-side layout activates

## Data model

- Document content lives in `resumeEditorStore` (Zustand + Immer + zundo)
- Layout metadata (template, font, page count, section order) lives in `templateSettingsStore`
- Entries reference their page via an optional `page: number` field (0-indexed, defaults to 0)
- Section render order per page is stored as `sectionOrder: SectionKey[][]`
