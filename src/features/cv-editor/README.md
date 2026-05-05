# CV Editor — Feature Overview

## Sections

- **Header** — name, email, phone, location, LinkedIn, website (with optional display labels)
- **Summary** — rich-text professional summary (bold, italic, lists)
- **Experience** — multiple work entries with job title, company, dates, location, rich-text description
- **Education** — institution, degree, field of study, dates, GPA
- **Skills** — grouped skill categories with tag-style items
- **Certifications** — name, issuer, date, optional URL
- **Languages** — language + proficiency level
- **Template** — switch between ATS Clean and ATS Modern styles; choose Roboto or PT Serif font

## Multi-page support

- Add/delete pages via the **Pages** tab
- Each section entry (experience, education, skills, etc.) is assigned to a specific page
- Switch between pages inside each section form using the **Page** select — entries are isolated per page
- Preview and PDF export reflect the per-page layout automatically

## Editor UX

- **Live preview** — A4 canvas updates in real time as you type
- **Drag & drop** reordering within each section
- **Collapse / expand** individual entries
- **Undo / Redo** — full history via zundo
- **Reset** — restore to empty document
- **Unsaved indicator** — toolbar shows when there are unsaved changes

## Export

- **Export PDF** — generates a pixel-accurate PDF via a Web Worker (non-blocking)
- Two templates: `ATS Clean` and `ATS Modern`
- Two fonts: `Roboto` (sans-serif) and `PT Serif` (serif), both supporting Latin and Cyrillic

## Mobile

- On small screens the preview is hidden; a **Live Preview** button opens a full-screen modal
- On `lg+` breakpoint the modal closes automatically and the side-by-side layout activates
