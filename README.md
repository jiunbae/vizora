<div align="center">

# Vizora

**AI-powered scientific figure generator for publication-quality STEM diagrams**

Generate circuits, chemical structures, biological illustrations, mathematical graphs, and software diagrams — all from natural language.

[Getting Started](#getting-started) · [Features](#features) · [Architecture](#architecture) · [Rendering Engines](#rendering-engines)

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-Engine Rendering** | Mermaid, SVG, and Plotly engines auto-selected by AI |
| **Publication Quality** | Academic color palettes, clean typography, proper conventions |
| **Real-time Streaming** | Watch diagrams generate live via Server-Sent Events |
| **Smart Classification** | AI routes prompts to optimal rendering engine by subject matter |
| **Export Options** | Download as SVG, PNG with 2x resolution |
| **Dark/Light Themes** | Both themes optimized for screen and print |
| **Sample Prompts** | 9 curated examples across all STEM domains |

## Rendering Engines

```
Prompt → AI Classifier → Engine Selection → Rendering
```

| Engine | Diagram Types | Quality |
|--------|---------------|---------|
| **Mermaid** | Flowcharts, Sequence, Class, ER, State, Network | Structured diagrams |
| **SVG** | Circuits, Chemistry, Anatomy, Scientific Illustrations | Publication-ready vectors |
| **Plotly** | Math graphs, Statistical charts, Loss curves, Distributions | Interactive + exportable |

### Engine Routing Examples

| Prompt | Classified As | Engine |
|--------|---------------|--------|
| "CI/CD deployment pipeline" | `flowchart` | Mermaid |
| "DNA replication process" | `illustration` | SVG |
| "Inverting op-amp circuit" | `circuit` | SVG |
| "Caffeine molecular structure" | `chemical` | SVG |
| "Training vs validation loss" | `math_graph` | Plotly |
| "OAuth2 authentication flow" | `sequence` | Mermaid |
| "University database schema" | `er` | Mermaid |
| "TCP connection lifecycle" | `state` | Mermaid |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI | Google Gemini 3.1 Flash Lite (multi-key rotation) |
| Diagrams | Mermaid.js 11 |
| Charts | Plotly.js + react-plotly.js |
| SVG | AI-generated + DOMPurify sanitization |
| Streaming | SSE via TransformStream |

## Getting Started

### Prerequisites

- Node.js 20+
- Gemini API key ([Get one free](https://aistudio.google.com/))

### Setup

```bash
# Clone
git clone https://github.com/jiunbae/vizora.git
cd vizora

# Install
npm install

# Configure
cp .env.local.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_key_here

# Optional: multiple keys for rate limit rotation
GEMINI_API_KEYS=key1,key2,key3

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DAILY_FREE_CREDITS=10
```

## Architecture

```
src/
├── app/
│   ├── page.tsx                 # Main UI with prompt input + diagram viewer
│   └── api/generate/route.ts   # SSE streaming endpoint
├── components/diagram/
│   ├── MermaidRenderer.tsx      # Mermaid with academic theme
│   ├── SvgRenderer.tsx          # Raw SVG with DOMPurify
│   ├── PlotlyRenderer.tsx       # Interactive Plotly charts
│   └── DiagramViewer.tsx        # Unified viewer with export
├── hooks/
│   └── useGenerate.ts           # SSE client with status tracking
├── lib/ai/
│   ├── gemini.ts                # Multi-key Gemini client
│   ├── classifier.ts            # Diagram type classifier
│   ├── generator.ts             # Multi-engine code generator
│   ├── validator.ts             # Mermaid syntax validator + auto-fix
│   └── prompts/system.ts        # Engine-specific system prompts
└── types/
    └── diagram.ts               # Shared types and constants
```

### Generation Pipeline

```
User Input
    │
    ▼
[1. Classify] → Determine diagram type + rendering engine
    │
    ▼
[2. Generate] → Stream code via engine-specific prompt
    │              Mermaid → Mermaid syntax
    │              SVG     → Raw SVG code
    │              Plotly  → JSON chart spec
    ▼
[3. Validate] → Syntax check + auto-fix (Mermaid only)
    │
    ▼
[4. Render]   → Client-side rendering with academic styling
```

## License

Private repository. All rights reserved.
