'use client';

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { useResumeEditorStore } from '../store/resumeEditorStore';
import { useTemplateSettingsStore } from '../store/templateSettingsStore';
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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-900 pb-1 mb-2 pl-2 border-l-[3px] border-blue-600">
        {children}
      </h2>
    );
  }
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function ExperienceItem({
  entry,
  index,
  t,
}: {
  entry: ExperienceEntry;
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div data-resume-path={`/experience/${index}`} className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-sm text-neutral-900">{entry.title}</span>
        <span className="text-xs text-neutral-500 shrink-0">
          {entry.startDate} — {entry.endDate ?? t('preview.present')}
        </span>
      </div>
      <div className="flex items-baseline gap-1 text-xs text-neutral-500 mb-1">
        <span>{entry.company}</span>
        {entry.location && (
          <span className="before:content-['·'] before:mx-1">{entry.location}</span>
        )}
      </div>
      {entry.description && (
        <div
          className="text-xs text-neutral-900/90 leading-relaxed rich-preview [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-0.5 [&_strong]:font-semibold [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: entry.description }}
        />
      )}
    </div>
  );
}

function EducationItem({
  entry,
  index,
  t,
}: {
  entry: EducationEntry;
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div data-resume-path={`/education/${index}`} className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-sm text-neutral-900">{entry.institution}</span>
        <span className="text-xs text-neutral-500 shrink-0">
          {entry.startDate} — {entry.endDate ?? t('preview.present')}
        </span>
      </div>
      <div className="text-xs text-neutral-500">
        {entry.degree && (
          <>
            {entry.degree}
            {entry.field && ` ${t('preview.educationIn')} ${entry.field}`}
          </>
        )}
        {!entry.degree && entry.field && entry.field}
        {entry.gpa && <span className="ml-2">GPA: {entry.gpa}</span>}
      </div>
    </div>
  );
}

function SkillGroupItem({ group, index }: { group: SkillGroup; index: number }) {
  return (
    <div data-resume-path={`/skills/${index}`} className="mb-1.5 last:mb-0 flex gap-2 text-xs">
      <span className="font-medium text-neutral-900 shrink-0">{group.category}:</span>
      <span className="text-neutral-900/80">{group.items.join(', ')}</span>
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
        <span className="font-medium text-neutral-900">{entry.name}</span>
      )}
      <span className="text-neutral-500">— {entry.issuer}</span>
      {entry.date && <span className="text-neutral-500">({entry.date})</span>}
    </div>
  );
}

