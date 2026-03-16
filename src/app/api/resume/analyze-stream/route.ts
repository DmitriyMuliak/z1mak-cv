import { NextRequest, NextResponse } from 'next/server';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { AnalyzePayload } from '@/actions/resume/resumeActions';
import { apiCvAnalyser } from '@/api/server';
import { isAbortError } from '@/api/apiService/utils';

export async function POST(request: NextRequest) {
  try {
    const payload: AnalyzePayload = await request.json();

    const response = await apiCvAnalyser.post<Response>(
      ApiRoutes.CV_ANALYSER.analyzeStream,
      payload,
      { responseAs: 'response', signal: request.signal },
    );

    if (!response.ok) {
      // Clone the response to read body without consuming the original for the final return
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Forward the streaming response from the backend to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      return new Response(null, { status: 204 });
    }
    console.error('API Stream Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
