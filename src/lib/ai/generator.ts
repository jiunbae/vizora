import Anthropic from '@anthropic-ai/sdk';
import { DiagramType, DIAGRAM_TYPE_TO_ENGINE } from '@/types/diagram';
import { getMermaidGeneratorPrompt } from './prompts/system';

const anthropic = new Anthropic();

export async function* generateDiagramCode(
  prompt: string,
  diagramType: DiagramType
): AsyncGenerator<string, void, unknown> {
  const engine = DIAGRAM_TYPE_TO_ENGINE[diagramType];

  if (engine !== 'mermaid') {
    // For non-mermaid types, generate a simple placeholder for now
    yield `graph TD\n  A[${diagramType} support coming soon] --> B[Use flowchart for now]`;
    return;
  }

  const systemPrompt = getMermaidGeneratorPrompt(diagramType);

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  let buffer = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      buffer += event.delta.text;
      yield buffer;
    }
  }
}
