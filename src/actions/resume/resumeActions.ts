'use server';

import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { AnalysisSchemaType } from '@/features/schema/analysisSchema';
import { createServerClient } from '@/lib/supabase/server';
import { ServerActionResult } from '@/types/server-actions';
import { handleServerError } from '../handleServerError';

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
  | 'USER_RPD_LIMIT:lite' // /resume/analyze: user RPD з Lua
  | 'USER_RPD_LIMIT:hard' // /resume/analyze: user RPD з Lua
  | 'MODEL_LIMIT' // /resume/analyze: усі моделі в chain по RPD
  | 'NOT_FOUND' // /resume/:id/result, /resume/:id/status
  | 'PROVIDER_ERROR'; // /resume/status

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
  status: JobStatus;
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

export const analyzeResume = async (
  params: AnalyzePayload,
): Promise<ServerActionResult<AnalyzeResponse>> => {
  // TODO: send user jwt token to verify user identity directly in the queue service
  const { userId, userRole } = await getUserAuthData();

  const body = {
    payload: params,
    userId,
    role: userRole,
  };

  try {
    const data = await apiCvAnalyser.post<AnalyzeResponse, AnalyzeRequest>(
      ApiRoutes.CV_ANALYSER.analyze,
      body,
      {
        headers: authHeader,
      },
    );

    return { success: true, data };
  } catch (error) {
    return handleServerError(error);
  }
};

export const getResumeStatus = async (
  jobId: string,
): Promise<ServerActionResult<StatusResponse>> => {
  try {
    const data = await apiCvAnalyser.get<StatusResponse>(
      ApiRoutes.CV_ANALYSER.status(jobId),
      undefined,
      {
        headers: authHeader,
      },
    );
    return { success: true, data };
  } catch (error) {
    return handleServerError(error);
  }
};

export const getResumeResult = async (
  jobId: string,
): Promise<ServerActionResult<ResultResponse>> => {
  try {
    const data = await apiCvAnalyser.get<ResultResponse>(
      ApiRoutes.CV_ANALYSER.result(jobId),
      undefined,
      {
        headers: authHeader,
      },
    );
    return { success: true, data };
  } catch (error) {
    return handleServerError(error);
  }
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
