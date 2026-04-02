import { NextRequest } from 'next/server';
import report from '@/../tests/data/report.json';

const SECTION_DELAY_MS = 1500;

const sseEvent = (id: string, event: string, data: unknown): string =>
  `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Each entry = one SSE patch event. Mirrors the real backend's section-by-section delivery.
const PATCH_SEQUENCE: Array<Record<string, unknown>> = [
  { analysisTimestamp: report.analysisTimestamp },
  { overallAnalysis: report.overallAnalysis },
  { quantitativeMetrics: report.quantitativeMetrics },
  {
    redFlagsAndConcerns: report.redFlagsAndConcerns,
    metadata: { isValidCv: true, isValidJobDescription: true, isJobDescriptionPresent: true },
  },
  { actionableImprovementPlan: report.actionableImprovementPlan },
  { detailedSkillAnalysis: report.detailedSkillAnalysis },
  { suggestedInterviewQuestions: report.suggestedInterviewQuestions },
  { experienceRelevanceAnalysis: report.experienceRelevanceAnalysis },
  { careerJourney: report.careerJourney },
  { atsKeywordMatrix: report.atsKeywordMatrix },
];

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const delayMs = Number(url.searchParams.get('delay') ?? SECTION_DELAY_MS);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => controller.enqueue(encoder.encode(chunk));

      // 1. Initial snapshot — job is in_progress, no data yet
      enqueue(sseEvent('0', 'snapshot', { content: null, status: 'in_progress' }));

      // 2. Stream each section as a patch
      for (let i = 0; i < PATCH_SEQUENCE.length; i++) {
        await delay(delayMs);

        if (request.signal.aborted) break;

        const ops = Object.entries(PATCH_SEQUENCE[i]).map(([key, value]) => ({
          op: 'add',
          path: `/${key}`,
          value,
        }));

        enqueue(sseEvent(`mock-${i}`, 'patch', { ops }));
      }

      // 3. Done
      await delay(delayMs);
      enqueue(
        sseEvent('0', 'done', {
          status: 'completed',
          usedModel: 'mock',
          finishedAt: new Date().toISOString(),
        }),
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
