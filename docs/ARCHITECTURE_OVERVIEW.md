# Architecture — Gadgify (End-to-End)

High-level flow

1. User opens frontend (Vercel) — static React app.
2. Frontend calls backend API (`/api/*`) using `axios` with `withCredentials: true`.
3. On login/signup, backend generates JWT and sets `Set-Cookie: authToken=...; HttpOnly; SameSite=...; Secure`.
4. Browser stores cookie (HttpOnly) and automatically sends it on subsequent requests to backend (if CORS and SameSite allow).
5. Backend `authenticate` middleware reads `req.cookies.authToken`, validates JWT, checks blacklist (Redis), then attaches `req.user`.
6. Controller uses services to perform operations; Prisma handles DB reads/writes.
7. For payments, backend creates orders with Razorpay/Stripe and returns payment data; frontend opens Razorpay or Stripe SDK.

Components

- Frontend: React + MUI + React Query
- Backend: Express controllers + services + Prisma
- DB: PostgreSQL; Redis used for token blacklist
- Auth: JWT in cookie (httpOnly). Fallback: Authorization header for mobile/legacy clients

Security considerations

- JWT secret strong and rotated when required
- httpOnly cookies to prevent XSS access
- SameSite/secure flags for cross-domain cookie usage
- CORS origin allow-list and `credentials: true`

Extensibility

- Add microservices if needed (payments, notifications)
- Add eventing for order lifecycle (webhooks) and background workers

Diagrams

- (Optional) Add system sequence and component diagrams in `docs/diagrams/` if needed.
