# AI Development Instructions - Gadgify

This file provides comprehensive instructions for AI assistants to understand and work on the Gadgify project efficiently.

## Project Overview

**Gadgify** is a full-stack e-commerce platform exclusively for Maharashtra, India. It features:
- React 19 + Material UI frontend
- Node.js + Express.js backend
- PostgreSQL with Prisma ORM
- JWT authentication with role-based access
- Stripe payment integration
- Multi-language support (English, Marathi, Hindi)
- Admin dashboard for product and order management

## Tech Stack

### Frontend
- **Framework**: React 19 (latest)
- **Styling**: Material UI (MUI) 7.x + Emotion
- **State Management**: React Query (TanStack Query) 5.x
- **Routing**: React Router 7.x
- **Forms**: React Hook Form 7.x + Zod validation
- **Internationalization**: i18next 25.x + react-i18next
- **HTTP Client**: Axios 1.x
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.x
- **Authentication**: JWT (jsonwebtoken 9.x)
- **Password Hashing**: bcryptjs 3.x
- **Validation**: Joi 18.x
- **Security**: Helmet 8.x, Rate Limiting, CORS, HPP
- **Payment**: Stripe 20.x, Razorpay 2.9.x
- **Logging**: Winston 3.x
- **File Upload**: Multer 2.x

## Directory Structure

```
gadgify/
├── .github/
│   └── agents/
│       └── expert-fullstack-dev.agent.md
├── frontend/
│   ├── src/
│   │   ├── api/           # API client & request functions
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Full-page components (Products, Cart, Payment)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React Context providers
│   │   ├── i18n/          # i18next configuration & translations
│   │   ├── routes/        # Route definitions
│   │   ├── utils/         # Utility functions
│   │   ├── theme/         # MUI theme configuration
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript config
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Database models (Prisma schema)
│   │   ├── validators/    # Input validation schemas (Joi)
│   │   ├── config/        # Configuration files
│   │   ├── utils/         # Utility functions
│   │   ├── seed.ts        # Database seeding
│   │   └── server.ts      # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Migration files
│   ├── .env.example       # Environment variables template
│   ├── tsconfig.json      # TypeScript config
│   └── package.json
└── README.md
```

## Coding Conventions

### Naming Conventions

**Files & Folders:**
- Components: PascalCase (e.g., `ProductCard.tsx`, `UserAuthForm.tsx`)
- Pages: PascalCase (e.g., `ProductsPage.tsx`, `CheckoutPage.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`, `validateEmail.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `DEFAULT_TIMEOUT`)
- Hooks: camelCase with `use` prefix (e.g., `useCartItems.ts`, `useAuth.ts`)

**Variables & Functions:**
- Functions: camelCase (e.g., `fetchProducts()`, `addToCart()`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `STRIPE_PUBLIC_KEY`)
- State variables: camelCase (e.g., `isLoading`, `userEmail`)
- Database IDs: `id` (all lowercase)
- Timestamps: `createdAt`, `updatedAt` (camelCase)

**API Endpoints:**
- Nouns, not verbs (e.g., `/api/products`, `/api/orders`, not `/api/get-products`)
- Resource-based (e.g., `/api/products/:id`, `/api/orders/:id/items`)
- Plural names (e.g., `/api/users`, `/api/items`)
- Filter with query params (e.g., `/api/orders?status=pending&limit=10`)

### Code Style

**Frontend (React + TypeScript):**
- Use functional components only (no classes)
- Use hooks for state and side effects
- Use React Query for server state management
- Use Zod for form validation
- Props should be typed with interfaces
- Keep components under 300-400 lines
- Use composition over conditional rendering
- Extract reusable logic into custom hooks

**Backend (Express + TypeScript):**
- Controllers: Handle requests, call services, return responses
- Services: Contain business logic, database queries, external API calls
- Validators: Validate input using Joi schemas
- Middlewares: Handle authentication, error handling, logging
- Always use async/await (no callbacks)
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Use centralized error handling middleware
- Type all function parameters and return values

### Code Organization

**Frontend Component Structure:**
```typescript
// imports
import React from 'react';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

// types/interfaces at top
interface Props {
  productId: string;
  onSuccess?: () => void;
}

// component
export const ProductCard: React.FC<Props> = ({ productId, onSuccess }) => {
  // hooks
  // state
  // effects
  // handlers
  // render
};

export default ProductCard;
```

**Backend Route Structure:**
```typescript
// src/routes/products.ts
import express from 'express';
import * as productController from '../controllers/productController';
import { validateJWT, validateAdmin } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validator';
import * as productValidator from '../validators/productValidator';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validateJWT, validateAdmin, validateRequest(productValidator.createProduct), productController.createProduct);
router.put('/:id', validateJWT, validateAdmin, validateRequest(productValidator.updateProduct), productController.updateProduct);
router.delete('/:id', validateJWT, validateAdmin, productController.deleteProduct);

