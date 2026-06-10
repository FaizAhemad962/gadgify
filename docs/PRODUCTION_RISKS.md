# PRODUCTION_RISKS - Gadgify

Audit date: 2026-06-10

## Launch Decision

**No-go for production commerce until all Critical items are fixed and tested in staging.**

## Critical

| Issue | Problem and root cause | Production impact | Recommended solution |
|---|---|---|---|
| CSRF on cookie-authenticated APIs | CSRF was removed in `backend/src/server.ts`; cross-site mode sets `SameSite=None` in `cookieHelper.ts`. | A malicious site can submit authenticated state-changing requests. CORS does not prevent the browser from sending them. | Add exact Origin/Referer enforcement and a CSRF token for unsafe methods. Prefer same-site frontend/API hosts. |
| Client-authoritative order pricing | `createOrder` accepts item price, subtotal, shipping, and total from the browser. | Price manipulation, incorrect tax/shipping, coupon abuse, financial loss. | Recalculate every amount from server product and configuration data; reject stale/unavailable items. |
| Non-idempotent payment confirmation | Payment status and stock are updated in separate statements without a conditional transition/transaction. | Duplicate confirmation can double-decrement stock; partial failures leave paid orders inconsistent. | Use a DB transaction, unique payment event, conditional `PENDING -> COMPLETED` transition, webhook reconciliation, and idempotency. |
| Admin privilege boundary is too broad | `adminRoutes.ts` applies ADMIN/SUPER_ADMIN to all user-management endpoints; role update/delete controllers lack a SUPER_ADMIN-only guard. | ADMIN can alter or remove higher-privileged accounts through the API. | Add endpoint-level permissions and prevent modifying equal/higher roles. Test every role/resource matrix. |

## High

| Issue | Problem and root cause | Production impact | Recommended solution |
|---|---|---|---|
| Revocation silently degrades | Redis package is not installed; production can fall back to process memory; blacklist errors permit authentication. | Logout/revocation fails across instances or restarts. | Require Redis in production, health-check it, use JWT `jti` and `exp`, and define fail-closed behavior for privileged APIs. |
| Weak local secret and incomplete env contract | Local backend `.env` contains `JWT_SECRET="secret"`; production validation warns rather than rejects short secrets. Required Redis/cookie/email variables are absent from `.env.example`. | Accidental weak signing key, environment drift, startup surprises. | Rotate any reused key, reject secrets under 32 random bytes in production, and maintain a complete schema-validated env contract. |
| Unverified account receives session | Signup immediately issues an auth cookie while `emailVerified=false`; enforcement is not centralized. | Unverified identities may use account/order features depending on endpoint behavior. | Either withhold a full session until verification or enforce verified-email policy centrally for sensitive operations. |
| Account lockout is per process and email-only | Failed attempts use an in-memory `Map`; the rate-limit key is user-supplied email without IP/device dimension. | Multi-instance bypass and targeted denial of service against known emails. | Store counters in Redis and combine normalized account, IP, and progressive delays without permanent account lockout. |
| Frontend trusts `localStorage` identity before verification | `AuthContext` initializes user and role from writable browser storage; routes ignore `authChecked`. | Stale/forged admin UI exposure, redirect flicker, incorrect persistence behavior. | Initialize as unknown/loading, fetch `/auth/profile`, then render protected routes. Keep only non-authoritative display preferences in storage. |
| Deployment does not run migrations | CI claims migrations are automatic but only runs `prisma generate`. | New code may start against an old schema and fail at runtime. | Run reviewed `prisma migrate deploy` as a controlled release step with backup and rollback strategy. |
| Deploy starts on every push to main without quality gate | Deploy jobs need only build; lint/tests are absent. | Known lint/test regressions can reach production. | Separate CI and CD; require lint, unit/integration tests, migration validation, artifact scan, approval, deploy, and smoke test. |
| Production media path is platform-specific | Production writes `/var/data/uploads`, while active CI deploys Azure App Service. | Upload failure, data loss on redeploy, or inconsistent files across instances. | Use Blob Storage and CDN. Validate storage at startup. |
| Static cache header applies to all frontend files | `web.config` adds one-week immutable caching globally, potentially including `index.html`. | Clients can remain pinned to an obsolete asset manifest after deployment. | `no-cache`/short cache for HTML; one-year immutable only for hashed assets. |

