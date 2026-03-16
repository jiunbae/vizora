import Anthropic from '@anthropic-ai/sdk';
import { VALIDATOR_PROMPT } from './prompts/system';

const anthropic = new Anthropic();

export interface ValidationResult {
  valid: boolean;
  code: string;
  error?: string;
}

export async function validateMermaidCode(code: string): Promise<ValidationResult> {
  // Basic syntax checks before sending to AI for correction
  const trimmed = code.trim();

  // Remove markdown fences if present
  const cleaned = trimmed
    .replace(/^```mermaid\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  if (!cleaned) {
    return { valid: false, code: cleaned, error: 'Empty code' };
  }

  // Check for basic Mermaid diagram type declarations
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

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : code;

  // Clean up any markdown fences
  return text
    .replace(/^```mermaid\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
}