export default router;
```

## Database Schema Patterns

**Model Naming:**
- Singular form (e.g., `User`, `Product`, `Order`, not `Users`)
- PascalCase in Prisma schema
- Snake_case in database tables (Prisma handles conversion)

**Common Fields:**
```prisma
model Example {
  id        Int      @id @default(autoincrement())
  // or
  id        String   @id @default(cuid())    // for UUID

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // soft delete pattern
  deletedAt DateTime?
}
```

**Relations:**
- Always define both sides of relationships
- Use meaningful relation names
- Include cascading delete rules where appropriate

## Authentication & Security

### JWT Usage
- Token stored in httpOnly cookie (for XSS protection)
- Token claims should include: `id`, `email`, `role`
- Token expiration: 24 hours for access, 7 days for refresh
- Always validate token signature on backend

### Password Security
- Minimum 8 characters, special chars, numbers required
- Hash with bcryptjs (rounds: 10)
- Never return password in API responses
- Implement password reset with token expiration

### Maharashtra Validation
- Check user's selected state during signup
- Validate state in backend before checkout
- Validate state before payment processing
- Return specific error message if not from Maharashtra

### Input Validation
- Use Joi for backend validation
- Use Zod for frontend form validation
- Validate at system boundaries (user input, API requests)
- Never trust client-side validation alone

## React Query Patterns

**Query Keys Structure:**
```typescript
export const queryKeys = {
  all: ['products'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: any) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Usage in hooks
useQuery({
  queryKey: queryKeys.detail(productId),
  queryFn: () => fetchProduct(productId),
});
```

**Mutations:**
```typescript
const mutation = useMutation({
  mutationFn: (data) => createProduct(data),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.lists(),
    });
  },
});
```

## API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "statusCode": 400
}
```

## Testing & Validation

- Run `npm run build` before commits (catches TypeScript errors)
- Run `npm run lint` to check code style
- Write tests for critical business logic
- Add comments only for non-obvious logic
- Use type narrowing instead of runtime checks

## Common Tasks & Solutions

### Adding a New Feature
1. Create database schema in `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name feature_name`
3. Create API route in `backend/src/routes/`
4. Implement controller and service
5. Create validator schema
6. Create React Component in `frontend/src/components/`
7. Create API client function in `frontend/src/api/`
8. Create custom hook in `frontend/src/hooks/`
9. Add React Query mutation/query
10. Add i18n translations

### Fixing Bugs
1. Understand the error message and stack trace
2. Check if it's frontend (React Component, API call) or backend (API, database)
3. Add console.logs or debugger (do not commit)
4. Fix the root cause, not symptoms
5. Test the fix thoroughly
6. Run build and lint

### Performance Optimization
- Frontend: Use React.memo for expensive components, useCallback for handlers
- Backend: Add database indexes for frequently queried fields
- Use React Query cache invalidation instead of refetching
- Lazy load components with React.lazy()

## Important Rules

🚨 **MUST DO:**
- Always validate at backend (never trust client)
- Always check Maharashtra state validation
- Always type your code (no `any` types)
- Always handle errors with user-friendly messages
- Always use prepared statements (Prisma handles this)
- Always test before committing
- Always follow the tech stack versions specified

🚫 **MUST NOT DO:**
- Don't create new dependencies without discussion
- Don't modify database schema without migrations
- Don't hardcode API URLs or secrets
- Don't commit `.env` files
- Don't use `var` (use `const` or `let`)
- Don't use callback hell (use async/await)
- Don't ignore TypeScript errors
- Don't ship console.logs or debuggers
- Don't modify auth tokens on frontend

## Running the Application

**Development:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Database:**
```bash
cd backend
npx prisma studio        # View database
npx prisma migrate dev   # Run migrations
npm run seed             # Seed test data
```

**Build & Deploy:**
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm run start
```

## Debugging Tips

- Frontend issues: Check browser DevTools Console & Network tabs
- API issues: Check backend console logs and Winston logs
- Database issues: Use `npx prisma studio` to inspect data
- TypeScript errors: Run `npm run build` to see all errors
- Rate limiting issues: Check if hitting API too frequently

## Documentation References

- [React 19 Docs](https://react.dev)
- [Material UI Docs](https://mui.com)
- [React Query Docs](https://tanstack.com/query/latest)
- [Express.js Docs](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Migration Guide](https://nextjs.org/docs/app) (if considering migration)

---

**Last Updated**: 2026-02-28
**Maintained By**: Gadgify Development Team
