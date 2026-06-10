# Conversation History — Gadgify Auth & Env Changes

Date: 2026-06-10

## Summary

This document tracks the work and decisions made during the session about CSRF, cookie-based auth, environment setup, and related frontend/backend fixes.

## Objectives

- Remove client-managed CSRF token and move to secure httpOnly cookie auth (Option A: keep cookie auth).
- Standardize dev / prod environment files for frontend and backend.
- Fix production login/logout and cookie flags for cross-domain (Vercel frontend, Azure backend).
- Remove insecure `Authorization: Bearer` usage from frontend localStorage token calls.

## Current Issue

- **Authentication instability in production:** Login/logout behave inconsistently — cookies sometimes are not sent or not cleared, causing unexpected login states for users.
- **Cross-domain cookie requirements:** Frontend is hosted on Vercel and backend on Azure; production requires `SameSite=None; Secure` plus CORS configured with `credentials: true` to allow the browser to send `authToken` cookies.
- **Legacy token usage lingering:** Some components previously used `localStorage` tokens and manual `Authorization` headers; most were removed but a search/cleanup verification is recommended.
- **CSRF removal impact:** CSRF token endpoints were removed in favor of httpOnly cookies; confirm that removing CSRF headers does not break any client workflows.
- **Immediate next steps:** Verify `COOKIE_DOMAIN` and `CROSS_DOMAIN_COOKIES` values in production, run a staging test with Vercel + Azure, and confirm cookie behavior in browser network tools.

## Major Changes Implemented

- Frontend
  - Enabled cross-origin cookie support via axios: `withCredentials: true` in `frontend/src/api/client.ts`.
  - Removed CSRF header attachment in request interceptor (CSRF flow simplified).
  - Auth state: token stored in `httpOnly` cookie; frontend stores only user data in `localStorage` for UI display.
  - Replaced direct `Authorization: Bearer ${localStorage.getItem("token")}` usages with cookie-based API calls in:
    - `frontend/src/components/orders/PendingOrderCard.tsx` (migrated to `apiClient` mutation calls)
    - `frontend/src/components/admin/ChangeRoleDialog.tsx` (migrated to `apiClient`/React-Query hooks)
  - Confirmed remaining API wrappers use `withCredentials: true` (e.g., `authApi`, `orderAPI`, `roleChangeAPI`).

- Backend
  - Environment loading updated to support `.env` + `.env.${NODE_ENV}` in `backend/src/config/index.ts`.
  - Cookie helper (`backend/src/utils/cookieHelper.ts`) added/updated to set `authToken` cookie with:
    - `httpOnly: true`
    - `sameSite: none` when cross-domain (configurable)
    - `secure: true` when using `SameSite=None` or in production
    - optional `domain` via `COOKIE_DOMAIN` config
  - Auth middleware (`backend/src/middlewares/auth.ts`) reads token from `req.cookies.authToken` first, falls back to `Authorization` header.
  - CSRF token endpoints/requirements removed — server now relies on httpOnly cookie auth.
  - CORS is configured to allow `config.frontendUrl` and `credentials: true` in `backend/src/server.ts`.
  - Added `crossDomainCookies` config flag and set `CROSS_DOMAIN_COOKIES=true` in `backend/.env.production`.

## Files Created / Edited

- Created/edited env files:
  - `frontend/.env.development`, `frontend/.env.production`, `.env.example` (templates and gitignore updates)
  - `backend/.env.development`, `backend/.env.production`, `.env.example` (templates)
- Edited code:
  - `backend/src/config/index.ts` (env loader & new flag `crossDomainCookies`)
  - `backend/src/utils/cookieHelper.ts` (setAuthCookie / clearAuthCookie)
  - `backend/src/middlewares/auth.ts` (cookie-first auth)
  - `frontend/src/api/client.ts` (axios client withCredentials + removed CSRF header)
  - `frontend/src/api/auth.ts` (login/signup/profile/logout use withCredentials)
  - `frontend/src/components/orders/PendingOrderCard.tsx` (removed direct Authorization header usage)
  - `frontend/src/components/admin/ChangeRoleDialog.tsx` (removed direct Authorization header usage)

## Rationale & Notes

- Using `httpOnly` cookies improves security by preventing JS access to tokens and centralizing auth token management.
- Cross-domain cookies require `SameSite=None; Secure` and `CORS` configured with `credentials: true`. For Vercel (frontend) + Azure (backend) this is required.
- Backend still accepts `Authorization` header as a fallback for API/mobile clients.
- Some legacy localStorage usage remains for UI-only data (e.g., `user`), but `token` reads were removed.

## How to Verify (Quick checks)

1. Start backend and frontend locally with dev environment files.
2. Login from frontend and inspect network tab:
   - Login response should set `Set-Cookie: authToken=...; HttpOnly; SameSite=...; Secure` (in production use SameSite=None and Secure).
   - Subsequent protected API requests must include the `Cookie` header and succeed (axios has `withCredentials: true`).
3. Logout should call `/api/auth/logout` and server should clear cookie via `Set-Cookie` with expiry.

## Remaining / Next Tasks

- Confirm `COOKIE_DOMAIN` value for production Azure host to scope cookie domain correctly (optional but recommended).
- Run a staging test with Vercel frontend + Azure backend to validate cross-domain cookie behavior and SameSite flags.
- Verify any remaining direct `Authorization` usages in other components (search completed; current scan shows key places were fixed).

## Conversation Context (timeline)

- Discussed removing CSRF token and cookies initially.
- Implemented environment file standardization for frontend and backend.
- Migrated auth flow to httpOnly cookie and removed CSRF endpoints.
- Fixed frontend components to stop using localStorage token for Authorization and to use `apiClient` withCredentials calls.
- Finalized cookie production flags and CORS config.

---

If you want this file moved to a different path or extended with the full chat transcript, tell me and I will append it.
