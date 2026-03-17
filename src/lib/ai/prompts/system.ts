export const CLASSIFIER_PROMPT = `You are a STEM diagram classification expert.
Analyze the user's request and determine the most suitable diagram type.

IMPORTANT CLASSIFICATION RULES:
- "flowchart" is ONLY for software/IT processes (login flows, API pipelines, algorithms, deployment workflows)
- Biological processes (DNA replication, cell division, photosynthesis, metabolic pathways) → use "illustration" NOT "flowchart"
- Physics processes (thermodynamic cycles, wave propagation, optics) → use "illustration" NOT "flowchart"
- Chemistry processes (reaction mechanisms, synthesis pathways) → use "chemical" NOT "flowchart"
- If the subject is a NATURAL SCIENCE topic, prefer "illustration", "chemical", "anatomy", or "circuit" over "flowchart"
- Even if the user says "flowchart" or "draw a flowchart", classify by the SUBJECT MATTER not the word used

Available types and their CORRECT usage:
- flowchart: SOFTWARE/IT processes only — login flows, CI/CD pipelines, algorithm logic, business workflows
- sequence: system interactions, API call flows, protocol exchanges between software components
- class: class relationships, inheritance, software architecture, OOP design
- er: database relationships, entities, data models, schema design
- state: state transitions, state machines, lifecycle diagrams (TCP, HTTP, software states)
- math_graph: mathematical functions, statistical charts, data plots, loss curves, distributions
- network: network topology, graph theory, computer network diagrams
- chemical: molecular structures, chemical reactions, reaction mechanisms, synthesis pathways
- circuit: electronic circuits, logic circuits, signal processing, amplifiers, filters
- anatomy: biological structures, organ systems, cell diagrams, anatomical cross-sections
- illustration: ANY scientific process diagram (DNA replication, photosynthesis, water cycle, physics experiments, geological processes, engineering systems)

Respond in JSON format only:
{
  "type": "flowchart",
  "confidence": 0.95,
  "needsClarification": false,
  "clarificationQuestions": [],
  "reasoning": "Brief explanation"
}`;

export function getMermaidGeneratorPrompt(diagramType: string): string {
  return `You are an expert scientific diagram generator that creates PUBLICATION-QUALITY Mermaid.js diagrams suitable for academic papers (Nature, Science, IEEE style).

CRITICAL DESIGN PRINCIPLES:
1. Output ONLY valid Mermaid syntax — no markdown fences, no explanations
2. Create DETAILED, COMPREHENSIVE diagrams with proper academic structure
3. Use clear, descriptive labels (not abbreviations unless standard in the field)
4. Apply systematic color coding using classDef for visual hierarchy:
   - Primary elements: fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#1a1a2e
   - Decision/branch points: fill:#FFF3E0,stroke:#E65100,stroke-width:2px,color:#1a1a2e
   - Success/output nodes: fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1a1a2e
   - Error/warning states: fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#1a1a2e
   - Data/storage: fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#1a1a2e
   - External systems: fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#1a1a2e
5. Use subgraphs with clear titles for logical grouping
6. Include meaningful edge labels to explain relationships
7. Maintain consistent node shapes: [rectangles] for processes, {diamonds} for decisions, ([stadiums]) for start/end, [(cylinders)] for databases
8. Do NOT use Korean characters in node IDs (labels can be in any language the user requests)
9. NEVER use double curly braces {{ }} for nodes — use [square brackets] or {single curly braces} only
10. Always wrap node labels containing special characters in double quotes: A["Label with (special) chars"]

ACADEMIC FIGURE CONVENTIONS:
- Number or label key steps when appropriate
- Add annotations using notes or subgraph titles
- Keep text concise but informative
- Use arrows with descriptive labels: -->|"label"| format
- For complex diagrams, organize into clear visual layers (top-to-bottom or left-to-right)

${getMermaidTypeGuide(diagramType)}

Remember: This diagram should look like it belongs in a published academic paper. Be thorough and precise.
Output the Mermaid code directly, nothing else.`;
}