## Medium

| Issue | Problem and root cause | Production impact | Recommended solution |
|---|---|---|---|
| CSP permits inline script/style | Helmet allows `'unsafe-inline'`; policy is API-hosted and does not protect the separately hosted SPA. | Reduced XSS containment. | Set CSP at the frontend host; remove unsafe script directives using nonces/hashes. |
| `trust proxy = 1` is unconditional | Proxy chain is assumed rather than configured per environment. | Incorrect client IPs and rate-limit bypass/misattribution under a different proxy topology. | Configure trusted proxies explicitly for Azure and test forwarded headers. |
| Public GET endpoints are not rate limited | General limiter skips every GET. | Search/catalog scraping and expensive-query denial of service. | Add separate read/search limits and caching; cap all pagination/filter inputs. |
| Logout TTL is hard-coded | Blacklist TTL is 24 hours regardless of `JWT_EXPIRES_IN`. | Revocation may expire before JWT or retain data too long. | Decode `exp` and use remaining lifetime. |
| Password changes do not revoke existing sessions | JWT has no password/session version check. | Stolen sessions remain valid after reset/change. | Increment a session version or revoke all refresh sessions on password change/reset. |
| Sensitive runtime artifacts are tracked | Generated `dist`, `dev.db`, sample uploads, and screenshots are in Git. | Repository growth, accidental PII/media exposure, stale deployment artifacts. | Purge unnecessary artifacts and add root-level ignore rules. Review history before making repository public. |
| Duplicate route registration | `/api/cart` is mounted twice in `server.ts`. | Confusing middleware behavior and maintenance risk. | Remove duplicate registration and add route smoke tests. |
| Error/status logging leaks into browser console | Axios interceptor logs status and complete response objects. | PII/debug information may be exposed to users and support captures. | Remove production console logs; send scrubbed telemetry through an observability client. |
| No graceful HTTP shutdown | Prisma handles signals, but the HTTP listener is not closed/drained. | Requests can be terminated during deploy. | Keep the server handle, stop accepting traffic, drain, disconnect dependencies, then exit. |

## Configuration and Deployment Findings

- Active CI deploys both apps to Azure, while `frontend/vercel.json` and several documents describe Vercel.
- Backend app name and health URL use `gaddgify`, while frontend uses `gadgify`.
- `AZURE_CLIENT_SECRET` is placed in an environment block while OIDC permissions are enabled; choose one supported authentication method.
- Backend deployment copies development dependencies and generated artifacts rather than installing production-only dependencies from a promoted artifact.
- No Docker or reverse-proxy configuration exists beyond IIS `web.config`.
- No dependency vulnerability scan, secret scan, SAST, SBOM, or artifact integrity step exists.
- The health endpoint reveals database state and uptime publicly and performs a database query on every request.

## Security Header and Cookie Checklist

- `HttpOnly`: present.
- `Secure`: present in production/cross-site mode.
- `SameSite`: `Lax` or `None`; `None` is unsafe without CSRF controls.
- `Path`: `/`, broader than necessary but expected for API-wide auth.
- `Domain`: optional; prefer no Domain attribute (host-only). Never use a parent domain unless required.
- Expiration: one-day `Max-Age`; must derive from the actual token/session policy.
- Cookie prefix: consider `__Host-authToken` when no Domain is used, with Secure and Path `/`.
- Refresh: no refresh-token flow exists; user persistence ends when the JWT expires.
