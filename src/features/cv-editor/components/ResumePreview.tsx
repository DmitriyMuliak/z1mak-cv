'use client';

import { useResumeEditorStore } from '../store/resumeEditorStore';
import type { TemplateStyle, FontOption } from '../hooks/usePdfExport';
type PdfTemplate = TemplateStyle;
import type {
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  CertificationEntry,
  LanguageEntry,
} from '../schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Section wrapper — applies consistent spacing + data-resume-path attribute
// ---------------------------------------------------------------------------

interface SectionProps {
  path: string;
  children: React.ReactNode;
  className?: string;
}

function Section({ path, children, className = '' }: SectionProps) {
  return (
    <section data-resume-path={path} className={`mb-5 ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({
  children,
  template,
}: {
  children: React.ReactNode;
  template: PdfTemplate;
}) {
  if (template === 'atsModern') {
    return (
      <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground pb-1 mb-2 pl-2 border-l-[3px] border-blue-600">
        {children}
      </h2>
    );
  }
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function ExperienceItem({ entry, index }: { entry: ExperienceEntry; index: number }) {
  return (
    <div data-resume-path={`/experience/${index}`} className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-sm text-foreground">{entry.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {entry.startDate} — {entry.endDate ?? 'Present'}
        </span>
      </div>
      <div className="flex items-baseline gap-1 text-xs text-muted-foreground mb-1">
        <span>{entry.company}</span>
        {entry.location && (
          <span className="before:content-['·'] before:mx-1">{entry.location}</span>
        )}
      </div>
      {entry.bullets.length > 0 && (
        <ul className="list-disc list-inside space-y-0.5">
          {entry.bullets.map((bullet, bi) => (
            <li
              key={bi}
              data-resume-path={`/experience/${index}/bullets/${bi}`}
              className="text-xs text-foreground/90 leading-relaxed"
            >
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationItem({ entry, index }: { entry: EducationEntry; index: number }) {
  return (
    <div data-resume-path={`/education/${index}`} className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-sm text-foreground">{entry.institution}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {entry.startDate} — {entry.endDate ?? 'Present'}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {entry.degree} in {entry.field}
        {entry.gpa && <span className="ml-2">GPA: {entry.gpa}</span>}
      </div>
    </div>
  );
}

function SkillGroupItem({ group, index }: { group: SkillGroup; index: number }) {
  return (
    <div data-resume-path={`/skills/${index}`} className="mb-1.5 last:mb-0 flex gap-2 text-xs">
      <span className="font-medium text-foreground shrink-0">{group.category}:</span>
      <span className="text-foreground/80">{group.items.join(', ')}</span>
    </div>
  );
}

function CertificationItem({ entry, index }: { entry: CertificationEntry; index: number }) {
  return (
    <div
      data-resume-path={`/certifications/${index}`}
      className="mb-1 last:mb-0 text-xs flex items-baseline gap-1"
    >
      {entry.url ? (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {entry.name}
        </a>
      ) : (
        <span className="font-medium text-foreground">{entry.name}</span>
      )}
      <span className="text-muted-foreground">— {entry.issuer}</span>
      {entry.date && <span className="text-muted-foreground">({entry.date})</span>}
    </div>
  );
}

function LanguageItem({ entry, index }: { entry: LanguageEntry; index: number }) {
  return (
    <span
      data-resume-path={`/languages/${index}`}
      className="inline-flex items-center gap-1 text-xs mr-3"
    >
      <span className="font-medium text-foreground">{entry.language}</span>
      <span className="text-muted-foreground capitalize">({entry.proficiency})</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main preview component
// ---------------------------------------------------------------------------

/**
 * Live CV preview rendered as plain HTML/Tailwind — no PDF libraries.
 *
 * Reads state directly from `useResumeEditorStore`.
 * Every section and notable element carries `data-resume-path` for future
 * AI annotation overlays.
 *
 * Wrapped in a `relative` container so a PDF export overlay can be
 * absolutely positioned on top without layout disruption.
 */
const FONT_FAMILY_CSS: Record<FontOption, string> = {
  roboto: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  ptSerif: '"PT Serif", Georgia, serif',
};

export function ResumePreview({
  template = 'atsClean',
  font = 'roboto',
}: {
  template?: PdfTemplate;
  font?: FontOption;
}) {
  const doc = useResumeEditorStore((s) => s.document);
  const { header, summary, experience, education, skills, certifications, languages } = doc;

  const hasContent = (arr: unknown[]) => arr.length > 0;
  const contactSep = template === 'atsModern' ? '·' : '|';
  const fontFamily = FONT_FAMILY_CSS[font];

  return (
    <div className="relative">
      {/* A4-proportioned card: 210mm × 297mm ≈ 1:1.414 */}
      <div
        className="bg-white text-foreground shadow-md rounded-sm mx-auto"
        style={{ width: '100%', maxWidth: '640px', minHeight: '904px', fontFamily }}
      >
        <div className="px-8 py-8">
          {/* ---- Header ---- */}
          <Section path="/header">
            <h1
              className="font-bold text-foreground leading-tight mb-1"
              style={{ fontSize: template === 'atsModern' ? '1.5rem' : '1.375rem' }}
            >
              {header.name || <span className="text-muted-foreground italic">Your Name</span>}
            </h1>
            <div className="flex flex-wrap items-center gap-y-0.5 text-xs text-muted-foreground">
              {[
                header.email && (
                  <a
                    key="email"
                    href={`mailto:${header.email}`}
                    data-resume-path="/header/email"
                    className="hover:text-primary"
                  >
                    {header.email}
                  </a>
                ),
                header.phone && (
                  <span key="phone" data-resume-path="/header/phone">
                    {header.phone}
                  </span>
                ),
                header.location && (
                  <span key="location" data-resume-path="/header/location">
                    {header.location}
                  </span>
                ),
                header.linkedin && (
                  <a
                    key="linkedin"
                    href={header.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-resume-path="/header/linkedin"
                    className="hover:text-primary"
                  >
                    LinkedIn
                  </a>
                ),
                header.website && (
                  <a
                    key="website"
                    href={header.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-resume-path="/header/website"
                    className="hover:text-primary"
                  >
                    Website
                  </a>
                ),
              ]
                .filter(Boolean)
                .flatMap((el, i, arr) =>
                  i < arr.length - 1
                    ? [
                        el,
                        <span key={`sep-${i}`} className="mx-1.5 select-none">
                          {contactSep}
                        </span>,
                      ]
                    : [el],
                )}
            </div>
          </Section>

          {/* ---- Summary ---- */}
          {summary && (
            <Section path="/summary">
              <SectionTitle template={template}>Summary</SectionTitle>
              <p className="text-xs text-foreground/90 leading-relaxed">{summary}</p>
            </Section>
          )}

          {/* ---- Experience ---- */}
          {hasContent(experience) && (
            <Section path="/experience">
              <SectionTitle template={template}>Experience</SectionTitle>
              {experience.map((entry, i) => (
                <ExperienceItem key={entry.id} entry={entry} index={i} />
              ))}
            </Section>
          )}

          {/* ---- Education ---- */}
          {hasContent(education) && (
            <Section path="/education">
              <SectionTitle template={template}>Education</SectionTitle>
              {education.map((entry, i) => (
                <EducationItem key={entry.id} entry={entry} index={i} />
              ))}
            </Section>
          )}

          {/* ---- Skills ---- */}
          {hasContent(skills) && (
            <Section path="/skills">
              <SectionTitle template={template}>Skills</SectionTitle>
              {skills.map((group, i) => (
                <SkillGroupItem key={group.id} group={group} index={i} />
              ))}
            </Section>
          )}

          {/* ---- Certifications ---- */}
          {hasContent(certifications) && (
            <Section path="/certifications">
              <SectionTitle template={template}>Certifications</SectionTitle>
              {certifications.map((entry, i) => (
                <CertificationItem key={entry.id} entry={entry} index={i} />
              ))}
            </Section>
          )}

          {/* ---- Languages ---- */}
          {hasContent(languages) && (
            <Section path="/languages">
              <SectionTitle template={template}>Languages</SectionTitle>
              <div className="flex flex-wrap">
                {languages.map((entry, i) => (
                  <LanguageItem key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </Section>
          )}

          {/* Empty state placeholder */}
          {!header.name &&
            !summary &&
            !hasContent(experience) &&
            !hasContent(education) &&
            !hasContent(skills) && (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm italic">
                Start filling in your details to see the preview
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
