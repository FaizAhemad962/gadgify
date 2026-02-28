# Project Context & Architecture - Gadgify

## Executive Summary

**Gadgify** is a production-ready e-commerce platform specializing in electronics, exclusively available to customers in Maharashtra, India. The application provides a seamless shopping experience with admin management capabilities.

## Vision & Goals

- 🎯 Provide a secure, user-friendly e-commerce experience for Maharashtra
- 🛡️ Implement industry-standard security practices
- 🚀 Build a scalable foundation for future growth
- 👨‍💼 Enable easy product and order management for administrators
- 🌍 Support multiple languages (English, Marathi, Hindi)
- 💳 Process payments safely using Stripe/Razorpay

## Business Requirements

### Target Users
1. **Customers**: Electronics gadget enthusiasts in Maharashtra
2. **Admins**: Store managers handling products and orders

### Key Features
- Product browsing and filtering
- Shopping cart management
- Secure payment processing
- Order tracking
- User account management (future)
- Admin dashboard

### Geographic Restriction
- ❌ Access allowed only from Maharashtra, India
- ✅ Validated at signup and checkout
- 🔒 Backend enforcement required

### Regulatory Compliance
- Secure payment handling (PCI-DSS compliance goal)
- User data protection
- Clear terms of service
- Return/refund policies

## Technical Architecture

### Application Layers

```
┌─────────────────────────────────────────┐
│     Client (Browser)                     │
│  React 19 + Material UI (MUI)           │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS, JSON
┌──────────────▼──────────────────────────┐
│     Frontend Application                 │
│  - React Components                      │
│  - React Query (State Management)        │
│  - React Router (Navigation)             │
│  - React Hook Form (Forms)               │
│  - i18next (Localization)               │
└──────────────┬──────────────────────────┘
               │ RESTful API Calls
┌──────────────▼──────────────────────────┐
│  API Gateway / Load Balancer (future)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Backend API Server                   │
│  - Express.js Routes                     │
│  - Controllers (Request Handling)        │
│  - Services (Business Logic)             │
│  - Middlewares (Auth, Validation)        │
│  - Error Handlers                        │
└──────────────┬──────────────────────────┘
               │ SQL Queries via ORM
┌──────────────▼──────────────────────────┐
│     Prisma ORM                           │
│  - Query Builder                         │
│  - Migration Manager                     │
└──────────────┬──────────────────────────┘
               │ TCP Connection
┌──────────────▼──────────────────────────┐
│     PostgreSQL Database                  │
│  - Users, Products, Orders               │
│  - Cart, Payments, Transactions          │
└─────────────────────────────────────────┘

        External Services
         ┌─────────────┐
         │   Stripe    │  Payment Processing
         ├─────────────┤
         │  Razorpay   │  Payment Processing
         └─────────────┘
```

## Data Flow

### User Registration Flow
```
1. User fills signup form (frontend)
   ↓ (Client-side validation with Zod)
2. Submit to /api/auth/signup
   ↓
3. Backend validates input (Joi)
   ↓
4. Check if email exists
   ↓
5. Validate Maharashtra state (IMPORTANT)
   ↓
6. Hash password with bcryptjs
   ↓
7. Create user in database
   ↓
8. Generate JWT token
   ↓
9. Return token (set in httpOnly cookie)
   ↓
10. Redirect to products page
```

### Product Purchase Flow
```
1. Browse products (GET /api/products)
   ↓
2. Add to cart (store in React Query + localStorage)
   ↓
3. Navigate to cart page
   ↓
4. Review items, set quantity
   ↓
5. Click "Proceed to Checkout"
   ↓
6. Validate Maharashtra state again (backend)
   ↓
7. Show payment form (Stripe/Razorpay)
   ↓
8. Process payment (external service)
   ↓
9. Create order in database
   ↓
10. Update inventory (reduce stock)
   ↓
11. Show confirmation
   ↓
12. Send confirmation email (future)
```

### Admin Product Management Flow
```
1. Admin logs in
   ↓
2. Navigate to Products page
   ↓
3. View all products (GET /api/admin/products)
   ↓
4. Click "Add Product"
   ↓
5. Fill product form + upload images
   ↓
6. Submit (POST /api/admin/products)
   ↓
7. Backend validates (admin role check)
   ↓
8. Store in database
   ↓
9. Return success
   ↓
10. Update product list (React Query invalidation)
```

