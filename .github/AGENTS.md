# Gadgify Agents Guide

Use workspace custom assets before default behavior.

## Primary Sources

1. .github/copilot-instructions.md
2. .github/instructions/\*.instructions.md
3. .github/roles/\*.role.md
4. .github/plan/\*.plan.md
5. .github/skills/\*/SKILL.md
6. .github/agents/\*.agent.md
7. .github/prompts/\*.prompt.md

## Execution Policy

- For project status requests, use project-audit skill or project-auditor agent behavior
- For building missing features, use feature-gap-execution skill and expert-fullstack-dev agent behavior
- Keep implementation evidence-based: verify docs against code
- Preserve security and Maharashtra validation requirements

## Task Routing

- New feature implementation: use `.github/prompts/new-feature.prompt.md` or `.github/prompts/implement-priority-gap.prompt.md`
- New backend endpoint: use `.github/prompts/new-endpoint.prompt.md`
- Debugging: use `.github/prompts/debug.prompt.md`
- End-to-end review: use `.github/prompts/project-review.prompt.md`

## Quick Commands

- Frontend: `cd frontend && npm run dev`
- Frontend build: `cd frontend && npm run build`
- Backend: `cd backend && npm run dev`
- Backend build: `cd backend && npm run build`
- Prisma migration: `cd backend && npx prisma migrate dev --name <name>`
