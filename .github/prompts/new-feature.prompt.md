---
description: "Generate a complete new feature with backend route, controller, service, Joi validator, and frontend page with React Query hook"
agent: "expert-fullstack-dev"
argument-hint: "Feature name like 'wishlist' or 'product reviews'"
---

Create a complete full-stack feature for Gadgify with these files:

## Backend (in `backend/src/`)

1. **Route** in `routes/` — RESTful endpoints with auth middleware
2. **Controller** in `controllers/` — parse request, call service, return `{ success, message, data }`
3. **Service** in `services/` — business logic with Prisma calls
4. **Validator** in `validators/` — Joi schema for request body/params

## Frontend (in `frontend/src/`)

5. **API function** in `api/` — Axios call with TypeScript types
6. **Hook** in `hooks/` — React Query `useQuery`/`useMutation` wrapper
7. **Page component** in `pages/` — MUI layout with `useTranslation()`

## Requirements

- Follow the Route → Controller → Service → Prisma pattern
- Add Joi validation for all inputs
- Use React Query for data fetching (not useState+useEffect)
- Add i18n keys (don't hardcode strings)
- Include proper TypeScript types
- Add auth middleware where needed