## Database Schema Overview

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password (hash) │
│ name            │
│ state           │
│ role            │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        ├─── Products (many to many via Cart)
        ├─── Orders (one to many)
        └─── Payments (one to many)

┌─────────────────┐
│   Products      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ description     │
│ price           │
│ stock           │
│ image_url       │
│ category        │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        ├─── Cart (many to many join)
        └─── OrderItems (one to many)

┌─────────────────┐
│      Cart       │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│   CartItems     │
├─────────────────┤
│ id (PK)         │
│ cartId (FK)     │
│ productId (FK)  │
│ quantity        │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│     Orders      │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ total_price     │
│ status          │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│   OrderItems    │
├─────────────────┤
│ id (PK)         │
│ orderId (FK)    │
│ productId (FK)  │
│ quantity        │
│ price           │
└─────────────────┘

┌─────────────────┐
│    Payments     │
├─────────────────┤
│ id (PK)         │
│ orderId (FK)    │
│ userId (FK)     │
│ amount          │
│ status          │
│ provider        │
│ transactionId   │
│ createdAt       │
└─────────────────┘
```

## API Endpoints Overview

### Public Endpoints
```
GET    /api/products              # List all products
GET    /api/products/:id          # Get single product
GET    /api/products/search       # Search products
POST   /api/auth/signup           # User registration
POST   /api/auth/login            # User login
GET    /api/health                # Health check
```

### User Endpoints (Auth Required)
```
GET    /api/cart                  # Get user's cart
POST   /api/cart/add              # Add to cart
PUT    /api/cart/update/:itemId   # Update cart item
DELETE /api/cart/items/:itemId    # Remove from cart
POST   /api/checkout              # Process checkout
GET    /api/orders                # Get user's orders
GET    /api/orders/:id            # Get order details
POST   /api/payments/process      # Process payment
```

### Admin Endpoints (Auth + Admin Role Required)
```
GET    /api/admin/products        # List all products
POST   /api/admin/products        # Create product
PUT    /api/admin/products/:id    # Update product
DELETE /api/admin/products/:id    # Delete product
GET    /api/admin/orders          # List all orders
GET    /api/admin/orders/:id      # Get order details
GET    /api/admin/payments        # List all payments
GET    /api/admin/users           # List all users
GET    /api/admin/analytics       # Dashboard analytics
```

## Security Architecture

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Storage**: httpOnly cookies (XSS protection)
- **Expiry**: 24 hours (access token), 7 days (refresh token)
- **Algorithm**: HS256 or RS256

### Authorization
- **Role-Based Access Control (RBAC)**:
  - `USER`: Normal customer access
  - `ADMIN`: Administrative access
- **Middleware**: Validates JWT, checks role, enforces permissions

### Data Protection
- **Passwords**: bcryptjs (salt rounds: 10)
- **Sensitive Data**: Never logged or exposed in responses
- **SQL Injection**: Prevented by Prisma ORM (parameterized queries)
- **Input Validation**: Joi (backend) + Zod (frontend)

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured to allowed origins only
- **Helmet.js**: HTTP headers security
- **HPP**: HTTP Parameter Pollution protection
- **HTTPS**: Required in production

### Maharashtra Validation
- **Signup Level**: Must select Maharashtra as state
- **Checkout Level**: Validate state before payment
- **Database Level**: Store and check state in every order

## State Management Strategy

### Frontend
- **Server State**: React Query
  - Product listings
  - Orders
  - Admin operations
  - Automatic caching and synchronization

- **UI State**: React Hooks (useState, useContext)
  - Form inputs
  - Modal open/close
  - Loading states

- **Local State**: localStorage
  - User preferences
  - Cart (temporary)
  - Language selection

### Backend
- **In-Memory Cache** (future): Redis for high-frequency queries
- **Database Cache**: Prisma client-side query cache
- **Session Management**: JWT (stateless)

## Error Handling Strategy

### Frontend
```
API Error → React Query intercepts
         → Toast notification to user
         → Retry logic with exponential backoff
         → Graceful fallback UI