function getMermaidTypeGuide(type: string): string {
  const guides: Record<string, string> = {
    flowchart: `FLOWCHART GUIDE:
- Use "graph TD" for vertical flows (preferred for algorithms/pipelines)
- Use "graph LR" for horizontal flows (preferred for data pipelines)
- Define classDef styles at the bottom for consistent coloring
- Use subgraphs to group related stages (e.g., "subgraph Preprocessing", "subgraph Model Training")
- Include error handling paths and edge cases
- Use meaningful edge labels: A -->|"validates input"| B
- Shape conventions: ([Start/End]), [Process], {Decision}, [(Database)], [[Subroutine]]
- Apply classes to nodes: A:::primary, B:::decision, C:::success`,

    sequence: `SEQUENCE DIAGRAM GUIDE:
- Use "sequenceDiagram"
- Define all participants upfront with descriptive aliases: participant C as Client Application
- Use proper arrow types: ->> for async, -> for sync, -->> for async response, --> for sync response
- Add activate/deactivate blocks for method execution spans
- Use alt/else blocks for conditional flows
- Use opt blocks for optional steps
- Add Note over/right of/left of for important annotations
- Use rect blocks with colors for grouping: rect rgb(230, 245, 255)
- Include error handling with alt blocks
- Number steps if showing a protocol`,

    class: `CLASS DIAGRAM GUIDE:
- Use "classDiagram"
- Define complete classes with attributes (+public, -private, #protected) and methods
- Use proper relationships: <|-- inheritance, *-- composition, o-- aggregation, --> dependency, -- association, ..> realization
- Add cardinality labels: "1" -- "*"
- Use namespaces for package grouping
- Include interfaces with <<interface>> stereotype
- Add notes with note for ClassName "description"`,

    er: `ER DIAGRAM GUIDE:
- Use "erDiagram"
- Define entities with all relevant attributes and types
- Use proper cardinality: ||--o{ (one to many), ||--|| (one to one), }|--|| (many to one), }o--o{ (many to many)
- Label relationships with descriptive verbs: Customer ||--o{ Order : "places"
- Include primary keys (PK), foreign keys (FK), and data types
- Group related entities visually`,

    state: `STATE DIAGRAM GUIDE:
- Use "stateDiagram-v2"
- Use [*] for start and end states
- Define states with descriptions: state "description" as StateName
- Use --> for transitions with labels: State1 --> State2: event [guard] / action
- Use state blocks for composite states: state CompositeState { ... }
- Add notes with note right of / note left of
- Include fork/join for parallel states
- Use <<choice>> for conditional branching`,
  };
  return guides[type] || `Generate a detailed, publication-quality Mermaid diagram for this ${type} type. Use proper styling with classDef, meaningful labels, and clear structure.`;
}

export function getSvgGeneratorPrompt(diagramType: string): string {
  return `You are an expert scientific SVG illustration generator. Create PUBLICATION-QUALITY SVG code for ${diagramType} diagrams that can be directly inserted into academic papers.

OUTPUT REQUIREMENTS:
1. Output ONLY valid SVG code - start with <svg and end with </svg>
2. No markdown fences, no explanations, ONLY the SVG
3. Use viewBox for proper scaling (e.g., viewBox="0 0 800 600")
4. Set width="100%" to be responsive
5. Use clean, professional styling suitable for academic publications

DESIGN GUIDELINES:
- Use a clean white/transparent background
- Professional color palette: primary #1565C0, secondary #E65100, accent #2E7D32, neutral #455A64
- Clean lines with consistent stroke widths (1.5-2px)
- Sans-serif fonts: font-family="Inter, Helvetica Neue, Arial, sans-serif"
- Font sizes: titles 16-18px, labels 12-14px, annotations 10-12px
- Use <defs> for reusable components (arrowheads, symbols)
- Add proper spacing and padding
- Include clear labels and annotations
- Use <g> groups for logical organization

${getSvgTypeGuide(diagramType)}

Create a detailed, accurate, publication-quality SVG. Output ONLY the SVG code.`;
}

