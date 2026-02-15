'use server';

import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { AnalysisSchemaType } from '@/features/cv-checker/schema/analysisSchema';
import { createServerClient } from '@/lib/supabase/server';
import { createAsyncServerAction } from '../utils/createAsyncAction';

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
  payload: AnalyzePayload;
};

export type AnalyzeResponse = {
  jobId: string;
};

export type ResumeErrorCode =
  | 'QUEUE_FULL' // /resume/analyze: the queue is full for the model
  | 'CONCURRENCY_LIMIT' // /resume/analyze: user concurrency з Lua
  | 'USER_RPD_LIMIT:lite' // /resume/analyze: user RPD з Lua
  | 'USER_RPD_LIMIT:hard' // /resume/analyze: user RPD з Lua
  | 'MODEL_LIMIT' // /resume/analyze: all models in chain down by RPD
  | 'NOT_FOUND' // /resume/:id/result, /resume/:id/status
  | 'PROVIDER_ERROR'; // /resume/status

export type ResumeErrorResponse = {
  error: ResumeErrorCode;
  message?: string; // used only for QUEUE_FULL
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
  status: JobStatus;
};

export const getUserAuthData = async () => {
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

export const analyzeResume = createAsyncServerAction(async (payload: AnalyzePayload) => {
  const body = {
    payload,
  };

  return await apiCvAnalyser.post<AnalyzeResponse, AnalyzeRequest>(
    ApiRoutes.CV_ANALYSER.analyze,
    body,
  );
});

export const getResumeStatus = createAsyncServerAction(async (jobId: string) => {
  return await apiCvAnalyser.get<StatusResponse>(ApiRoutes.CV_ANALYSER.status(jobId), undefined, {
    cache: 'no-store',
  });
});

export const getResumeResult = createAsyncServerAction(async (jobId: string) => {
  return apiCvAnalyser.get<ResultResponse>(ApiRoutes.CV_ANALYSER.result(jobId), undefined, {
    cache: 'no-store',
  });
});

export const getResentResumeBaseInfo = async (
  pagination: { offset: number; limit: number } = { offset: 0, limit: 20 },
): Promise<BaseInfoResponse[]> => {
  // Call our API service - uncomment after migration to pass jwt token
  // const { userId } = await getUserAuthData();
  // const resp = await apiCvAnalyser.get<BaseInfoResponse[]>(
  //   ApiRoutes.CV_ANALYSER.recent(userId),
  // );

  const supabase = await createServerClient();
  const claims = await supabase.auth.getClaims();
  const userId = claims?.data?.claims.sub;

  if (!userId) {
    throw new Error('[userId] does not exist in auth claims');
  }

  const { data, error } = await supabase
    .from('cv_analyzes')
    .select('id, finished_at, created_at, status')
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
    status: row.status as JobStatus,
  }));
};
