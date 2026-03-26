---
description: "Add a new API endpoint to the Gadgify backend with proper validation, auth, and error handling"
agent: "expert-fullstack-dev"
argument-hint: "HTTP method + path like 'POST /api/reviews'"
---

Create a new API endpoint for the Gadgify backend:

1. **Route** in `backend/src/routes/` — mount with correct HTTP method
2. **Joi Validator** in `backend/src/validators/` — validate body, params, query
3. **Controller** in `backend/src/controllers/` — parse request and call service
4. **Service** in `backend/src/services/` — implement business logic with Prisma

Follow these rules:

- Add `authenticate` middleware if the endpoint requires login
- Add `authorize('ADMIN')` middleware if it's admin-only
- Return `{ success: true, message: '...', data: { ... } }`
- Use Prisma `select`/`include` to avoid over-fetching
- Use `prisma.$transaction()` if multiple DB operations are needed
- Add the route to the Express app in `server.ts`