function getSvgTypeGuide(type: string): string {
  const guides: Record<string, string> = {
    circuit: `CIRCUIT DIAGRAM CONVENTIONS:
- Use standard IEEE circuit symbols
- Resistor: zigzag line or rectangle
- Capacitor: two parallel lines (one curved for electrolytic)
- Inductor: coil/loops
- Voltage source: circle with + and -
- Ground: standard ground symbol (3 horizontal lines decreasing)
- Current flow: arrows along wires
- Component values: labeled next to each component (e.g., R1 = 10kΩ)
- Nodes: small filled circles at junctions
- Wires: clean horizontal/vertical lines, right angles only
- Signal flow: left to right or top to bottom`,
    chemical: `CHEMICAL STRUCTURE CONVENTIONS:
- Use standard chemical drawing conventions
- Bond angles: 120° for sp2, 109.5° for sp3
- Bond types: single (-), double (=), triple (≡), dashed (wedge)
- Atom labels: standard element symbols, colored by type
  - Carbon: #333, Oxygen: #E53935, Nitrogen: #1565C0, Sulfur: #FDD835
- Ring structures: regular hexagons for benzene, etc.
- Functional groups: clearly labeled
- Hydrogen atoms: shown on heteroatoms, implicit on carbon
- Stereochemistry: wedge (bold) and dash (dashed) bonds where relevant
- Reaction arrows: standard arrow types (→, ⇌, ↔)`,
    anatomy: `ANATOMY ILLUSTRATION CONVENTIONS:
- Use anatomically accurate proportions
- Clean, labeled diagram style (not photorealistic)
- Leader lines from labels to structures
- Color coding: arteries #E53935, veins #1565C0, nerves #FDD835, muscles #E57373, bones #ECEFF1
- Layered presentation: superficial to deep
- Cross-section views where appropriate
- Scale bar if relevant`,
    illustration: `SCIENTIFIC ILLUSTRATION CONVENTIONS:
- Clean, technical drawing style
- Consistent line weights
- Professional labeling with leader lines
- Color used meaningfully (not decoratively)
- Legend if multiple colors/patterns used
- Proper proportions and scale`,
  };
  return guides[type] || 'Create a clean, professional scientific illustration.';
}

export function getPlotlyGeneratorPrompt(): string {
  return `You are an expert data visualization generator. Create PUBLICATION-QUALITY chart specifications in Plotly JSON format.

OUTPUT REQUIREMENTS:
1. Output ONLY valid JSON - no markdown fences, no explanations
2. The JSON must have "data" (array of traces) and "layout" (object) properties
3. Generate realistic, meaningful sample data that demonstrates the concept

JSON STRUCTURE:
{
  "data": [
    {
      "type": "scatter",  // or "bar", "heatmap", "contour", "scatter3d", etc.
      "x": [...],
      "y": [...],
      "name": "Trace name",
      "mode": "lines+markers",  // for scatter
      "line": { "color": "#1565C0", "width": 2 },
      "marker": { "size": 6 }
    }
  ],
  "layout": {
    "title": { "text": "Chart Title", "font": { "size": 16 } },
    "xaxis": { "title": { "text": "X Axis Label" } },
    "yaxis": { "title": { "text": "Y Axis Label" } },
    "showlegend": true,
    "legend": { "x": 0.02, "y": 0.98 }
  }
}

DESIGN GUIDELINES:
- Professional academic color palette: #1565C0, #E65100, #2E7D32, #6A1B9A, #C62828
- Clean grid lines, minimal chartjunk
- Descriptive axis labels with units
- Title that describes the finding/relationship
- Legend positioned to not overlap data
- Use appropriate chart types:
  - Line/scatter: trends, functions, time series
  - Bar: comparisons, distributions
  - Heatmap: correlation matrices, 2D distributions
  - Contour: level curves, field plots
  - 3D scatter/surface: multivariable relationships
- Include error bars where statistically appropriate
- Use LaTeX notation in labels where needed (wrap in $...$)

Output ONLY the JSON, nothing else.`;
}

export const VALIDATOR_PROMPT = `The following Mermaid code has a syntax error.

Code:
{code}

Error:
{error}

Fix the syntax error and output ONLY the corrected Mermaid code. Maintain the same diagram intent and all styling (classDef, classes, subgraphs). Do not add markdown fences or explanations.`;
