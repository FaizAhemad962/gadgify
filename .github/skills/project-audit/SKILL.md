---
name: project-audit
description: "Use when asked to review the full Gadgify project, audit implemented vs missing features, or generate an end-to-end status and next-step plan from markdown files and code. Keywords: review my project, end to end, what is done, what is pending, feature gap, roadmap."
---

# Project Audit Skill

## Objective

Produce a reliable status report by cross-checking documentation and actual implementation.

## Inputs

- Markdown status files in repository root
- .github docs and instructions
- backend/src and frontend/src implementation evidence

## Workflow

1. Read documentation index and implementation checklists
2. Validate claims against existing routes/pages/services/components
3. Separate results into:

- completed
- partial/in-progress
- missing

4. Identify blockers and dependency order
5. Output a practical next-step plan with priorities

## Output Format

- Current completion summary by domain
- Verified completed features
- Verified missing features
- Risks/blockers
- Recommended next 3 implementation tasks

## Guardrails

- Do not assume documentation equals implementation
- Prefer evidence from code paths when available
- Flag uncertainty explicitly when evidence is insufficient
