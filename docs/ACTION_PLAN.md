# ACTION_PLAN - Gadgify Production Readiness

Audit date: 2026-06-10

## Critical - Fix Immediately

### 1. Restore request-forgery protection

- Add exact `Origin` validation for unsafe methods.
- Add and test a cryptographic CSRF token flow.
- Prefer `www.<domain>` plus `api.<domain>` and a host-only `__Host-authToken` cookie.
- Verify login, persistence, logout, expiry, invalid token, multiple tabs, and cross-origin rejection in staging.

### 2. Make checkout server-authoritative and transactional

- Accept product IDs/quantities, address, and coupon only.
- Recalculate price, shipping, tax, discount, and total on the server.
- Create order/coupon reservation atomically.
- Confirm payment idempotently in a transaction and reconcile using signed Razorpay/Stripe webhooks.
- Add concurrency tests for duplicate confirmations and last-item stock.

### 3. Repair authorization

- Define endpoint permissions and a role hierarchy.
- Restrict user role/deletion operations to SUPER_ADMIN or explicit grants.
- Prevent users from modifying accounts with equal/higher privileges.
- Add integration tests covering every protected route for USER, staff, ADMIN, and SUPER_ADMIN.

### 4. Establish durable session security

- Install/configure Redis as mandatory production infrastructure or replace blacklist JWTs with database-backed rotating sessions.
- Add `jti`, derive revocation TTL from `exp`, and revoke sessions after password changes.
- Reject weak production secrets and rotate any deployed secret derived from local examples.

## High Priority

### 5. Fix frontend performance blockers

- Replace the 2.25 MB logo and optimize all product media.
- Correct cache headers for `index.html` versus hashed assets.
- Paginate catalog/order queries in PostgreSQL.
- Virtualize or paginate the product DOM.
- Dynamically load PDF, charts, DataGrid, Stripe/Razorpay, and admin-only features.
- Remove whole-page route animation and isolate the homepage timer.

### 6. Make CI/CD a release pipeline

- Run frontend lint, tests, build, backend tests/build, secret scan, dependency audit, and Prisma validation before deploy.
- Produce immutable artifacts once and promote the same artifacts.
- Run `prisma migrate deploy` through a reviewed, backed-up release step.
- Deploy to staging/slot, run smoke tests, then require approval/swap.
- Normalize Azure app names and remove misleading "migrations applied automatically" output.

### 7. Move media out of the API filesystem

- Use Azure Blob Storage and CDN.
- Validate MIME and magic bytes while streaming; do not synchronously read entire large uploads.
- Generate image variants and video posters/transcodes asynchronously.
- Add retention/orphan cleanup.

### 8. Add production observability

- Add request IDs, structured stdout logs, OpenTelemetry/Application Insights, frontend error reporting, and Web Vitals RUM.
- Alert on 5xx rate, auth failures, payment mismatch, webhook failures, DB/Redis readiness, p95 latency, and low stock.
- Redact email, tokens, cookies, addresses, payment IDs, and request bodies.

## Medium Priority

### 9. Refactor by domain

- Create domain modules for auth, catalog, cart, orders, payments, users/admin, and delivery.
- Move business logic from controllers to tested services.
- Add typed validation for params/query/body and cap all list inputs.
- Consolidate duplicate frontend API/state logic.

### 10. Strengthen data and operations

- Add indexes for product category/price/createdAt and order user/status/createdAt based on measured queries.
- Use decimal/integer minor units instead of floating-point money.
- Add soft-delete/session checks consistently.
- Configure automated database backups and perform restore drills.
- Add liveness/readiness endpoints and graceful shutdown.

### 11. Clean repository and configuration

- Stop tracking generated `backend/dist`, development DB, runtime uploads, and nonessential screenshots.
- Add a root `.gitignore` and secret-history review.
- Consolidate overlapping documents and state the single hosting topology.
- Maintain complete `.env.example` files with schema validation and no secrets.

## Nice to Have

- SSR/pre-rendering for catalog SEO after security/performance stabilization.
- Search service when PostgreSQL search no longer meets measured needs.
- Feature flags with audited rollout.
- Accessibility automation and visual regression tests.
- Configurable service-area, tax, shipping, and multi-warehouse modules.

## Suggested Delivery Sequence

### Week 1: Launch blockers

1. CSRF/origin controls and cookie tests.
2. Server-priced transactional/idempotent checkout.
3. Authorization matrix.
4. Durable sessions and production secret validation.

### Week 2: Stability and speed

1. Product/order DB pagination.
2. Logo/media optimization and frontend caching.
3. Catalog virtualization and heavy-module lazy loading.
4. CI quality gates, migrations, staging, and smoke tests.

### Week 3: Operations

1. Blob/CDN migration.
2. Observability and alerts.
3. Backup/restore and rollback drills.
4. Domain refactor and expanded integration tests.

## Production Go/No-Go Criteria

- All Critical findings are fixed and integration-tested.
- A manipulated checkout payload cannot alter payable totals.
- Duplicate payment events do not duplicate stock/payment transitions.
- Cross-origin unsafe requests are rejected.
- Role matrix tests prove least privilege.
- Logout/password reset revoke sessions across instances.
- CI blocks lint/test/build/migration failures.
- Staging deploy, migration, smoke test, and rollback are demonstrated.
- No secrets or customer data are present in tracked runtime artifacts.
- p75 mobile LCP/INP/CLS and API p95 targets are measured and accepted.
