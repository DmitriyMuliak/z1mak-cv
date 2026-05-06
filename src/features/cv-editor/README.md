# CV Editor — Feature Overview

## Sections

- **Header** — name, email, phone, location, LinkedIn, website (with optional display labels)
- **Summary** — rich-text professional summary (bold, italic, lists); always rendered on page 1
- **Experience** — multiple work entries with job title, company, dates, location, rich-text description
- **Education** — institution, degree, field of study, dates, GPA
- **Skills** — grouped skill categories with tag-style items
- **Certifications** — name, issuer, date, optional credential URL; collapse/expand per entry
- **Languages** — language name + proficiency level (Native / Fluent / Advanced / Intermediate / Basic) chosen from a dropdown; compact single-row layout
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

## Section options

Each section form shows an **Options** button (gear icon) next to the page selector. Clicking it opens a modal scoped to the current page with per-section settings:

- **Hide section title** — omits the section heading in both the live preview and the exported PDF (useful for a cleaner single-section page or when the heading is redundant)

Settings are stored per-page in `templateSettingsStore.sectionSettings` and threaded through the full PDF pipeline.

## Editor UX

- **Live preview** — A4 canvas updates in real time as you type
- **Overflow warning** — if a page's content exceeds A4 height (1123 px at 96 dpi), an amber banner appears directly below that page: *"Page content is too large, which may result in incorrect PDF export."* Detected via `ResizeObserver`; per-page, so only the overflowing page is flagged
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
- **Localized PDF output** — section headings and proficiency level labels are translated into the active locale (e.g. Ukrainian UI produces a Ukrainian-labelled PDF); falls back to English defaults

## Mobile

- On small screens the preview is hidden; a **Live Preview** button opens a full-screen overlay
- On `lg+` breakpoint the overlay closes automatically and the standard side-by-side layout activates

## Internationalization

- All editor UI labels, form fields, and section headings are translated via `next-intl` (`messages/en.json`, `messages/uk.json`)
- Proficiency level labels for the Languages section (`native`, `fluent`, `advanced`, `intermediate`, `basic`) are translated both in the live preview and in PDF output
- PDF templates receive a `PdfLabels` object at export time; `DEFAULT_PDF_LABELS` (English) is used as a fallback when running outside a Next.js context (e.g. tests)

## Data model

- Document content lives in `resumeEditorStore` (Zustand + Immer + zundo)
- Layout metadata (template, font, page count, section order) lives in `templateSettingsStore`
- Entries reference their page via an optional `page: number` field (0-indexed, defaults to 0)
- Section render order per page is stored as `sectionOrder: SectionKey[][]`
- `CertificationEntry`: `{ id, name, issuer, date?, url?, page? }`
- `LanguageEntry`: `{ id, language, proficiency: LanguageProficiency, page? }`
