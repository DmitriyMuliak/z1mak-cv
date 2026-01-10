'use server';

import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { ApiError } from '@/api/apiService';
import { AnalysisSchemaType } from '@/features/schema/analysisSchema';
import { createServerClient } from '@/lib/supabase/server';
import { extractResumeError, formatResumeErrorMessage } from '@/utils/resumeErrors';
import { getTranslations } from 'next-intl/server';

export type AnalyzeMode = {
  evaluationMode: 'general' | 'byJob';
  domain: 'it' | 'common';
  depth: 'standard' | 'deep';
};

export type AnalyzePayload = {
  cvDescription: string;
  jobDescription?: string;
  mode: AnalyzeMode;
  locale: string;
};

export type AnalyzeRequest = {
  userId: string;
  role: 'user' | 'admin';
  payload: AnalyzePayload;
};

export type AnalyzeResponse = {
  jobId: string;
};

export type ResumeErrorCode =
  | 'QUEUE_FULL' // /resume/analyze: черга переповнена для моделі
  | 'CONCURRENCY_LIMIT' // /resume/analyze: user concurrency з Lua
  | 'USER_RPD_LIMIT' // /resume/analyze: user RPD з Lua
  | 'MODEL_LIMIT' // /resume/analyze: усі моделі в chain по RPD
  | 'NOT_FOUND'; // /resume/:id/result, /resume/:id/status

export type ResumeErrorResponse = {
  error: ResumeErrorCode;
  message?: string; // використовується зараз лише для QUEUE_FULL
};

type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export type StatusResponse = {
  status: JobStatus;
  error?: ResumeErrorCode;
  message?: string;
};

export type ResultResponse = {
  status: JobStatus;
  data: AnalysisSchemaType | null;
  error?: ResumeErrorCode;
  message?: string;
  finishedAt: string;
  createdAt: string;
};

export type BaseInfoResponse = {
  id: string;
  finishedAt: string | null;
  createdAt: string;
};

const internalApiKey = process.env.INTERNAL_API_KEY ?? 'not set';
const authHeader = {
  'x-internal-api-key': internalApiKey,
};

const getUserAuthData = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    console.error('Error getting user claims:', error);
    throw new Error('Unauthorized');
  }

  const userId = data.claims.sub;
  const userRole = data.claims.app_metadata?.role as 'user' | 'admin';

  return { userId, userRole };
};

const resolveResumeErrorMessage = async (locale: string, error: unknown) => {
  const resumeError = extractResumeError(error);

  if (!resumeError) {
    return 'Unexpected error, please try again later.';
  }

  try {
    const t = await getTranslations({ locale });
    return formatResumeErrorMessage(
      t as unknown as (key: string, values?: Record<string, unknown>) => string,
      resumeError.code,
      resumeError.message,
    );
  } catch (_e) {
    return resumeError.message || 'Unexpected error, please try again later.';
  }
};

export const analyzeResume = async (params: AnalyzePayload): Promise<AnalyzeResponse> => {
  // TODO: send user jwt token to verify user identity directly in the queue service
  const { userId, userRole } = await getUserAuthData();

  const body = {
    payload: params,
    userId,
    role: userRole,
  };

  try {
    return await apiCvAnalyser.post<AnalyzeResponse, AnalyzeRequest>(
      ApiRoutes.CV_ANALYSER.analyze,
      body,
      {
        headers: authHeader,
      },
    );
  } catch (error) {
    const localizedMessage = await resolveResumeErrorMessage(params.locale, error);

    if (error instanceof ApiError) {
      throw new ApiError(localizedMessage, {
        status: error.status,
        body: error.body,
        cause: error,
      });
    }

    throw new Error(localizedMessage);
  }
};

export const getResumeStatus = async (jobId: string): Promise<StatusResponse> => {
  return apiCvAnalyser.get<StatusResponse>(ApiRoutes.CV_ANALYSER.status(jobId), undefined, {
    headers: authHeader,
  });
};

export const getResumeResult = async (jobId: string): Promise<ResultResponse> => {
  return apiCvAnalyser.get<ResultResponse>(ApiRoutes.CV_ANALYSER.result(jobId), undefined, {
    headers: authHeader,
  });
};

export const getResentResumeBaseInfo = async (
  pagination: { offset: number; limit: number } = { offset: 0, limit: 20 },
): Promise<BaseInfoResponse[]> => {
  // Call our API service - uncomment after migration to pass jwt token
  // const { userId } = await getUserAuthData();
  // const resp = await apiCvAnalyser.get<BaseInfoResponse[]>(
  //   ApiRoutes.CV_ANALYSER.recent(userId),
  //   undefined,
  //   {
  //     headers: authHeader,
  //   },
  // );

  const supabase = await createServerClient();
  const claims = await supabase.auth.getClaims();
  const userId = claims?.data?.claims.sub;

  if (!userId) {
    throw new Error('[userId] does not exist in auth claims');
  }

  const { data, error } = await supabase
    .from('cv_analyzes')
    .select('id, finished_at, created_at, status, sda')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
  }));
};
