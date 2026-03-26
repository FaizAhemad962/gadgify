---
description: "Use when writing Express controllers, services, routes, or middleware for the Gadgify backend. Covers layered architecture, Joi validation, JWT auth, and error handling."
applyTo: "backend/src/**"
---

# Backend Development Rules

## Layered Architecture (strict)

```
Route → Joi Validation Middleware → Controller → Service → Prisma
```

- **Routes**: Define HTTP method + path, attach middleware and controller
- **Controllers**: Parse request, call service, send response — no business logic
- **Services**: All business logic and Prisma calls go here
- **Validators**: Joi schemas exported as middleware

## Response Format

Always return:

```json
{ "success": true/false, "message": "...", "data": { ... } }
```

## Error Handling

- Wrap async controllers to catch errors automatically
- Throw errors in services → they flow to `errorHandler` middleware
- Never send raw error stacks in responses

## Auth & Security

- Protected routes: `authenticate` middleware verifies JWT from httpOnly cookie
- Admin routes: add `authorize('ADMIN')` after `authenticate`
- Hash passwords with `bcryptjs` — never store plain text
- Validate all input via Joi before it reaches the controller
- Rate-limit sensitive endpoints (login, signup, payment)

## Database

- Use Prisma Client — never write raw SQL
- Use `prisma.$transaction()` for multi-step operations
- Add proper `select` / `include` — don't fetch entire records when you only need a few fields
