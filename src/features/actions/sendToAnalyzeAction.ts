import { parseFile } from '../parsers/parseFile';
import { AddDescriptionBy, Mode } from '../store/useCvStore';
import { SendToAnalyzeFEType } from '../schema/form/toAnalyzeSchemaFE';
import { ResultReturn } from '@/actions/utils';

interface SendToAnalyzeActionState {
  evaluationMode: Mode['evaluationMode'];
  addCvBy: AddDescriptionBy;
  addJobBy: AddDescriptionBy;
}

type AnalyzeSuccessData = {
  cvText: string;
  jobText: string;
};

export const sendToAnalyzeAction = async (
  data: SendToAnalyzeFEType,
  stateOptional?: SendToAnalyzeActionState,
): Promise<ResultReturn<AnalyzeSuccessData>> => {
  const state = stateOptional as SendToAnalyzeActionState;
  const shouldProcessJob = state.evaluationMode === 'byJob';

  const [cvResult, jobResult] = await Promise.all([
    extractContent(state.addCvBy, data.cvText, data.cvFile),
    shouldProcessJob
      ? extractContent(state.addJobBy, data.jobText, data.jobFile)
      : Promise.resolve({ data: '', isEmpty: true, isError: false } as ExtractionResult),
  ]);

  // Parsing/Business Errors
  const errors: Record<string, string[]> = {};
  const cvFieldName = state.addCvBy === 'text' ? 'cvText' : 'cvFile';
  const jobFieldName = state.addJobBy === 'text' ? 'jobText' : 'jobFile';

  if (cvResult.isError) {
    errors[cvFieldName] = [cvResult.error || 'Error processing CV'];
  }

  if (shouldProcessJob && jobResult.isError) {
    errors[jobFieldName] = [jobResult.error || 'Error processing Job Description'];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Empty checks (Business logic: parsing resulted in empty string)
  // This is no longer "required validation", this is "garbage in -> garbage out protection"
  // Can add a global error "CV is empty"
  if (cvResult.isEmpty)
    return {
      success: false,
      errors: { [cvFieldName]: ['Seems like your CV file is empty'] },
    };
  if (shouldProcessJob && jobResult.isEmpty)
    return {
      success: false,
      errors: { [jobFieldName]: ['Seems like your Job file is empty'] },
    };

  // call gemini

  return {
    success: true,
    data: {
      cvText: cvResult.data,
      jobText: jobResult.data,
    },
  };
};

type ExtractionResult = {
  data: string;
  isEmpty: boolean;
  isError: boolean;
  error?: string;
};

const extractContent = async (
  method: AddDescriptionBy,
  textValue?: string,
  files?: { file: File }[],
): Promise<ExtractionResult> => {
  if (method === 'text') {
    const cleanText = textValue?.trim() || '';
    return {
      data: cleanText,
      isEmpty: !cleanText,
      isError: false,
    };
  }

  if (method === 'file') {
    const fileObj = files?.[0];

    if (!fileObj?.file) {
      return { data: '', isEmpty: true, isError: false };
    }

    try {
      const data = await parseFile(fileObj.file);
      const cleanData = data?.trim() || '';
      return {
        data: cleanData,
        isEmpty: !cleanData,
        isError: false,
      };
    } catch (error) {
      console.error('File parsing failed', error);
      return {
        data: '',
        isEmpty: true,
        isError: true,
        error: 'File parsing failed',
      };
    }
  }

  return { data: '', isEmpty: true, isError: false };
};
