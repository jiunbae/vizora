import Anthropic from '@anthropic-ai/sdk';
import { ClassificationResult } from '@/types/diagram';
import { CLASSIFIER_PROMPT } from './prompts/system';

const anthropic = new Anthropic();

export async function classifyDiagram(prompt: string): Promise<ClassificationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: CLASSIFIER_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const result = JSON.parse(jsonMatch[0]) as ClassificationResult;
    return result;
  } catch {
    // Fallback to flowchart if classification fails
    return {
      type: 'flowchart',
      confidence: 0.5,
      needsClarification: true,
      clarificationQuestions: ['Could you describe what kind of diagram you need?'],
      reasoning: 'Classification failed, defaulting to flowchart',
    };
  }
}
