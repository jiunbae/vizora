# Vizora — Development Conventions

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase | `MermaidRenderer.tsx`, `DiagramViewer.tsx` |
| Hooks | camelCase, `use` prefix | `useGenerate.ts` |
| Lib modules | camelCase | `classifier.ts`, `generator.ts` |
| Types | PascalCase | `DiagramType`, `RenderEngine` |
| Constants | UPPER_SNAKE_CASE | `DIAGRAM_TYPE_TO_ENGINE` |
| API routes | kebab-case directories | `app/api/generate/route.ts` |
| CSS classes | Tailwind utility-first | No custom CSS files |

## Code Style

- **TypeScript strict mode**: No `any` types, explicit return types for public APIs
- **Imports**: Use `@/` path alias for all src imports
- **Components**: `'use client'` directive for client components only
- **Error handling**: Always catch async errors, show user-friendly messages
- **Comments**: Only where logic isn't self-evident. No JSDoc on obvious functions

## File Organization

- **One component per file** in `components/`
- **Collocate related files**: renderers together in `components/diagram/`
- **Prompts separate**: Each prompt type in `lib/ai/prompts/`
- **Types centralized**: All shared types in `types/diagram.ts`

## Git Rules

- **Commit messages**: Start with verb, describe what changed and why
- **No force push** to main
- **No secrets** in commits — use `.env.local`
- **Co-author tag**: Include AI co-author attribution

## AI Pipeline Rules

- **Classifier**: Route by subject matter, not keywords
- **Generator**: Always stream responses via SSE
- **Validator**: Only validate Mermaid output; SVG and Plotly skip validation
- **Prompts**: Keep engine-specific prompts in `prompts/system.ts`
- **Security**: Always sanitize AI-generated SVG with DOMPurify

## Adding a New Diagram Type

1. Add type to `DiagramType` union in `types/diagram.ts`
2. Map to engine in `DIAGRAM_TYPE_TO_ENGINE`
3. Add label/description in `DIAGRAM_LABELS`
4. Update classifier prompt in `prompts/system.ts`
5. Add engine-specific prompt if needed
6. Add sample prompt in `page.tsx` `SAMPLE_PROMPTS`
