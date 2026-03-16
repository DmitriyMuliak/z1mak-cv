import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/api/apiService';
import { isAbortError } from '@/api/apiService/utils';
import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

type ResultStreamRequestBody = {
  lastEventId?: string;
};

const parseRequestBody = async (request: NextRequest): Promise<ResultStreamRequestBody> => {
  const textBody = await request.text();

  if (!textBody.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(textBody) as ResultStreamRequestBody;
    return {
      ...(typeof parsed.lastEventId === 'string' && parsed.lastEventId
        ? { lastEventId: parsed.lastEventId }
        : {}),
    };
  } catch {
    return {};
  }
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { jobId } = await params;
    const payload = await parseRequestBody(request);

    const response = await apiCvAnalyser.post<Response, ResultStreamRequestBody>(
      ApiRoutes.CV_ANALYSER.resultStream(jobId),
      payload,
      {
        responseAs: 'response',
        signal: request.signal,
        headers: {
          Accept: 'text/event-stream',
        },
      },
    );

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      return new Response(null, { status: 204 });
    }

    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }

    console.error('API Result Stream Route Error:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
