# Vercel Monorepo Audit

Date: 2026-08-09

This note compares the current Gadgify repo layout and Vercel configuration against the current Vercel documentation for monorepos, `vercel.json`, rewrites, and project configuration.

## What Vercel Docs Say

- Monorepos are usually deployed as separate Vercel projects, one per app directory.
- Each project should use its own Root Directory in the Vercel dashboard.
- `vercel.json` must live in the project root that Vercel is building.
- `rewrites` and `routes` are valid configuration tools, but `rewrites` is the simpler option for common proxy cases.
- If a project uses file-based config, the repo config is the source of truth for that deployment shape.
- When hosting multiple apps under one domain, Vercel recommends separate upstream projects and proxying between them rather than forcing a single build to behave like two apps.

Sources:
- https://vercel.com/docs/monorepos
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/routing/rewrites
- https://vercel.com/docs/monorepos/monorepo-faq

## Repo Layout Observed

Top-level structure relevant to Vercel:

- `frontend/` contains the Vite React app
- `backend/` contains the Express + Prisma API
- root `vercel.json` exists
- `frontend/vercel.json` exists
- `backend/vercel.json` exists
- `backend/api/vercel.js` exists
- `backend/api/vercel.ts` exists
- there is no root `package.json`

Current Vercel link metadata:

- `.vercel/project.json` links project `learn-deployment`
- `.vercel/repo.json` still records the project directory as `frontend`

Current deployment shape after the cleanup:

- root `vercel.json` now uses Vercel `services`
- nested `frontend/vercel.json` and `backend/vercel.json` were removed
- the backend is intended to run from `backend/src/server.ts`

## Config Files Reviewed

- [root `vercel.json`](./vercel.json)
- [frontend `vercel.json`](./frontend/vercel.json)
- [backend `vercel.json`](./backend/vercel.json)
- [backend `package.json`](./backend/package.json)
- [frontend `package.json`](./frontend/package.json)
- [backend/api/vercel.js`](./backend/api/vercel.js)
- [backend/api/vercel.ts`](./backend/api/vercel.ts)
- [backend/src/server.ts`](./backend/src/server.ts)
- [backend/src/config/index.ts`](./backend/src/config/index.ts)
- [backend/src/config/database.ts`](./backend/src/config/database.ts)
- [backend/src/config/redis.ts`](./backend/src/config/redis.ts)

## Known Good

- The frontend is a normal Vite app and has a valid `frontend/package.json` build script.
- The backend is a normal Express/Prisma app and has a valid backend `package.json`.
- The backend entrypoint has Vercel-specific handling in `backend/api/vercel.js` and `backend/api/vercel.ts`.
- `backend/src/server.ts` has a cheap `/api/ping` route that does not require DB work.
- `backend/src/config/index.ts` maps the Vercel/Postgres env aliases to `DATABASE_URL`.
- `backend/src/config/database.ts` adds a timeout guard for Prisma queries on Vercel.
- `frontend/src/api/client.ts` uses `VITE_API_URL` and defaults to localhost in development.

## Known Mismatches

- The `.vercel/repo.json` metadata may still reflect an older root-directory link and should be refreshed or re-linked if Vercel CLI keeps using stale project metadata.
- `backend/api/vercel.js` and `backend/api/vercel.ts` are now legacy wrappers and are no longer the documented entrypoint for the backend service.
- The GitHub Actions workflow in `.github/workflows/ci.yaml` is Azure deployment logic, not Vercel deployment logic.

## Important Unknowns

- I cannot confirm the current Vercel dashboard settings from files alone.
- I cannot confirm whether Deployment Protection is enabled on the live deployment.
- I cannot confirm whether the current Vercel project is building from the repo root or from `frontend`.
- I cannot confirm whether the live deployment is still using an older build artifact rather than the current repo state.
- I cannot confirm whether you want one Vercel project for both apps or two separate Vercel projects.

## Current Diagnosis

The repo is now much closer to the documented one-project Services pattern.

The most likely workable options are:

1. One Vercel project using Services
   - frontend service at `frontend/`
   - backend service at `backend/`
   - public traffic routed by top-level rewrites

2. Separate Vercel projects
   - one project for `frontend`
   - one project for `backend`
   - not needed if Services is available and enabled

## Recommendation

For this repository, the documented Vercel-native approach for a single shared domain is now the Services model:

- set the project framework to `Services` in the Vercel dashboard
- keep the root `vercel.json` services configuration
- route `/api/*` to the backend service
- route everything else to the frontend service

That is the least ambiguous path because:

- it matches the Vercel monorepo docs
- it avoids path rewriting between nested folders
- it avoids the current `GET /` vs `/api/...` confusion
- it keeps frontend and backend deployments independent

## Action Items

- In Vercel dashboard, set the project framework to `Services`.
- Redeploy from the repo root.
- Verify the current Vercel dashboard Root Directory is not pinned to `frontend`.
- Verify Deployment Protection is not blocking public traffic.

## Practical Verdict

If the question is "is the current app already set up according to Vercel docs?", the answer is now closer to yes, but it still depends on the dashboard framework setting being switched to `Services`.

If the question is "can it be made to work on Vercel without splitting into two projects?", the answer is yes, and the Services model is the right fit.
