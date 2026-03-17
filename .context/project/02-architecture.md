# Vizora — System Architecture

## Generation Pipeline

```
User Input (prompt + optional type)
    │
    ▼
[1. Classifier] ─── Gemini API (non-streaming)
    │ Output: { type, confidence, engine }
    │ Routes by SUBJECT MATTER, not keywords
    │
    ▼
[2. Generator] ─── Gemini API (streaming via SSE)
    │ Engine-specific system prompt:
    │   Mermaid → getMermaidGeneratorPrompt()
    │   SVG     → getSvgGeneratorPrompt()
    │   Plotly  → getPlotlyGeneratorPrompt()
    │
    ▼
[3. Validator] ─── Code-level validation (Mermaid only)
    │ sanitizeMermaidCode(): fix {{ }}, quotes, etc.
    │ validateMermaidCode(): check diagram type starters
    │ fixMermaidCode(): AI-powered error correction
    │
    ▼
[4. Renderer] ─── Client-side rendering
    │ MermaidRenderer: mermaid.render() with academic theme
    │ SvgRenderer: DOMPurify + dangerouslySetInnerHTML
    │ PlotlyRenderer: react-plotly.js (dynamic import)
    │
    ▼
[Output: Diagram + Code View + Export (SVG/PNG)]
```

## Rendering Engine Matrix

| Engine | Diagram Types | Output Format | Interactive |
|--------|---------------|---------------|-------------|
| Mermaid | flowchart, sequence, class, ER, state, network | SVG (rendered) | No |
| SVG | circuit, chemical, anatomy, illustration | Raw SVG | No |
| Plotly | math_graph | JSON → Canvas/SVG | Yes |

## SSE Streaming Architecture

```
Client (useGenerate hook)          Server (POST /api/generate)
    │                                   │
    │── POST /api/generate ──────────>  │
    │                                   │── TransformStream created
    │                                   │── Response returned immediately
    │                                   │
    │  <── data: {phase:"classifying"}  │── Gemini classify (non-streaming)
    │  <── data: {classification:...}   │
    │                                   │
    │  <── data: {phase:"generating"}   │── Gemini generate (streaming)
    │  <── data: {data: partial_code}   │   └── for await (chunk of stream)
    │  <── data: {data: more_code}      │
    │  <── ...                          │
    │                                   │
    │  <── data: {phase:"validating"}   │── Validate (Mermaid only)
    │                                   │
    │  <── data: {phase:"complete",     │── Final result
    │       code:..., engine:...}       │
    │                                   │── writer.close()
```

## Gemini Multi-Key Rotation

```typescript
// lib/ai/gemini.ts
const API_KEYS = process.env.GEMINI_API_KEYS?.split(',');
let currentKeyIndex = 0;

function getNextKey(): string {
  const key = API_KEYS[currentKeyIndex % API_KEYS.length];
  currentKeyIndex++;
  return key;
}
```

Round-robin across configured keys to avoid rate limits on free tier.

## Security Considerations

- **SVG Sanitization**: DOMPurify with SVG profile for all AI-generated SVG
- **Mermaid Security**: `securityLevel: 'strict'` disables JS execution in diagrams
- **API Keys**: `.env.local` excluded via `.gitignore` (`.env*` pattern)
- **Input Validation**: Prompt length and type validation in API route
- **No user auth yet**: All generation is anonymous (future: Supabase auth)
