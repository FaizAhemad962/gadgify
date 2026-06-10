# Gadgify — Project Overview

Short description

- Gadgify is a full-stack e-commerce platform focused on electronics and marketplace expansion for Maharashtra, India.

Primary goals

- Provide secure, localized e-commerce experience (EN, MR, HI).
- Support payments (Stripe, Razorpay) and JWT-based auth via httpOnly cookies.
- Follow strict backend layering (Route → Controller → Service → Prisma).

Tech stack

- Frontend: React 19, Vite, TypeScript, MUI 7, React Query, React Hook Form + Zod, i18next
- Backend: Node.js, Express 5, TypeScript, Prisma 5, PostgreSQL
- Auth: JWT in httpOnly cookies (cookie-first; Authorization header fallback)
- Payments: Stripe & Razorpay
- Deployment: Frontend on Vercel, Backend on Azure (recommended)

Repository layout (top-level)

- `frontend/` — React app (Vite)
- `backend/` — Express + TypeScript + Prisma
- `docs/` — documentation (this folder)
- `prisma/` — schema and migrations (under `backend/prisma/`)

Important conventions

- Frontend: use `api/` wrappers + React Query for server state; never store JWTs in JS-accessible storage.
- Backend: validate requests with Joi middleware; use `authenticate` and `authorize` middleware; global `errorHandler`.

Where to look first

- Frontend entry: `frontend/src/main.tsx` or `frontend/src/App.tsx`
- Backend entry: `backend/src/server.ts`
- Env and config: `backend/src/config/index.ts`, `frontend/.env.*`

Quick commands

- Frontend dev: `cd frontend && npm run dev`
- Backend dev: `cd backend && npm run dev`
- Prisma migrations: `npx prisma migrate dev --name <name>`

Contact / maintainers

- See repository `README.md` and `.github` instructions for roles, patterns, and plans.
