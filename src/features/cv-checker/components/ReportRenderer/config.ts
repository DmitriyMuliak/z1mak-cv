import { Header } from './components/Header';
import { Skills } from './components/Skills';
import { Experience } from './components/Experience';
import { RedFlags } from './components/RedFlags';
import { Improvements } from './components/Improvements';
import { InterviewQuestions } from './components/InterviewQuestions';
import { UiSectionKey } from '../../services/SchemaService';
import { AnalysisSchemaType } from '../../schema/analysisSchema';

export const SECTION_COMPONENTS: Record<UiSectionKey, React.FC<{ data: AnalysisSchemaType }>> = {
  header: Header,
  skills: Skills,
  experience: Experience,
  redFlags: RedFlags,
  improvements: Improvements,
  questions: InterviewQuestions,
};

export type LoadingStatus = 'loading' | 'queued' | 'in_progress';
export const LOADING_STATUSES = new Set<string>(['loading', 'queued', 'in_progress']);

export const isLoadingStatus = (status: string): status is LoadingStatus => {
  return LOADING_STATUSES.has(status);
};
