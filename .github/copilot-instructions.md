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
