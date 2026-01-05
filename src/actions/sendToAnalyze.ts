'use server';

import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { AnalysisSchemaType } from '@/features/schema/analysisSchema';
import { createServerClient } from '@/lib/supabase/server';

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

type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export type StatusResponse = {
  status: JobStatus;
};

export type ResultResponse = {
  status: JobStatus;
  data: AnalysisSchemaType | null;
  error?: unknown;
  finishedAt: string;
  createdAt: string;
};

export type BaseInfoResponse = {
  id: string;
  finishedAt: string;
  createdAt: string;
};

// TODO: send user jwt token to verify user identity directly in the queue service
const _defaultBaseUrl = process.env.NEXT_PUBLIC_QUEUE_API_URL ?? 'http://localhost:4000';
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

export const analyzeResume = async (params: AnalyzePayload): Promise<AnalyzeResponse> => {
  const { userId, userRole } = await getUserAuthData();

  const body = {
    payload: params,
    userId,
    role: userRole,
  };

  const resp = await apiCvAnalyser.post<AnalyzeResponse, AnalyzeRequest>(
    ApiRoutes.CV_ANALYSER.analyze,
    body,
    {
      headers: authHeader,
    },
  );

  return resp;
};

export const getResumeStatus = async (jobId: string): Promise<StatusResponse> => {
  const resp = await apiCvAnalyser.get<StatusResponse>(
    ApiRoutes.CV_ANALYSER.status(jobId),
    undefined,
    {
      headers: authHeader,
    },
  );
  return resp;
};

export const getResumeResult = async (jobId: string): Promise<ResultResponse> => {
  const resp = await apiCvAnalyser.get<ResultResponse>(
    ApiRoutes.CV_ANALYSER.result(jobId),
    undefined,
    {
      headers: authHeader,
    },
  );
  return resp;
};

export const getResentResumeBaseInfo = async (): Promise<BaseInfoResponse[]> => {
  const { userId } = await getUserAuthData();
  const resp = await apiCvAnalyser.get<BaseInfoResponse[]>(
    ApiRoutes.CV_ANALYSER.recent(userId),
    undefined,
    {
      headers: authHeader,
    },
  );
  return resp;
};
