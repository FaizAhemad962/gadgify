# ARCHITECTURE_ANALYSIS - Gadgify

Audit date: 2026-06-10

## Executive Assessment

The project has a workable modular-monolith foundation, but it is not ready for a production e-commerce launch. The primary blockers are cross-site cookie authentication without CSRF protection, non-transactional order/payment/inventory logic, inconsistent authorization boundaries, unreliable token revocation, and a deployment pipeline that neither tests nor migrates the production database.

## Current Architecture

### Frontend

- One React SPA serves public, account, and admin experiences.
- Route components use `React.lazy`, but shared imports still produce large chunks.
- Seven global context providers wrap the route tree. Their provider values are generally recreated each render, broadening update propagation.
- React Query and local context both manage server-related state, creating duplicated lifecycle logic.
- Authentication initially trusts cached user/role data from `localStorage`, then verifies `/auth/profile`.

### Backend

- Express routes usually invoke controllers directly. The documented Route -> Controller -> Service -> Prisma rule is not consistently implemented.
- Authentication middleware verifies JWT, checks a blacklist, then queries the user on every protected request.
- Controllers combine validation, authorization, business rules, persistence, email, and payment orchestration.
- Product queries compute ratings, sorting, filtering, and pagination in application memory.
- Order creation and payment confirmation perform multiple writes without database transactions.

### Infrastructure

- GitHub Actions builds and deploys both apps to Azure on every push to `main`.
- No staging gate, approval, deployment slot, explicit migration, smoke test, rollback, or artifact promotion is present.
- Frontend configuration includes both Azure IIS and Vercel deployment files.
- Media storage assumes `/var/data/uploads` in production, which appears inherited from Render rather than Azure.

## Architecture Findings

### A1. Cookie authentication lacks a CSRF trust boundary

- **Impact: Critical**
- **Problem:** `authToken` may use `SameSite=None`, while CSRF middleware and token issuance were removed.
- **Root cause:** CORS is treated as CSRF protection. Browsers can send cross-site cookies on forged form/navigation requests even when the attacker cannot read the response.
- **Recommendation:** Prefer same-site subdomains and host-only cookies. Validate `Origin` on every unsafe request and add a cryptographic CSRF token tied to the session.
- **Example:** Reject `POST`, `PUT`, `PATCH`, and `DELETE` unless `Origin` is in the exact allow-list and `X-CSRF-Token` matches a server-issued value.

### A2. Authorization policy is fragmented

- **Impact: Critical**
- **Problem:** `/api/admin` grants all ADMIN and SUPER_ADMIN users access to user role changes and deletion. UI restrictions do not protect APIs. Some order checks recognize `ADMIN` but not `SUPER_ADMIN`.
- **Root cause:** Coarse router-level role checks plus controller-specific exceptions.
- **Recommendation:** Define named permissions and enforce them per endpoint. Reserve user/role administration for SUPER_ADMIN or explicitly delegated permissions.
- **Example:** `requirePermission("users.roles.update")` rather than `authorize("ADMIN", "SUPER_ADMIN")`.

### A3. Order and payment state changes are non-transactional

- **Impact: Critical**
- **Problem:** Coupon usage, order creation, cart clearing, payment state, and stock decrement occur in separate operations. Repeated payment confirmation can decrement stock more than once.
- **Root cause:** No transaction, idempotency key, payment-event table, stock reservation, or conditional state transition.
- **Recommendation:** Recompute prices server-side and execute state transitions in a serializable transaction. Use provider webhooks as the durable payment authority and enforce unique payment event IDs.
- **Example:** Update an order only where `paymentStatus = PENDING`; if zero rows update, treat the confirmation as already processed.

### A4. Client controls order prices

- **Impact: Critical**
- **Problem:** Order creation accepts `subtotal`, `shipping`, `total`, and item `price` from the request. Products are fetched for stock but server prices are not used to construct order items.
- **Root cause:** The frontend calculation is treated as authoritative.
- **Recommendation:** Accept only product IDs, quantities, address ID, and coupon code. Load product prices and shipping rules on the server and calculate the payable total there.

### A5. Session revocation is fail-open and not durable

- **Impact: High**
- **Problem:** The `redis` package is absent, configuration falls back to process memory, blacklist checks return `false` on errors, and logout uses a hard-coded 24-hour blacklist TTL.
- **Root cause:** Optional infrastructure is used for a security guarantee.
- **Recommendation:** Make Redis mandatory in production, store a JWT `jti`, calculate TTL from token `exp`, and fail closed for sensitive/admin APIs. Prefer short access tokens plus rotating refresh sessions.

### A6. Catalog pagination occurs after unbounded retrieval

- **Impact: High**
- **Problem:** The API loads all matching products, all ratings, and media, then calculates, sorts, filters, and slices in Node.
- **Root cause:** Derived rating/popularity data is not modeled for database querying.
- **Recommendation:** Store aggregate rating/count fields or query aggregates, add indexes, and paginate in PostgreSQL with bounded `take`/`skip` or cursor pagination.

### A7. Media architecture cannot scale horizontally

- **Impact: High**
- **Problem:** Uploaded media is written to the API filesystem and served by Express.
- **Root cause:** Development storage became production storage.
- **Recommendation:** Upload to Azure Blob/S3-compatible storage, process images asynchronously, serve immutable variants through a CDN, and store metadata in PostgreSQL.

### A8. Repository and documentation are not a reliable source of truth

- **Impact: Medium**
- **Problem:** Generated backend `dist`, `dev.db`, sample uploads, screenshots, and numerous overlapping audit/status documents are tracked.
- **Root cause:** Build artifacts and operational history are mixed with source.
- **Recommendation:** Remove generated/runtime artifacts from version control after preserving required samples elsewhere. Consolidate current architecture and runbooks under `docs/`.

## Recommended Target Architecture

```text
Azure Front Door/CDN
  +-- Static SPA
  +-- /api -> Express modular monolith
                +-- PostgreSQL
                +-- Mandatory Redis
                +-- Blob Storage/CDN
                +-- Queue/worker for email and media
                +-- Razorpay/Stripe webhooks
                +-- OpenTelemetry/Application Insights
```

Keep one backend deployment initially, but divide code by business domain (`auth`, `catalog`, `cart`, `orders`, `payments`, `admin`, `delivery`) with route, schema, service, repository, and tests colocated. Do not introduce microservices until independent scaling or ownership justifies them.

## Scalability Roadmap

1. **Launch foundation:** CSRF, authorization, server-priced transactional checkout, durable sessions, migrations, staging, monitoring.
2. **Performance:** database pagination/aggregates, object storage/CDN, image variants, frontend bundle budgets and virtualization.
3. **Reliability:** webhook reconciliation, background jobs, idempotency, inventory reservation, backup/restore drills.
4. **Expansion:** configurable service areas, tax/shipping providers, multi-warehouse inventory, search service when PostgreSQL search is insufficient.
