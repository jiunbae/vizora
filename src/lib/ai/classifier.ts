import { ClassificationResult } from '@/types/diagram';
import { CLASSIFIER_PROMPT } from './prompts/system';
import { getGeminiModel } from './gemini';

export async function classifyDiagram(prompt: string): Promise<ClassificationResult> {
  const model = getGeminiModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'user', parts: [{ text: CLASSIFIER_PROMPT }] },
  });

  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult;
    return parsed;
  } catch {
    return {
      type: 'flowchart',
      confidence: 0.5,
      needsClarification: true,
      clarificationQuestions: ['Could you describe what kind of diagram you need?'],
      reasoning: 'Classification failed, defaulting to flowchart',
    };
  }
}
