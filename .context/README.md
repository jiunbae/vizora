# Vizora — Project Context

This directory contains project context, conventions, agent definitions, reviews, plans, and documentation for AI assistants and contributors.

## Structure

```
.context/
├── README.md                          # This file
├── project/
│   ├── 01-overview.md                 # Tech stack, build instructions, structure
│   └── 02-architecture.md             # System architecture, rendering pipeline, data flow
├── development/
│   └── 01-conventions.md              # Naming, code style, git rules
├── agents/                            # Reusable AI agent definitions
│   ├── code-quality-reviewer.md       # Code quality & security reviewer
│   ├── ui-ux-designer-reviewer.md     # UI/UX design reviewer
│   ├── ai-prompt-reviewer.md          # AI prompt engineering reviewer
│   └── product-marketer-reviewer.md   # Product marketing strategist
├── reviews/                           # Critical review documents
│   └── (numbered review files)
├── plans/
│   ├── feature-backlog.md             # Active feature backlog
│   └── archive/                       # Completed implementation plans
├── impl/                              # Implementation tracking
│   └── (sprint directories)
└── docs/
    └── (external documentation)
```

## Agents

Agent definitions live in `.context/agents/`. Each agent is a markdown file that defines a reusable persona, methodology, and output format that any AI coding tool can load and execute.

### How to Load an Agent

1. **Discover**: List files in `.context/agents/` to find available agents.
2. **Read the agent file**: Open `.context/agents/<agent-id>.md` and parse its sections.
3. **Load required context**: Follow the `## Context Loading` section in order.
4. **Activate**: Adopt the persona defined in the `## Persona` section.
5. **Execute**: Produce output following the `## Output Format` section. **Always create new files** — never overwrite existing reviews or plans.

### Available Agents

| ID | Role | Description |
|----|------|-------------|
| `code-quality-reviewer` | Senior Software Engineer | Reviews code quality, security, performance, and maintainability |
| `ui-ux-designer-reviewer` | UI/UX Designer | Reviews interface design, interaction patterns, accessibility |
| `ai-prompt-reviewer` | AI Prompt Engineer | Reviews prompt engineering quality, output consistency, edge cases |
| `product-marketer-reviewer` | Product Marketer | Reviews positioning, messaging, competitive differentiation |
