# Backend — Gadgify

Purpose

- REST API for product/catalog, cart, orders, users, roles, and admin operations.

Core technologies

- Node.js, Express 5, TypeScript, Prisma 5, PostgreSQL
- Redis used for token blacklist and task caching (if configured)

Code structure & patterns

- Route → Controller → Service → Prisma (strict layering)
- Joi or similar request validation middleware before controllers
- `authenticate` + `authorize(role)` middleware for protected routes
- Global `errorHandler` middleware to standardize responses

Key files & folders

- `backend/src/server.ts` — Express app + CORS + middleware
- `backend/src/routes/` — route definitions
- `backend/src/controllers/` — request handlers
- `backend/src/services/` — business logic
- `backend/src/utils/` — helpers (cookieHelper, token blacklist)
- `backend/src/config/index.ts` — environment loader and config
- `backend/prisma/` — Prisma schema & migrations

Auth & cookies

- Auth token set in `authToken` httpOnly cookie via `setAuthCookie()` in `cookieHelper.ts`.
- `SameSite` behavior configurable via `CROSS_DOMAIN_COOKIES` in env.
- `authenticate` middleware reads cookie first and falls back to `Authorization` header.

Env & running

- Environment files: `.env`, `.env.development`, `.env.production`, `.env.example`
- Dev: `cd backend && npm run dev`
- Build: `npm run build`

Notes & production considerations

- `COOKIE_DOMAIN` can be set to scope the cookie to a parent domain; validate before setting.
- For Vercel + Azure, ensure backend CORS `origin` includes the Vercel URL and `credentials: true`.
- JWT secret must be strong (>=32 chars recommended) and stored in production env.

Useful files

- `backend/src/utils/cookieHelper.ts` — set/clear cookie logic
- `backend/src/middlewares/auth.ts` — token verification and blacklist check
- `backend/src/config/index.ts` — env variables and config flags
