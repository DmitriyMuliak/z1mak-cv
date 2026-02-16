import React from 'react';
import { toast } from 'sonner';
import { ResultReturn } from '@/actions/utils/serverUtils';
import { analyzeResume, ResumeErrorCode } from '@/actions/resume/resumeActions';
import { parseFile } from '../parsers/parseFile';
import { AddDescriptionBy, Mode } from '../store/useCvStore';
import { SendToAnalyzeFEType } from '../schema/form/toAnalyzeSchemaFE';
import { TranslationFn, NamespacedRelativeMessageKeys, MessagesBase } from '@/types/translations';
import { DEFAULT_RESUME_ERROR_KEY, RESUME_ERROR_KEY_MAP } from '../consts/resumeErrors';

interface SendToAnalyzeActionState {
  translateErrorFn: TranslationFn<
    NamespacedRelativeMessageKeys<MessagesBase, 'common.resumeErrors'>
  >;
  locale: string;
  mode: Mode;
  addCvBy: AddDescriptionBy;
  addJobBy: AddDescriptionBy;
}

type AnalyzeSuccessData = {
  jobId: string;
};

export const sendToAnalyzeAction = async (
  data: SendToAnalyzeFEType,
  stateOptional?: SendToAnalyzeActionState,
): Promise<ResultReturn<AnalyzeSuccessData>> => {
  const state = stateOptional as SendToAnalyzeActionState;
  const shouldProcessJob = state.mode.evaluationMode === 'byJob';

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
    errors[cvFieldName] = [state.translateErrorFn(cvResult.error || 'cvProcessing')];
  }

  if (shouldProcessJob && jobResult.isError) {
    errors[jobFieldName] = [state.translateErrorFn(jobResult.error || 'jobProcessing')];
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
      errors: { [cvFieldName]: [state.translateErrorFn('cvFileEmpty')] },
    };
  if (shouldProcessJob && jobResult.isEmpty)
    return {
      success: false,
      errors: { [jobFieldName]: [state.translateErrorFn('jobFileEmpty')] },
    };

  if (shouldProcessJob && jobResult.data === cvResult.data) {
    toast.error(createToastContent(state.translateErrorFn('jobDescAndCvAreEqual')));
    return {
      success: false,
      metaError: 'Job description and CV are equal',
    };
  }

  const response = await analyzeResume({
    mode: state.mode,
    locale: state.locale,
    cvDescription: cvResult.data,
    ...(jobResult.data ? { jobDescription: jobResult.data } : {}),
  });

  if (response.success) {
    return response;
  }

  toast.error(
    createToastContent(
      state.translateErrorFn(
        RESUME_ERROR_KEY_MAP[response.error.code as ResumeErrorCode] || DEFAULT_RESUME_ERROR_KEY,
      ),
    ),
  );

  return {
    success: false,
  };
};

type ExtractionResult = {
  data: string;
  isEmpty: boolean;
  isError: boolean;
  error?: NamespacedRelativeMessageKeys<MessagesBase, 'common.resumeErrors'>;
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
        isEmpty: false,
        isError: true,
        error: 'fileParsing',
      };
    }
  }

  return { data: '', isEmpty: true, isError: false };
};

const createToastContent = (message: string) => {
  return React.createElement('span', { 'data-testid': 'error-toast' }, message);
};
