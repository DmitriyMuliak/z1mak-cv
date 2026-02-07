import { AnalysisSchemaType } from '../schema/analysisSchema';

export class SchemaService {
  private analysis: AnalysisSchemaType;

  constructor(analysis: AnalysisSchemaType) {
    this.analysis = analysis;
  }

  private get includeSkills() {
    return (
      this.analysis.detailedSkillAnalysis?.skills &&
      this.analysis.detailedSkillAnalysis.skills.length > 0
    );
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

  public getUiSections(): UiSectionKey[] {
    const activeSections = new Set<UiSectionKey>();

    if (this.analysis && !this.analysis.metadata.isValidCv) {
      activeSections.add('header');
      activeSections.add('redFlags');
      return UI_SECTION_ORDER.filter((section) => activeSections.has(section));
    }

    activeSections.add('header');
    activeSections.add('redFlags');

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