function LanguageItem({
  entry,
  index,
  t,
}: {
  entry: LanguageEntry;
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <span
      data-resume-path={`/languages/${index}`}
      className="inline-flex items-center gap-1 text-xs mr-3"
    >
      <span className="font-medium text-neutral-900">{entry.language}</span>
      <span className="text-neutral-500">
        ({t(`languages.proficiencyLevels.${entry.proficiency}`)})
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main preview component
// ---------------------------------------------------------------------------

// A4 at 96 dpi: 210mm × 297mm
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

function PageContainer({
  children,
  fontFamily,
  overflowWarning,
}: {
  children: React.ReactNode;
  fontFamily: string;
  overflowWarning: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setIsOverflowing(entry.contentRect.height > A4_HEIGHT);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div
        ref={ref}
        className="bg-white text-neutral-900 shadow-xl"
        style={{ width: A4_WIDTH, minHeight: A4_HEIGHT, fontFamily }}
      >
        {children}
      </div>
      {isOverflowing && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-x border-b border-amber-200 rounded-b-md text-xs text-amber-800 shadow-xl">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
          <span>{overflowWarning}</span>
        </div>
      )}
    </div>
  );
}

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
  const t = useTranslations('cvEditor');
  const doc = useResumeEditorStore((s) => s.document);
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);
  const sectionOrder = useTemplateSettingsStore((s) => s.sectionOrder);
  const sectionSettings = useTemplateSettingsStore((s) => s.sectionSettings);
  const { header, summary, experience, education, skills, certifications, languages } = doc;
  const hasContent = (arr: unknown[]) => arr.length > 0;
  const contactSep = template === 'atsModern' ? '·' : '|';
  const fontFamily = FONT_FAMILY_CSS[font];

  const isEmptyDoc =
    !header.name &&
    !summary &&
    !hasContent(experience) &&
    !hasContent(education) &&
    !hasContent(skills);

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => {
        const pageExp = experience.filter((e) => (e.page ?? 0) === pageIndex);
        const pageEdu = education.filter((e) => (e.page ?? 0) === pageIndex);
        const pageSkills = skills.filter((g) => (g.page ?? 0) === pageIndex);
        const pageCerts = certifications.filter((e) => (e.page ?? 0) === pageIndex);
        const pageLangs = languages.filter((e) => (e.page ?? 0) === pageIndex);
        return (
          <PageContainer
            key={pageIndex}
            fontFamily={fontFamily}
            overflowWarning={t('preview.overflowWarning')}
          >
            <div className="px-8 py-8">
              {/* ---- Header (first page only) ---- */}
              {pageIndex === 0 && (
                <Section path="/header">
                  <h1
                    className="font-bold text-neutral-900 leading-tight mb-2"
                    style={{ fontSize: template === 'atsModern' ? '1.5rem' : '1.375rem' }}
                  >
                    {header.name || (
                      <span className="text-neutral-500 italic">{t('preview.yourName')}</span>
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-0.5 text-xs text-neutral-500">
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
                          {header.linkedinLabel || header.linkedin}
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
                          {header.websiteLabel || header.website}
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
              )}

              {/* ---- Sections in user-defined order ---- */}
              {(sectionOrder[pageIndex] ?? []).map((key) => {
                const hideTitle = sectionSettings[pageIndex]?.[key]?.hideTitle ?? false;
                if (key === 'summary') {
                  return pageIndex === 0 && summary ? (
                    <Section key="summary" path="/summary">
                      {!hideTitle && (
                        <SectionTitle template={template}>{t('preview.summary')}</SectionTitle>
                      )}
                      <div
                        className="text-xs text-neutral-900/90 leading-relaxed rich-preview [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-0.5 [&_strong]:font-semibold [&_em]:italic"
                        dangerouslySetInnerHTML={{ __html: summary }}
                      />
                    </Section>
                  ) : null;
                }
                if (key === 'experience' && hasContent(pageExp)) {
                  return (
                    <Section key="experience" path="/experience">
                      {!hideTitle && (
                        <SectionTitle template={template}>{t('preview.experience')}</SectionTitle>
                      )}
                      {pageExp.map((entry, i) => (
                        <ExperienceItem key={entry.id} entry={entry} index={i} t={t} />
                      ))}
                    </Section>
                  );
                }
                if (key === 'education' && hasContent(pageEdu)) {
                  return (
                    <Section key="education" path="/education">
                      {!hideTitle && (
                        <SectionTitle template={template}>{t('preview.education')}</SectionTitle>
                      )}
                      {pageEdu.map((entry, i) => (
                        <EducationItem key={entry.id} entry={entry} index={i} t={t} />
                      ))}
                    </Section>
                  );
                }
                if (key === 'skills' && hasContent(pageSkills)) {
                  return (
                    <Section key="skills" path="/skills">
                      {!hideTitle && (
                        <SectionTitle template={template}>{t('preview.skills')}</SectionTitle>
                      )}
                      {pageSkills.map((group, i) => (
                        <SkillGroupItem key={group.id} group={group} index={i} />
                      ))}
                    </Section>
                  );
                }
                if (key === 'certifications' && hasContent(pageCerts)) {
                  return (
                    <Section key="certifications" path="/certifications">
                      {!hideTitle && (
                        <SectionTitle template={template}>
                          {t('preview.certifications')}
                        </SectionTitle>
                      )}
                      {pageCerts.map((entry, i) => (
                        <CertificationItem key={entry.id} entry={entry} index={i} />
                      ))}
                    </Section>
                  );
                }
                if (key === 'languages' && hasContent(pageLangs)) {
                  return (
                    <Section key="languages" path="/languages">
                      {!hideTitle && (
                        <SectionTitle template={template}>{t('preview.languages')}</SectionTitle>
                      )}
                      <div className="flex flex-wrap">
                        {pageLangs.map((entry, i) => (
                          <LanguageItem key={entry.id} entry={entry} index={i} t={t} />
                        ))}
                      </div>
                    </Section>
                  );
                }
                return null;
              })}

              {/* Empty state placeholder (first page only) */}
              {pageIndex === 0 && isEmptyDoc && (
                <div className="flex items-center justify-center h-64 text-neutral-500 text-sm italic">
                  {t('preview.emptyPreview')}
                </div>
              )}
            </div>
          </PageContainer>
        );
      })}
    </>
  );
}
