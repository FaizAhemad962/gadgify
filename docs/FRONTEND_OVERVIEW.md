# Frontend — Gadgify

Purpose

- Single-page React app (Vite) that serves the public storefront, account area, and admin UI.

Core technologies

- React 19, TypeScript, Vite, MUI 7
- State & server: React Query
- Forms: React Hook Form + Zod
- Internationalization: i18next (EN, MR, HI)
- HTTP: Axios wrapper in `frontend/src/api/client.ts` with `withCredentials: true` for cookie auth

Folder highlights

- `frontend/src/api/` — API clients used by React Query hooks
- `frontend/src/hooks/` — reusable hooks
- `frontend/src/components/` — UI components
- `frontend/src/context/AuthContext.tsx` — auth state; user stored in `localStorage` only for UI, token in httpOnly cookie
- `frontend/src/i18n/` — translation files

Auth & security

- Auth token is set as `authToken` httpOnly cookie by backend; frontend uses `axios` with `withCredentials`.
- CSRF token flow removed; backend relies on cookie + CORS protections.

Env & build

- Environment files: `.env.development`, `.env.production`, `.env.example` (use Vite vars `VITE_*` as needed)
- Dev: `npm run dev` (Vite)
- Build: `npm run build`

Testing & linting

- `npm run lint` (ESLint)
- `npm run test` (Jest, if present)

Notes & gotchas

- Avoid direct `localStorage` usage for tokens; search for `localStorage.getItem("token")` and replace with cookie-auth flow (most places updated).
- For production cross-domain cookies (Vercel frontend, Azure backend), ensure `SameSite=None; Secure` and `CORS` allows credentials.

Useful files

- `frontend/src/api/client.ts` — axios instance
- `frontend/src/context/AuthContext.tsx` — auth logic
- `frontend/src/pages/` — route pages
