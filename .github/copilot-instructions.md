# Gadgify - Project Instructions

## Project Overview

Gadgify is a full-stack e-commerce platform for electronics in Maharashtra, India.

- **Frontend**: React 19 + MUI 7 + Vite 7 + TypeScript 5.9
- **Backend**: Express 5 + Prisma 5 + PostgreSQL + TypeScript 5.9
- **Payments**: Stripe + Razorpay
- **Auth**: JWT with httpOnly cookies, bcryptjs
- **i18n**: i18next (English, Marathi, Hindi)

## Architecture

- See [PROJECT_CONTEXT.md](.github/PROJECT_CONTEXT.md) for full architecture diagrams
- See [CODE_PATTERNS.md](.github/CODE_PATTERNS.md) for implementation examples

## Code Style

### Naming

- Components/Pages: PascalCase (`ProductCard.tsx`)
- Hooks: `use` prefix camelCase (`useCartItems.ts`)
- Utilities: camelCase (`formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Backend files: camelCase (`authController.ts`, `orderService.ts`)

### Frontend Patterns

- Use React Query for all API state (no manual useState for server data)
- Use React Hook Form + Zod for all forms
- Use `useTranslation()` hook—never hardcode user-facing strings
- Use MUI components—don't create custom components that duplicate MUI
- API calls go in `frontend/src/api/`, hooks in `frontend/src/hooks/`

### Backend Patterns

- Route → Controller → Service → Prisma (strict layering)
- Validate with Joi middleware before controller runs
- Use `authenticate` and `authorize('ADMIN')` middleware for protected routes
- Wrap async controllers: errors flow to global `errorHandler` middleware
- Return consistent response format: `{ success, message, data }`

## Commands

```bash
# Frontend: cd frontend
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Jest tests

# Backend: cd backend
npm run dev          # Dev server at localhost:5000
npm run build        # Compile TypeScript
npx prisma migrate dev --name <name>  # New migration
npx prisma studio    # DB GUI
npm run seed         # Seed test data
```

## Important Rules

- Maharashtra-only: validate state at signup and checkout
- Never store passwords in plain text—always bcryptjs
- Never expose JWT secrets or payment keys in frontend
- Always add i18n keys when adding user-facing text
- Always add Joi validation for new backend endpoints
- Use Prisma transactions for multi-step DB operations

## Marketplace Expansion Context

- Gadgify is expanding from home gadgets into a family marketplace
- Supported categories include: electronics, furniture, books, clothing (men/women/kids), footwear (shoes/slippers/sandals), and home gadgets
- Design all new catalog and filter features category-agnostic, not electronics-only

## Custom Copilot Assets (Priority)

When generating plans, reviews, or implementations, prioritize these workspace assets:

1. Instructions

- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/prisma.instructions.md`
- `.github/instructions/business-goals.instructions.md`
- `.github/instructions/delivery-support-readiness.instructions.md`

2. Roles

- `.github/roles/super-admin-owner.role.md`
- `.github/roles/admin-operations.role.md`
- `.github/roles/customer-family-vendor.role.md`
- `.github/roles/delivery-staff.role.md`
- `.github/roles/support-staff.role.md`

3. Plans

- `.github/plan/end-to-end.plan.md`
- `.github/plan/feature-gap.plan.md`

4. Skills

- `.github/skills/project-audit/SKILL.md`
- `.github/skills/feature-gap-execution/SKILL.md`

5. Agents and Prompts

- Agents: `.github/agents/*.agent.md`
- Prompts: `.github/prompts/*.prompt.md`

6. Reference Docs

- `.github/PROJECT_CONTEXT.md`
- `.github/CODE_PATTERNS.md`

If documentation claims conflict with code, trust current code evidence and report the mismatch clearly.
