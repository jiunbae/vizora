import { VALIDATOR_PROMPT } from './prompts/system';
import { getGeminiModel } from './gemini';

export interface ValidationResult {
  valid: boolean;
  code: string;
  error?: string;
}

export async function validateMermaidCode(code: string): Promise<ValidationResult> {
  const trimmed = code.trim();

  const cleaned = trimmed
    .replace(/^```mermaid\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  if (!cleaned) {
    return { valid: false, code: cleaned, error: 'Empty code' };
  }

  const validStarters = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
    'erDiagram', 'stateDiagram', 'gantt', 'pie', 'gitgraph',
    'mindmap', 'timeline', 'sankey', 'block',
  ];

  const hasValidStart = validStarters.some(s =>
    cleaned.toLowerCase().startsWith(s.toLowerCase())
  );

  if (!hasValidStart) {
    return { valid: false, code: cleaned, error: 'Missing diagram type declaration' };
  }

  return { valid: true, code: cleaned };
}

export async function fixMermaidCode(code: string, error: string): Promise<string> {
  const prompt = VALIDATOR_PROMPT
    .replace('{code}', code)
    .replace('{error}', error);

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text
    .replace(/^```mermaid\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
}
