# Vizora — OAC Contribution Guide

Vizora is an AI-powered scientific figure generator. Next.js 15, TypeScript, Gemini AI, multi-engine rendering (Mermaid + SVG + Plotly).

## Contribution Workflow

Follow these steps **in order**. Do not skip steps.

### Step 1: Load Project Context

Read these files first to understand the project:

1. `.context/README.md` — project context structure and agent usage guide
2. `.context/project/01-overview.md` — tech stack, build instructions, project structure
3. `.context/project/02-architecture.md` — system architecture, rendering pipeline, data flow
4. `.context/development/01-conventions.md` — naming, code style, git rules

### Step 2: Generate Reviews Using Agent Personas

Run reviews using the persona agents defined in `.context/agents/`. Each agent file contains a full persona, methodology, required context loading order, and output format.

**Available agents:**

| Agent | File | Focus |
|-------|------|-------|
| Code Quality | `.context/agents/code-quality-reviewer.md` | Security, code quality, performance |
| AI Prompt | `.context/agents/ai-prompt-reviewer.md` | Prompt quality, classification, output consistency |

**How to run a review:**

1. Read the agent file (e.g., `.context/agents/code-quality-reviewer.md`)
2. Follow the `## Context Loading` section — read every required file in order
3. Adopt the persona from `## Persona`
4. Apply the `## Review Methodology` and `## Critical Review Principles`
5. Produce output per `## Output Format`

**Save reviews to:** `.context/reviews/<NN>-<kebab-case-title>.md`
- Increment `<NN>` from the highest existing review number
- **Always create new files** — never overwrite existing reviews

### Step 3: Create Implementation Plans

Based on the review findings, create implementation plans.

**Save plans to:** `.context/plans/<NN>-<kebab-case-title>.md`
- Increment `<NN>` from the highest existing plan number
- Each plan should reference the review(s) it addresses
- Include: problem description, proposed fix, affected files, estimated effort, priority

Completed plans get moved to `.context/plans/archive/` after implementation.

Also check `.context/plans/feature-backlog.md` for features ready to implement.

### Step 4: Implement Changes

Pick a plan from `.context/plans/` and implement it. Follow these rules:

- **Build check**: Run `npm run build` after changes — must compile with zero errors
- **Type check**: No TypeScript errors — strict mode is enabled
- **Security**: Always sanitize AI-generated content (DOMPurify for SVG, strict mode for Mermaid)
- **Naming**: Follow conventions in `.context/development/01-conventions.md`
- **No secrets**: Never commit API keys or credentials

## Git Workflow

**Push directly to `main`.** No PRs, no feature branches.

```bash
git add <files>
git commit -m "description of change"
git push origin main
```

## Important Rules

- Never use `CLAUDE.md` — all project context lives in `.context/`
- Always create new review/plan files. Never overwrite existing ones
- Build must pass before pushing
- AI-generated SVG must always be sanitized with DOMPurify
- Mermaid must always use `securityLevel: 'strict'`

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build (must pass)
npm run lint         # Lint check
```

## Project Structure

```
src/
  app/           — Next.js pages and API routes
  components/    — React components (ui/, diagram/)
  hooks/         — Custom React hooks
  lib/ai/        — AI pipeline (classifier, generator, validator, prompts)
  types/         — TypeScript type definitions
.context/        — Project context, agents, reviews, plans
.oac/            — This contribution guide
```
