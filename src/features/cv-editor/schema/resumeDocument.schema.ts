import * as v from 'valibot';

// ---------------------------------------------------------------------------
// Sub-schemas (non-exported — internal building blocks)
// ---------------------------------------------------------------------------

const ResumeHeaderSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  linkedin: v.optional(v.pipe(v.string(), v.url())),
  website: v.optional(v.pipe(v.string(), v.url())),
});

const ExperienceEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  company: v.string(),
  title: v.string(),
  startDate: v.string(),
  /** `undefined` means the position is current / "present". */
  endDate: v.optional(v.string()),
  location: v.optional(v.string()),
  bullets: v.array(v.string()),
});

const EducationEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  institution: v.string(),
  degree: v.string(),
  field: v.string(),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  gpa: v.optional(v.string()),
});

const SkillGroupSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  category: v.string(),
  items: v.array(v.string()),
});

const CertificationEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.string(),
  issuer: v.string(),
  date: v.optional(v.string()),
  url: v.optional(v.pipe(v.string(), v.url())),
});

const LanguageProficiency = v.picklist(['native', 'fluent', 'advanced', 'intermediate', 'basic']);

const LanguageEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  language: v.string(),
  proficiency: LanguageProficiency,
});

// ---------------------------------------------------------------------------
// Root schema — exported
// ---------------------------------------------------------------------------

/**
 * Valibot schema for the complete CV document used by the inline editor.
 *
 * All array sections are optional at the root level so a freshly initialised
 * document is still valid. Required sections are `header` only.
 */
export const ResumeDocumentSchema = v.object({
  header: ResumeHeaderSchema,
  summary: v.optional(v.string()),
  experience: v.array(ExperienceEntrySchema),
  education: v.array(EducationEntrySchema),
  skills: v.array(SkillGroupSchema),
  certifications: v.array(CertificationEntrySchema),
  languages: v.array(LanguageEntrySchema),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

/** Inferred type for the contact header section of a CV. */
export type ResumeHeader = v.InferOutput<typeof ResumeHeaderSchema>;

/** Inferred type for a single work-experience entry. */
export type ExperienceEntry = v.InferOutput<typeof ExperienceEntrySchema>;

/** Inferred type for a single education entry. */
export type EducationEntry = v.InferOutput<typeof EducationEntrySchema>;

/** Inferred type for a grouped skill category. */
export type SkillGroup = v.InferOutput<typeof SkillGroupSchema>;

/** Inferred type for a single certification entry. */
export type CertificationEntry = v.InferOutput<typeof CertificationEntrySchema>;

/** Union of valid language proficiency levels. */
export type LanguageProficiency = v.InferOutput<typeof LanguageProficiency>;

/** Inferred type for a single language entry. */
export type LanguageEntry = v.InferOutput<typeof LanguageEntrySchema>;

/**
 * The complete CV document type inferred from {@link ResumeDocumentSchema}.
 *
 * This is the canonical data shape shared between the editor store
 * (nextjs-pro) and the PDF export templates (frontend-developer).
 */
export type ResumeDocument = v.InferOutput<typeof ResumeDocumentSchema>;

// ---------------------------------------------------------------------------
// Default / empty document — for store initialisation
// ---------------------------------------------------------------------------

/**
 * An empty `ResumeDocument` used to seed a fresh editor session.
 *
 * All array sections start empty; required string fields use placeholder
 * values so the document satisfies the schema without user input.
 *
 * @example
 * // In the editor store:
 * const useResumeEditorStore = create<ResumeEditorState & ResumeEditorActions>(() => ({
 *   document: defaultResumeDocument,
 *   isDirty: false,
 *   // ...actions
 * }));
 */
export const defaultResumeDocument: ResumeDocument = {
  header: {
    name: '',
    email: '',
    phone: undefined,
    location: undefined,
    linkedin: undefined,
    website: undefined,
  },
  summary: undefined,
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};
