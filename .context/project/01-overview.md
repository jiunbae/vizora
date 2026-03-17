# Vizora

AI-powered scientific figure generator for publication-quality STEM diagrams.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 15 (App Router, React Server Components)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **AI**: Google Gemini 3.1 Flash Lite Preview (multi-key rotation)
- **Diagram Rendering**: Mermaid.js 11, Plotly.js, AI-generated SVG
- **Security**: DOMPurify for SVG sanitization
- **Streaming**: Server-Sent Events via TransformStream
- **Build**: npm, Turbopack (dev)
- **Deployment**: Vercel (target)

## Build & Run

```bash
npm install
npm run dev          # Development server (port 3456)
npm run build        # Production build
npm run start        # Production server
```

## Environment Variables

```env
GEMINI_API_KEY=      # Required: Gemini API key
GEMINI_API_KEYS=     # Optional: comma-separated keys for rotation
NEXT_PUBLIC_APP_URL=http://localhost:3000
DAILY_FREE_CREDITS=10
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main page — prompt input + diagram viewer
│   ├── layout.tsx               # Root layout with ThemeProvider
│   └── api/generate/route.ts   # SSE streaming endpoint
├── components/
│   ├── ui/                      # shadcn/ui components (9 components)
│   └── diagram/
│       ├── MermaidRenderer.tsx   # Mermaid with academic theme (light/dark)
│       ├── SvgRenderer.tsx       # Raw SVG with DOMPurify sanitization
│       ├── PlotlyRenderer.tsx    # Interactive Plotly charts
│       └── DiagramViewer.tsx     # Unified viewer with zoom + export
├── hooks/
│   └── useGenerate.ts           # SSE client with status tracking + cancellation
├── lib/ai/
│   ├── gemini.ts                # Multi-key Gemini client with round-robin
│   ├── classifier.ts            # Subject-matter diagram type classifier
│   ├── generator.ts             # Multi-engine code generator (streaming)
│   ├── validator.ts             # Mermaid syntax validator + auto-fix
│   └── prompts/system.ts        # Engine-specific system prompts
└── types/
    ├── diagram.ts               # Shared types: DiagramType, RenderEngine, StreamEvent
    └── react-plotly.d.ts        # Plotly type declarations
```

## Key Features

- **Multi-engine rendering**: AI auto-selects Mermaid, SVG, or Plotly
- **Subject-matter classification**: Routes biology→SVG, software→Mermaid, math→Plotly
- **Real-time streaming**: Diagrams generate live via SSE
- **Publication-quality output**: Academic color palettes, clean typography
- **9 sample prompts**: Covering circuits, chemistry, biology, databases, networks, ML
- **Export**: SVG, PNG (2x resolution)
- **Dark/Light themes**: Both optimized for screen and print
