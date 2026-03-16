export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'er'
  | 'state'
  | 'math_graph'
  | 'network'
  | 'chemical'
  | 'circuit'
  | 'anatomy'
  | 'illustration';

export type RenderEngine = 'mermaid' | 'd3' | 'svg' | 'image';

export const DIAGRAM_TYPE_TO_ENGINE: Record<DiagramType, RenderEngine> = {
  flowchart: 'mermaid',
  sequence: 'mermaid',
  class: 'mermaid',
  er: 'mermaid',
  state: 'mermaid',
  math_graph: 'd3',
  network: 'mermaid',
  chemical: 'svg',
  circuit: 'svg',
  anatomy: 'svg',
  illustration: 'svg',
};

export interface ClassificationResult {
  type: DiagramType;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions: string[];
  reasoning: string;
}

export interface GenerationJob {
  id: string;
  prompt: string;
  diagramType: DiagramType;
  status: 'classifying' | 'clarifying' | 'generating' | 'validating' | 'complete' | 'error';
  code?: string;
  svgOutput?: string;
  imageUrl?: string;
  error?: string;
  variants?: DiagramVariant[];
  createdAt: Date;
}

export interface DiagramVariant {
  id: string;
  code: string;
  qualityScore: number;
  isSelected: boolean;
}

export interface StreamEvent {
  phase: 'classifying' | 'generating' | 'validating' | 'complete' | 'error';
  data?: string;
  classification?: ClassificationResult;
  code?: string;
  error?: string;
  engine?: RenderEngine;
}

export const DIAGRAM_LABELS: Record<DiagramType, { label: string; description: string; icon: string }> = {
  flowchart: { label: '\uD50C\uB85C\uC6B0\uCC28\uD2B8', description: '\uD504\uB85C\uC138\uC2A4, \uC6CC\uD06C\uD50C\uB85C, \uC758\uC0AC\uACB0\uC815 \uD2B8\uB9AC', icon: '\uD83D\uDD00' },
  sequence: { label: '\uC2DC\uD000\uC2A4 \uB2E4\uC774\uC5B4\uADF8\uB7A8', description: '\uC2DC\uC2A4\uD15C \uAC04 \uC0C1\uD638\uC791\uC6A9, API \uD638\uCD9C', icon: '\u2194\uFE0F' },
  class: { label: '\uD074\uB798\uC2A4 \uB2E4\uC774\uC5B4\uADF8\uB7A8', description: '\uD074\uB798\uC2A4 \uAD00\uACC4, \uC0C1\uC18D \uAD6C\uC870', icon: '\uD83C\uDFD7\uFE0F' },
  er: { label: 'ER \uB2E4\uC774\uC5B4\uADF8\uB7A8', description: '\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uAD00\uACC4, \uC5D4\uD2F0\uD2F0', icon: '\uD83D\uDDC3\uFE0F' },
  state: { label: '\uC0C1\uD0DC \uB2E4\uC774\uC5B4\uADF8\uB7A8', description: '\uC0C1\uD0DC \uC804\uC774, \uC0C1\uD0DC \uBA38\uC2E0', icon: '\uD83D\uDD04' },
  math_graph: { label: '\uC218\uD559 \uADF8\uB798\uD504', description: '\uD568\uC218 \uADF8\uB798\uD504, \uD1B5\uACC4 \uCC28\uD2B8', icon: '\uD83D\uDCC8' },
  network: { label: '\uB124\uD2B8\uC6CC\uD06C \uB2E4\uC774\uC5B4\uADF8\uB7A8', description: '\uB124\uD2B8\uC6CC\uD06C \uD1A0\uD3F4\uB85C\uC9C0, \uADF8\uB798\uD504', icon: '\uD83C\uDF10' },
  chemical: { label: '\uD654\uD559 \uAD6C\uC870', description: '\uBD84\uC790 \uAD6C\uC870, \uD654\uD559 \uBC18\uC751\uC2DD', icon: '\u2697\uFE0F' },
  circuit: { label: '\uD68C\uB85C\uB3C4', description: '\uC804\uC790 \uD68C\uB85C, \uB17C\uB9AC \uD68C\uB85C', icon: '\u26A1' },
  anatomy: { label: '\uD574\uBD80\uD559', description: '\uC0DD\uBB3C\uD559\uC801 \uAD6C\uC870, \uD574\uBD80\uB3C4', icon: '\uD83E\uDEC0' },
  illustration: { label: '\uACFC\uD559 \uC77C\uB7EC\uC2A4\uD2B8', description: '\uAE30\uD0C0 \uACFC\uD559 \uC2DC\uAC01 \uC790\uB8CC', icon: '\uD83D\uDD2C' },
};