```

### Backend
```
Route Handler → Validation → Service Layer → Database
             ↓             ↓              ↓
          Error Middleware catches all exceptions
             ↓
          Format error response (consistent format)
             ↓
          Log error (Winston)
             ↓
          Send to client with appropriate status code
```

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Component memoization (React.memo)
- Image optimization (lazy loading)
- Bundle size monitoring

### Backend Optimization
- Database indexes on frequently queried fields
- Connection pooling
- Query optimization (select only needed fields)
- Rate limiting

### Database Optimization
- Proper indexing strategy
- Foreign key constraints
- Query analysis and optimization
- Archive old data (future)

## Scalability Plan

### Current (MVP)
- Single backend server
- Single database instance
- Basic caching

### Phase 1 (Short-term, 1-3 months)
- Load balancer
- Database read replicas
- Redis caching

### Phase 2 (Medium-term, 3-6 months)
- Microservices for payment processing
- Message queue (RabbitMQ/Kafka)
- CDN for static assets
- Elasticsearch for search

### Phase 3 (Long-term, 6+ months)
- Multi-region deployment
- Kubernetes orchestration
- Advanced analytics
- ML-based recommendations

## Deployment & DevOps

### Current Environment
- Development: Local with `npm run dev`
- Production: Docker containers (future)

### CI/CD Pipeline (future)
```
Git Push → GitHub Actions
        → Run tests
        → Build Docker image
        → Push to registry
        → Deploy to staging
        → Manual approval
        → Deploy to production
```

### Environment Configuration
- `.env` variables for all secrets
- Different configs for dev/staging/prod
- No hardcoded values in code

## Monitoring & Observability

### Logging
- **Frontend**: Error boundaries, console logging
- **Backend**: Winston logger with levels
- **Database**: Query logging (Prisma debug mode)

### Metrics (Future)
- API response times
- Error rates
- User activity
- Payment processing success rates

### Analytics
- User behavior tracking (future)
- Product popularity
- Revenue metrics
- Conversion rates

## Compliance & Legal

### Data Privacy
- GDPR compliance study (when EU users added)
- Privacy policy required
- Data retention policies

### Payment Compliance
- PCI-DSS considerations (Stripe/Razorpay handle this)
- Secure payment handling

### User Agreements
- Terms of Service
- Return/Refund policy
- Privacy policy
- Maharashtra service restriction notice

## Development Workflow

```
Feature Request
    ↓
Create feature branch (feature/feature-name)
    ↓
Develop (local testing)
    ↓
Create Pull Request
    ↓
Code Review
    ↓
Merge to main
    ↓
Deploy to staging
    ↓
Deploy to production
```

## Key Decision Records (ADR)

### 1. Maharashtra-Only Access
- **Decision**: Geographic restriction enforced via state validation
- **Reason**: Business requirement for initial market focus
- **Impact**: Must validate on frontend AND backend
- **Trade-off**: Limits market reach initially but focuses operations

### 2. JWT over Session-based Auth
- **Decision**: Stateless JWT authentication
- **Reason**: Scalable, works with microservices, stateless servers
- **Impact**: No server-side session storage needed
- **Trade-off**: Token cannot be revoked immediately (fixed with token blacklist)

### 3. Prisma ORM over Raw SQL
- **Decision**: Use Prisma as ORM
- **Reason**: Type safety, migrations, query builder, developer experience
- **Impact**: Abstraction from database queries
- **Trade-off**: Slightly less performance control than raw SQL

### 4. React Query over Redux
- **Decision**: Use React Query for server state
- **Reason**: Built for server state, automatic caching, synchronization
- **Impact**: Reduced boilerplate, better UX
- **Trade-off**: Learning curve for new developers

### 5. Stripe/Razorpay over Custom Payment
- **Decision**: Use managed payment providers
- **Reason**: Security, compliance, reduce PCI scope
- **Impact**: Better security, reduced liability
- **Trade-off**: Transaction fees

## Important Contacts & Resources

- **React Documentation**: https://react.dev
- **Material UI Docs**: https://mui.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Architecture Version**: 1.0
**Last Updated**: 2026-02-28
**Reviewed By**: Development Team
