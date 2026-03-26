---
description: "Debug and fix an issue in the Gadgify codebase — trace the error through the full stack"
agent: "expert-fullstack-dev"
argument-hint: "Describe the bug or paste the error message"
---

Debug this issue in the Gadgify e-commerce app. Follow this approach:

## Debugging Steps

1. **Read the error** — identify the file, line, and error type
2. **Trace the data flow**:
   - Frontend: Component → Hook → API function → Axios request
   - Backend: Route → Middleware → Controller → Service → Prisma
3. **Check common causes**:
   - Missing/wrong environment variables
   - TypeScript type mismatches
   - Prisma schema out of sync (`npx prisma generate`)
   - Missing Joi validation for new fields
   - CORS or auth cookie issues
   - React Query cache stale data
4. **Fix the root cause** — don't patch symptoms
5. **Verify** — confirm the fix doesn't break related functionality

## When Fixing

- Keep changes minimal — fix the bug, don't refactor surroundings
- If it's a data issue, check the Prisma schema and migrations
- If it's a frontend render issue, check React Query keys and data shape
- If it's an auth issue, check JWT middleware and cookie settings
