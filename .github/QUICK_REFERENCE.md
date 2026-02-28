# AI Quick Reference - Gadgify

Fast lookup for common questions and commands.

## Quick Commands

```bash
# Frontend
cd frontend && npm install              # Install dependencies
npm run dev                             # Start dev server (http://localhost:3000)
npm run build                           # Build for production
npm run lint                            # Check code style

# Backend
cd backend && npm install               # Install dependencies
npm run dev                             # Start dev server (http://localhost:5000)
npm run build                           # Compile TypeScript
npm run start                           # Run compiled code
npm run prisma:generate                 # Generate Prisma client
npm run prisma:migrate                  # Run migrations
npm run prisma:studio                   # Open database GUI
npm run seed                            # Seed test data

# Database
createdb gadgify                        # Create PostgreSQL database (need psql installed)
```

## Quick Answers

### Q: Where do I add a new API endpoint?
**A:**
1. Add route in `backend/src/routes/(feature).ts`
2. Create controller in `backend/src/controllers/(featureController).ts`
3. Create service in `backend/src/services/(featureService).ts`
4. Add validation schema in `backend/src/validators/(featureValidator).ts`
5. Mount route in `backend/src/server.ts`

### Q: Where do I add a new React page?
**A:**
1. Create component in `frontend/src/pages/(PageName).tsx`
2. Create API function in `frontend/src/api/(feature).ts`
3. Create custom hook in `frontend/src/hooks/use(Feature).ts` (if needed)
4. Add route in `frontend/src/routes/index.ts`
5. Add i18n translations in `frontend/src/i18n/locales/*.json`

### Q: Where do I add translations?
**A:**
1. Edit JSON files in `frontend/src/i18n/locales/`
2. Use in components: `const { t } = useTranslation(); t('key.path')`

### Q: How do I check Maharashtra state validation?
**A:** Backend validates in:
- `/backend/src/validators/authValidator.ts` (signup)
- `/backend/src/services/orderService.ts` (checkout)
- API should reject non-Maharashtra users

### Q: Where's the database schema?
**A:** `backend/prisma/schema.prisma`

### Q: How do I run migrations?
**A:**
```bash
cd backend
npx prisma migrate dev --name descriptive_name
```

### Q: Where are API endpoints documented?
**A:** Check `AI_SKILLS.md` and `PROJECT_CONTEXT.md` for endpoint list

### Q: How do I add a new database field?
**A:**
1. Add field to model in `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Use new field in services

### Q: How do I validate form input?
**A:**
- Frontend: Use Zod in React Hook Form
- Backend: Use Joi validation middleware
- See `CODE_PATTERNS.md` for examples

### Q: Where's error handling?
**A:**
- Backend: `backend/src/utils/response.ts`
- Frontend: React Query handles errors automatically
- Global error middleware: `backend/src/middlewares/errorHandler.ts`

### Q: How do I add admin-only routes?
**A:** Use middleware in route: `authenticate, authorize('ADMIN')`

### Q: Where's the authentication logic?
**A:**
- JWT creation: `backend/src/services/authService.ts`
- JWT verification: `backend/src/middlewares/auth.ts`
- Frontend storage: httpOnly cookies

### Q: How do I handle file uploads?
**A:**
- Backend: Use Multer middleware in routes
- Frontend: Use FormData in API call
- See `CODE_PATTERNS.md` for full example

### Q: Where's styling configured?
**A:**
- MUI Theme: `frontend/src/theme/`
- Global styles: `frontend/src/App.tsx`

### Q: How do I add a new test?
**A:**
1. Create `.test.ts` file in `tests/` directory
2. Use Jest/Supertest for backend
3. See `CODE_PATTERNS.md` for test examples

## Tech Stack Quick Lookup

| Layer | Technology | Version | Docs |
|-------|-----------|---------|------|
| Frontend | React | 19 | react.dev |
| Styling | Material UI | 7.x | mui.com |
| State (Server) | React Query | 5.x | tanstack.com/query |
| State (Client) | Context API + Hooks | - | react.dev |
| Forms | React Hook Form | 7.x | react-hook-form.com |
| Validation (Frontend) | Zod | 4.x | zod.dev |
| Validation (Backend) | Joi | 18.x | joi.dev |
| Routing | React Router | 7.x | reactrouter.com |
| i18n | i18next | 25.x | i18next.com |
| Backend | Express | 5.x | expressjs.com |
| Database | PostgreSQL | 14+ | postgresql.org |
| ORM | Prisma | 5.x | prisma.io |
| Authentication | JWT | - | jwt.io |
| Password Hashing | bcryptjs | 3.x | npmjs.com/package/bcryptjs |
| Payments | Stripe / Razorpay | 20.x / 2.9.x | stripe.com / razorpay.com |
| Build Tool | Vite | 7.x | vitejs.dev |
| Language | TypeScript | 5.9 | typescriptlang.org |

## Common Patterns Checklist

When adding new features, ensure:

- ✅ Add Joi validation (backend)
- ✅ Add Zod schema (frontend forms)
- ✅ Add i18n translations
- ✅ Add error handling
- ✅ Add proper HTTP status codes
- ✅ Check Maharashtra validation (if user-facing)
- ✅ Add React Query invalidation
- ✅ Add loading states
- ✅ Add empty states
- ✅ Type all function parameters
- ✅ Use const/let (never var)
- ✅ Add async/await (never callbacks)

## File Location Reference

```
FRONTEND
├── API calls → src/api/
├── Components → src/components/
├── Pages → src/pages/
├── Hooks → src/hooks/
├── Forms → Components with react-hook-form
├── Routes → src/routes/
├── Styling → MUI theme in src/theme/
├── i18n → src/i18n/locales/
└── Utils → src/utils/

