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

- The monorepo is currently linked in Vercel metadata to `frontend`, which conflicts with the root-level combined `vercel.json`.
- The root `vercel.json` is trying to serve the frontend and proxy the backend inside one project. That is not the documented monorepo flow for separate frontend/backend projects.
- `backend/vercel.json` exists separately, which is only useful if `backend/` is deployed as its own Vercel project.
- `frontend/vercel.json` exists separately, which is only useful if `frontend/` is deployed as its own Vercel project.
- The presence of both `backend/api/vercel.js` and `backend/api/vercel.ts` means production must match the JS wrapper if Vercel is using the backend folder directly.
- The GitHub Actions workflow in `.github/workflows/ci.yaml` is Azure deployment logic, not Vercel deployment logic.

## Important Unknowns

- I cannot confirm the current Vercel dashboard settings from files alone.
- I cannot confirm whether Deployment Protection is enabled on the live deployment.
- I cannot confirm whether the current Vercel project is building from the repo root or from `frontend`.
- I cannot confirm whether the live deployment is still using an older build artifact rather than the current repo state.
- I cannot confirm whether you want one Vercel project for both apps or two separate Vercel projects.

## Current Diagnosis

The repo can be made to work on Vercel, but the current setup is not aligned with the documented monorepo pattern.

The most likely workable options are:

1. Separate Vercel projects
   - one project for `frontend`
   - one project for `backend`
   - proxy the frontend to the backend using a stable backend URL or related projects

2. Single Vercel project
   - frontend at the project root
   - backend moved to a root `api/` directory
   - avoid nested `backend/api/vercel.*` routing if possible

The current repository is closer to option 1 in structure, but the active root `vercel.json` is trying to behave like option 2.

## Recommendation

For this repository, the documented Vercel-native approach is to split the monorepo into separate projects and give each app its own Root Directory.

That is the least ambiguous path because:

- it matches the Vercel monorepo docs
- it avoids path rewriting between nested folders
- it avoids the current `GET /` vs `/api/...` confusion
- it keeps frontend and backend deployments independent

## Action Items

- Remove the combined root deployment shape if you want to follow the docs strictly.
- Decide whether the target deployment is:
  - one Vercel project
  - or two Vercel projects
- If using one Vercel project, move the backend to the root `api/` convention.
- If using two Vercel projects, create one Vercel project per app directory and remove the custom cross-folder routing pressure.
- Verify the current Vercel dashboard Root Directory and Deployment Protection settings.

## Practical Verdict

If the question is "is the current app already set up according to Vercel docs?", the answer is no.

If the question is "can it be made to work on Vercel?", the answer is yes, but the repo should be normalized to one of the documented patterns above rather than mixing both.
