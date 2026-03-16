import { DiagramType, DIAGRAM_TYPE_TO_ENGINE } from '@/types/diagram';
import { getMermaidGeneratorPrompt } from './prompts/system';
import { getGeminiModel } from './gemini';

export async function* generateDiagramCode(
  prompt: string,
  diagramType: DiagramType
): AsyncGenerator<string, void, unknown> {
  const engine = DIAGRAM_TYPE_TO_ENGINE[diagramType];

  if (engine !== 'mermaid') {
    yield `graph TD\n  A[${diagramType} support coming soon] --> B[Use flowchart for now]`;
    return;
  }

  const systemPrompt = getMermaidGeneratorPrompt(diagramType);
  const model = getGeminiModel();

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
  });

  let buffer = '';

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      buffer += text;
      yield buffer;
    }
  }
}