BACKEND
├── Routes → src/routes/
├── Controllers → src/controllers/
├── Services → src/services/
├── Validators → src/validators/
├── Middlewares → src/middlewares/
├── Models → prisma/schema.prisma
├── Config → src/config/
└── Utils → src/utils/

DATABASE
├── Schema → backend/prisma/schema.prisma
├── Migrations → backend/prisma/migrations/
└── Seeds → backend/src/seed.ts
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/gadgify
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NODE_ENV=development
PORT=5000
```

## Common Error Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` in correct directory |
| `TypeScript errors on build` | Run `npm run build` to see all errors |
| `Port already in use` | Kill process: `lsof -i :5000` / `kill -9 <PID>` |
| `Database connection failed` | Check `DATABASE_URL` in `.env` and PostgreSQL is running |
| `Prisma client error` | Run `npx prisma generate` in backend |
| `Migration conflicts` | Run `npx prisma migrate resolve` |
| `404 API endpoint` | Check route is mounted in `src/server.ts` |
| `401 Unauthorized` | Check JWT token in request (cookie/header) |
| `Validation error` | Check request body matches Joi schema |
| `State validation fails` | User must be from Maharashtra (check validator) |

## Debugging Checklist

Frontend:
- [ ] Check browser console for errors
- [ ] Check Network tab for API responses
- [ ] Check React DevTools for state
- [ ] Check MUI theme/styling
- [ ] Verify i18n keys exist

Backend:
- [ ] Check terminal logs
- [ ] Check Winston logs in `logs/` (if implemented)
- [ ] Use `console.error()` for debugging
- [ ] Check database with `npx prisma studio`
- [ ] Verify environment variables in `.env` file
- [ ] Test endpoint with Postman/Insomnia

## Performance Quick Tips

- Frontend: Use React.memo for expensive components
- Frontend: Lazy load routes with React.lazy()
- Backend: Add database indexes on foreign keys
- Backend: Select only needed fields from database
- Both: Implement caching (React Query handles this)
- Both: Implement pagination for large datasets

## Security Quick Checklist

- ✅ Never commit `.env` files
- ✅ Validate on backend (don't trust frontend)
- ✅ Hash passwords with bcryptjs
- ✅ Use JWT with httpOnly cookies
- ✅ Validate Maharashtra state
- ✅ Use Helmet.js headers
- ✅ Implement rate limiting
- ✅ Sanitize user inputs
- ✅ Use prepared statements (Prisma does this)
- ✅ Keep dependencies updated

## Need Help?

1. Check `AI_INSTRUCTIONS.md` for detailed guidelines
2. Check `AI_SKILLS.md` for what AI can automate
3. Check `PROJECT_CONTEXT.md` for architecture overview
4. Check `CODE_PATTERNS.md` for code examples
5. Check tech documentation links above

---

**Quick Reference Version**: 1.0
**Last Updated**: 2026-02-28
