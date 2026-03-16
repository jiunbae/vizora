import { NextRequest } from 'next/server';
import { classifyDiagram } from '@/lib/ai/classifier';
import { generateDiagramCode } from '@/lib/ai/generator';
import { validateMermaidCode } from '@/lib/ai/validator';
import { DiagramType, StreamEvent, DIAGRAM_TYPE_TO_ENGINE, ClassificationResult } from '@/types/diagram';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, diagramType: forcedType } = await req.json();

  if (!prompt || typeof prompt !== 'string') {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  // Use TransformStream to ensure chunks flush immediately
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const send = async (event: StreamEvent) => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
    );
  };

  // Start async work AFTER returning the response
  (async () => {
    try {
      // Phase 1: Classification
      await send({ phase: 'classifying' });

      let classification: ClassificationResult;
      if (forcedType) {
        classification = {
          type: forcedType as DiagramType,
          confidence: 1.0,
          needsClarification: false,
          clarificationQuestions: [],
          reasoning: 'User selected diagram type directly',
        };
      } else {
        classification = await classifyDiagram(prompt);
      }

      await send({ phase: 'classifying', classification });

      const engine = DIAGRAM_TYPE_TO_ENGINE[classification.type];

      // Phase 2: Generation (streaming)
      await send({ phase: 'generating' });

      let finalCode = '';

      for await (const partialCode of generateDiagramCode(prompt, classification.type)) {
        finalCode = partialCode;
        await send({ phase: 'generating', data: partialCode });
      }

      // Phase 3: Validation (only for mermaid)
      if (engine === 'mermaid') {
        await send({ phase: 'validating' });
        const validation = await validateMermaidCode(finalCode);

        if (!validation.valid) {
          finalCode = validation.code || finalCode;
        }
      }

      // Phase 4: Complete
      await send({ phase: 'complete', code: finalCode, classification, engine });
    } catch (error) {
      await send({
        phase: 'error',
        error: error instanceof Error ? error.message : 'Generation failed',
      });
    } finally {
      await writer.close();
    }
  })();

  // Return response immediately so SSE chunks flow incrementally
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
