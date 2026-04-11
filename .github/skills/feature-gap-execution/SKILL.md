---
name: feature-gap-execution
description: "Use when asked to implement pending Gadgify features from plan/checklist docs as full-stack vertical slices. Keywords: build pending features, implement missing features, complete end to end, finish backlog."
---

# Feature Gap Execution Skill

## Objective

Implement one pending feature end-to-end using project conventions.

## Required Sequence

1. Confirm feature scope and acceptance criteria
2. Update schema/validation contracts if required
3. Implement backend layers (route -> validator -> controller -> service)
4. Implement frontend layers (api -> hook -> page/component)
5. Add i18n keys and error handling
6. Run build/lint checks for changed areas

## Quality Rules

- Follow role-based authorization
- Use transactions for multi-step data changes
- Keep response format consistent
- Avoid hardcoded user-facing strings

## Completion Checklist

- Feature works for expected roles
- Error states are handled
- Query cache invalidation is correct
- No TypeScript compilation regressions in touched files
