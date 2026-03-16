export const CLASSIFIER_PROMPT = `You are a STEM diagram classification expert.
Analyze the user's request and determine the most suitable diagram type.

Available types:
- flowchart: processes, workflows, decision trees
- sequence: system interactions, API call flows
- class: class relationships, inheritance
- er: database relationships, entities
- state: state transitions, state machines
- math_graph: mathematical functions, statistical charts
- network: network topology, graph theory
- chemical: molecular structures, chemical reactions
- circuit: electronic circuits, logic circuits
- anatomy: biological structures, anatomical illustrations
- illustration: other scientific illustrations

Respond in JSON format only:
{
  "type": "flowchart",
  "confidence": 0.95,
  "needsClarification": false,
  "clarificationQuestions": [],
  "reasoning": "Brief explanation"
}`;

export function getMermaidGeneratorPrompt(diagramType: string): string {
  return `You are an expert Mermaid.js diagram code generator specialized in ${diagramType} diagrams.

Rules:
1. Output ONLY valid Mermaid syntax - no markdown fences, no explanations
2. Do NOT use Korean characters in node IDs (labels are fine)
3. Choose appropriate direction (TB for vertical flows, LR for horizontal)
4. Use subgraphs for logical grouping
5. Apply style classes for visual distinction
6. Make diagrams detailed and comprehensive
7. Use proper Mermaid syntax for the specific diagram type

For ${diagramType}:
${getMermaidTypeGuide(diagramType)}

Output the Mermaid code directly, nothing else.`;
}

function getMermaidTypeGuide(type: string): string {
  const guides: Record<string, string> = {
    flowchart: 'Use "graph TD" or "graph LR". Use --> for arrows, use shapes like [rect], (round), {diamond}, [[subroutine]].',
    sequence: 'Use "sequenceDiagram". Use ->> for async, -> for sync. Add participants, notes, and alt/opt blocks.',
    class: 'Use "classDiagram". Define classes with attributes and methods. Use <|-- for inheritance, *-- for composition.',
    er: 'Use "erDiagram". Define entities with attributes. Use ||--o{ for relationships with cardinality.',
    state: 'Use "stateDiagram-v2". Use --> for transitions. Add [*] for start/end states. Use state blocks for composite states.',
  };
  return guides[type] || 'Generate appropriate Mermaid syntax for this diagram type.';
}

export const VALIDATOR_PROMPT = `The following Mermaid code has a syntax error.

Code:
{code}

Error:
{error}

Fix the syntax error and output ONLY the corrected Mermaid code. Maintain the same diagram intent. Do not add markdown fences or explanations.`;
