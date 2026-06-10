# PROJECT_CONTEXT - Gadgify

Audit date: 2026-06-10

## Business Goals

Gadgify is a personal e-commerce platform for selling owned inventory. The current business rules target Maharashtra, India, but the public application should be engineered so geography, catalog size, traffic, fulfillment, and staff roles can expand without weakening security or reliability.

Primary goals:

- Provide a fast, professional storefront on mobile and desktop.
- Support product discovery, cart, checkout, payment, order history, and account management.
- Provide controlled administration for products, orders, coupons, categories, users, roles, and delivery operations.
- Support English, Hindi, and Marathi.
- Protect customer PII, credentials, sessions, payments, and administrative actions.

## Current Architecture

```text
Browser React SPA (Azure App Service in current CI)
        |
        | HTTPS REST + credentialed cookies
        v
Express 5 API (Azure App Service in current CI)
        |
        +--> PostgreSQL through Prisma
        +--> Razorpay / Stripe configuration
        +--> Resend/email services
        +--> Local or persistent-disk media storage
        +--> Optional Redis-like token blacklist
```

The frontend is a Vite/React SPA. Routes are lazy-loaded, React Query manages server state, MUI provides UI components, and Axios sends `authToken` cookies using `withCredentials`.

The backend is an Express monolith. Routes usually call controllers directly; only some domains use services. Prisma accesses PostgreSQL. Authentication uses a signed JWT in an HttpOnly cookie, with an Authorization-header fallback.

## Main User Flows

1. Anonymous user browses/searches products and categories.
2. User signs up with Maharashtra address validation and receives a login cookie before email verification.
3. User logs in, loads profile, cart, and wishlist, then checks out.
4. Backend creates an order and Razorpay payment order; frontend completes payment.
5. Backend verifies the Razorpay signature and marks the order paid.
6. User reviews orders, profile, addresses, ratings, and wishlist.
7. Admin manages catalog, orders, coupons, categories, users, and delivery.

## Key Modules

- Frontend: `src/pages`, `src/components`, `src/context`, `src/api`, `src/hooks`.
- Backend: `src/routes`, `src/controllers`, `src/services`, `src/middlewares`, `src/utils`.
- Data: `backend/prisma/schema.prisma` and migrations.
- Delivery: `.github/workflows/ci.yaml`, `frontend/web.config`, `frontend/vercel.json`.
- Media: backend filesystem uploads exposed at `/uploads`.

## Technology Stack

- React 19, TypeScript 5.9, Vite 7, React Router 7.
- MUI 7, Emotion, Swiper, Recharts, jsPDF, Stripe browser SDK.
- TanStack React Query, React Hook Form, Zod, i18next.
- Node.js, Express 5, Prisma 5, PostgreSQL.
- JWT, bcrypt, Helmet, CORS, express-rate-limit, Multer, Winston.
- Razorpay, Stripe configuration, Resend.
- GitHub Actions and Azure Web Apps in the active pipeline.

## Business and Technical Constraints

- Location validation currently enforces Maharashtra for signup/orders. Broader sales require configurable service areas, tax, shipping, currency, legal, and fulfillment rules rather than removing validation ad hoc.
- The frontend and API currently appear intended to use different hosts. Cross-site cookies require `SameSite=None; Secure`, explicit CORS, and CSRF protection.
- Media is stored on the API filesystem. This does not scale safely across instances and conflicts with the hard-coded production path `/var/data/uploads` when Azure is the deployment target.
- The repository contains generated builds, a development database, sample uploads, screenshots, and many historical documents. This increases repository size and creates source-of-truth ambiguity.

## Future Vision

Recommended evolution:

1. Keep a modular monolith while the business is small.
2. Put frontend and API under one site boundary, for example `www.example.com` and `api.example.com`.
3. Move media to object storage plus CDN.
4. Add durable Redis, background jobs, payment webhooks, and transactional order processing.
5. Add staging, migration gates, observability, backups, and tested rollback.
6. Model service areas, shipping, tax, inventory reservations, and payment events explicitly.

## Audit Boundaries

This audit reviewed repository source, tracked files, environment-variable names, Prisma schema/migrations, CI, Azure/Vercel/IIS configuration, generated bundle artifacts, and available build/lint/test commands. It did not inspect live Azure, DNS, PostgreSQL, Redis, Razorpay, Stripe, or browser production traces, so live cookie headers and Core Web Vitals remain to be measured in staging.
