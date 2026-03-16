import { AnalysisSchemaType } from '../schema/analysisSchema';

export class SchemaService {
  private analysis: Partial<AnalysisSchemaType>;

  constructor(analysis: Partial<AnalysisSchemaType> | null | undefined) {
    this.analysis = analysis ?? {};
  }

  private get includeSkills() {
    const skills = this.analysis.detailedSkillAnalysis?.skills;
    return Array.isArray(skills) && skills.length > 0;
  }

  private get includeExperience() {
    return !!this.analysis.experienceRelevanceAnalysis;
  }

  private get includeQuestions() {
    return !!this.analysis.suggestedInterviewQuestions;
  }

  private get includeImprovements() {
    return !!this.analysis.actionableImprovementPlan;
  }

  private get includeHeader() {
    return !!(
      this.analysis.overallAnalysis ||
      this.analysis.quantitativeMetrics ||
      this.analysis.metadata
    );
  }

  private get includeRedFlags() {
    const flags = this.analysis.redFlagsAndConcerns?.flags;
    return Array.isArray(flags) && flags.length > 0;
  }

  public getUiSections(): UiSectionKey[] {
    const activeSections = new Set<UiSectionKey>();

    if (this.analysis.metadata?.isValidCv === false) {
      if (this.includeHeader) activeSections.add('header');
      if (this.includeRedFlags) activeSections.add('redFlags');
      return UI_SECTION_ORDER.filter((section) => activeSections.has(section));
    }

    if (this.includeHeader) activeSections.add('header');
    if (this.includeRedFlags) activeSections.add('redFlags');

    if (this.includeSkills) activeSections.add('skills');
    if (this.includeExperience) activeSections.add('experience');
    if (this.includeImprovements) activeSections.add('improvements');
    if (this.includeQuestions) activeSections.add('questions');

    return UI_SECTION_ORDER.filter((section) => activeSections.has(section));
  }
}

export type UiSectionKey =
  | 'header'
  | 'skills'
  | 'experience'
  | 'redFlags'
  | 'improvements'
  | 'questions';

const UI_SECTION_ORDER: UiSectionKey[] = [
  'header',
  'experience',
  'skills',
  'redFlags',
  'improvements',
  'questions',
];
