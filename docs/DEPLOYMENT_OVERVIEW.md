# Deployment — Gadgify

Targets

- Frontend: Vercel (recommended)
- Backend: Azure App Service / Azure Web Apps (recommended)
- Database: Azure Database for PostgreSQL or other managed provider

Environment configuration

- Keep secrets out of source control; use each platform's secret/env manager.
- `frontend`: Vite uses `VITE_*` env variables for build-time values.
- `backend`: provide `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `RAZORPAY_*`, `FRONTEND_URL`, `CROSS_DOMAIN_COOKIES`, and optionally `COOKIE_DOMAIN`.

CORS & cookies

- Backend CORS must allow the frontend origin and set `credentials: true`.
- For cross-domain cookies (Vercel frontend, Azure backend), set `CROSS_DOMAIN_COOKIES=true` in backend env and ensure cookies use `SameSite=None; Secure`.
- If using a custom domain and subdomains, configure `COOKIE_DOMAIN` carefully (e.g., `gadgify.com`).

CI/CD

- Frontend: auto-deploy from `main` branch on Vercel; set env vars in Vercel dashboard.
- Backend: use GitHub Actions or Azure Pipelines to build and deploy the backend; set production env vars in Azure configuration.

Staging checklist (quick)

1. Deploy backend to a staging slot with `CROSS_DOMAIN_COOKIES=true` and `FRONTEND_URL` set to staging frontend URL.
2. Deploy frontend to staging (Vercel preview) with env pointing to staging backend.
3. Login from frontend and confirm `Set-Cookie` header, then confirm subsequent requests include `Cookie` header.
4. Test logout clears cookie and returns 401 on protected endpoints.

Rollback & monitoring

- Add health checks and Application Insights or another APM for backend.
- Use database backups and deployment slots for safe rollbacks.
