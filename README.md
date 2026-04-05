# Gadgify — Full-Stack E-Commerce Platform

A production-ready electronics e-commerce application built with **React 19**, **MUI v7**, **Node.js / Express 5**, **Prisma**, and **PostgreSQL**.

Exclusively available for customers in **Maharashtra, India** 🇮🇳

---

## Table of Contents

- [Live Demo](#live-demo)
- [Default Credentials](#default-credentials)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Features](#features)
- [Architecture](#architecture)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Reusable Components](#reusable-components)
- [Internationalization](#internationalization)
- [Security](#security)
- [Future Enhancements](#future-enhancements)

---

## Live Demo

| Service         | URL                         |
| --------------- | --------------------------- |
| Frontend        | http://localhost:3000       |
| Backend API     | http://localhost:5000       |
| Admin Dashboard | http://localhost:3000/admin |
| Prisma Studio   | http://localhost:5555       |

---

## Default Credentials

**Super Admin:** `super-admin@gadgify.com` / `super-admin9606@`

> Note: Create additional admin, delivery staff, and support staff accounts as needed via the admin panel or API.

---

## Tech Stack

### Frontend

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | React 19, TypeScript 5.9, Vite 7    |
| UI        | MUI v7, MUI X DataGrid v7, Emotion  |
| State     | TanStack React Query v5             |
| Routing   | React Router v7                     |
| Forms     | React Hook Form v7 + Zod v4         |
| i18n      | i18next + browser language detector |
| Carousel  | Swiper 12                           |
| Payments  | Stripe React SDK, Razorpay          |

### Backend

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Runtime     | Node.js 20+, Express 5, TypeScript 5.9                        |
| ORM         | Prisma 5                                                      |
| Database    | PostgreSQL 14+                                                |
| Auth        | JWT + bcryptjs                                                |
| Validation  | Joi                                                           |
| File Upload | Multer                                                        |
| Logging     | Winston                                                       |
| Email       | Resend SDK (transactional emails)                             |
| Payments    | Stripe, Razorpay                                              |
| Security    | Helmet, CORS, HPP, express-rate-limit, express-mongo-sanitize |

---

## Project Structure

```
gadgify/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/                  # Axios API client modules
│       ├── assets/               # Static images & icons
│       ├── components/
│       │   ├── admin/            # Admin-specific components
│       │   │   ├── AdminProductsDataGrid.tsx
│       │   │   └── AdminOrdersDataGrid.tsx
│       │   ├── common/           # Shared layout components
│       │   ├── layout/           # Navbar, Footer, etc.
│       │   ├── payment/          # Stripe / Razorpay wrappers
│       │   ├── product/          # Product detail sub-components
│       │   └── ui/               # Reusable UI primitives
│       │       ├── AppDataGrid.tsx
│       │       ├── CustomButton.tsx
│       │       ├── CustomCard.tsx
│       │       ├── CustomTextField.tsx
│       │       ├── CustomDialog.tsx
│       │       ├── CustomAlert.tsx
│       │       ├── CustomChip.tsx
│       │       ├── CustomIconButton.tsx
│       │       ├── CustomSelect.tsx
│       │       └── CustomLoadingButton.tsx
│       ├── constants/            # Shared constants (categories, etc.)
│       ├── context/              # ThemeContext (dark mode toggle)
│       ├── hooks/                # Custom React hooks
│       ├── i18n/                 # Translation files
│       ├── pages/
│       │   ├── admin/            # AdminDashboard, AdminProducts, AdminOrders
│       │   ├── auth/             # Login, Register
│       │   ├── legal/            # Terms, Privacy, etc.
│       │   ├── HomePage.tsx
│       │   ├── ProductsPage.tsx
│       │   ├── ProductDetailPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── OrderDetailPage.tsx
│       │   ├── WishlistPage.tsx
│       │   ├── ProfilePage.tsx
│       │   └── ChangePasswordPage.tsx
│       ├── routes/               # Route definitions & guards
│       ├── services/
│       ├── theme/
│       │   └── theme.ts          # Design tokens + MUI light/dark themes
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database models
│   │   └── migrations/
│   ├── logs/
│   ├── uploads/                  # User-uploaded media
│   └── src/
│       ├── config/               # DB, env, Stripe/Razorpay config
│       ├── controllers/          # Route handlers
│       ├── middlewares/           # Auth, error handling, rate limiting
│       ├── routes/               # Express route definitions
│       ├── services/             # Business logic layer
│       ├── utils/                # Helpers (JWT, validators, email, etc.)
│       ├── validators/           # Joi request schemas
│       ├── seed.ts               # Database seeder
│       └── server.ts             # Express app entry point
│
└── docs/                         # Additional documentation
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone
git clone https://github.com/FaizAhemad962/gadgify.git
cd gadgify

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### Database Setup

```bash
cd backend

# Create PostgreSQL database
createdb gadgify

# Copy env and update DATABASE_URL
cp .env.example .env

# Run migrations + generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

# Seed default admin + sample data
npm run seed
```

### Start Development Servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend && npm run dev
```

---

## Design System

The app uses a centralized **design token system** (`frontend/src/theme/theme.ts`) that powers both MUI themes and all component styling.

### Color Palette

| Token      | Hex        | Usage                      |
| ---------- | ---------- | -------------------------- |
| primary    | `#1B2A4A`  | Nav, buttons, headings     |
| accent     | `#FF6B2C`  | CTAs, prices, highlights   |
| secondary  | `#0EA5E9`  | Links, info badges         |
| success    | `#16A34A`  | Stock available, delivered |
| warning    | `#F59E0B`  | Pending status             |
| error      | `#DC2626`  | Out of stock, cancelled    |
| gray50–900 | warm grays | Backgrounds, borders, text |

### Dark Mode

Toggle via `ThemeContext` — uses CSS custom properties in `index.css` + MUI `createTheme` dark variant. All tokens have dark surface counterparts (`darkBg`, `darkPaper`, `darkSubtle`).

### Typography

`Inter` font family across all text. Headings are bold (700), body is regular (400).

---

## Features

### Customer

- Product browsing with category filters, search, and price sorting
- Responsive product cards with image carousels
- Product detail with image gallery, hover zoom, video support, ratings
- Shopping cart with quantity management
- Wishlist
- Checkout with Stripe or Razorpay payment
- Order history and order detail tracking
- User profile with password change
- Forgot password / reset password via email
- GST-compliant pricing (base price + GST %)
- Multi-language support (i18n)
- Dark mode toggle

### Admin Dashboard

- **Dashboard** — Summary stat cards (products, orders, revenue, pending) + recent orders DataGrid
- **Products** — Full CRUD with image/video upload, category selection, GST/HSN fields, stock management
- **Orders** — Search, status management (Pending → Processing → Shipped → Delivered / Cancelled), payment status tracking
- All admin tables use the shared `AppDataGrid` component with server-side pagination, sorting, and filtering

---

## Architecture

```
┌─────────────┐    HTTP/JSON     ┌──────────────────┐    Prisma    ┌────────────┐
│   React SPA │ ◄──────────────► │  Express 5 API   │ ◄──────────► │ PostgreSQL │
│   (Vite)    │                  │  (Controllers →   │              │            │
│             │                  │   Services → DB)  │              │            │
└─────────────┘                  └──────────────────┘              └────────────┘
       │                                  │
       │  React Query                     │  Multer → /uploads/
       │  (cache + sync)                  │  Winston → /logs/
       ▼                                  ▼
   Optimistic UI                    JWT Auth Gate
```

- **API client** — Axios instances with interceptors for JWT token attachment
- **React Query** — Server state management with automatic cache invalidation
- **Prisma** — Type-safe ORM with soft-delete pattern (`deletedAt` field)
- **Layered backend** — Controllers parse requests → Services contain business logic → Prisma handles DB

---

## API Routes

| Method | Path                           | Auth   | Description               |
| ------ | ------------------------------ | ------ | ------------------------- |
| POST   | `/api/auth/register`           | Public | Register new user         |
| POST   | `/api/auth/login`              | Public | Login, returns JWT        |
| POST   | `/api/auth/forgot-password`    | Public | Send password reset email |
| POST   | `/api/auth/reset-password`     | Public | Reset password with token |
| GET    | `/api/products`                | Public | List products (paginated) |
| GET    | `/api/products/:id`            | Public | Product detail            |
| POST   | `/api/products`                | Admin  | Create product            |
| PUT    | `/api/products/:id`            | Admin  | Update product            |
| DELETE | `/api/products/:id`            | Admin  | Soft-delete product       |
| GET    | `/api/cart`                    | User   | Get user cart             |
| POST   | `/api/cart/items`              | User   | Add to cart               |
| PUT    | `/api/cart/items/:id`          | User   | Update cart item qty      |
| DELETE | `/api/cart/items/:id`          | User   | Remove from cart          |
| GET    | `/api/orders`                  | User   | User's orders             |
| POST   | `/api/orders`                  | User   | Place order               |
| GET    | `/api/orders/:id`              | User   | Order detail              |
| PUT    | `/api/admin/orders/:id/status` | Admin  | Update order status       |
| GET    | `/api/wishlist`                | User   | Get wishlist              |
| POST   | `/api/wishlist`                | User   | Add to wishlist           |
| DELETE | `/api/wishlist/:id`            | User   | Remove from wishlist      |
| POST   | `/api/media/upload`            | Admin  | Upload product media      |

---

## Database Schema

| Model        | Key Fields                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------ |
| User         | id, email, name, phone, role, state, city, address, pincode, resetToken, resetTokenExpiry  |
| Product      | id, name, description, price, originalPrice, stock, category, hsnNo, gstPercentage, colors |
| ProductMedia | id, url, type (image/video), isPrimary, productId                                          |
| Rating       | id, rating, comment, productId, userId (unique per user-product)                           |
| Cart         | id, userId (one-to-one)                                                                    |
| CartItem     | id, cartId, productId, quantity (unique per cart-product)                                  |
| Order        | id, userId, subtotal, shipping, total, status, paymentStatus, paymentId, shippingAddress   |
| OrderItem    | id, orderId, productId, quantity, price                                                    |
| Wishlist     | id, userId, productId (unique per user-product)                                            |

All models use UUID primary keys and soft-delete via `deletedAt`.

---

## Reusable Components

### AppDataGrid (`components/ui/AppDataGrid.tsx`)

A shared MUI X DataGrid wrapper used throughout the app:

```tsx
<AppDataGrid
  rows={data}
  columns={columns}
  isLoading={isLoading}
  total={totalCount} // server-side pagination
  page={page}
  rowsPerPage={25}
  onPageChange={setPage}
  onRowsPerPageChange={setRowsPerPage}
  mode="server" // or "client"
  height="calc(100vh - 280px)"
/>
```

**Props:**

- `mode` — `"server"` (default) or `"client"` pagination
- `height` — Container height override
- `sx` — Extra MUI sx merged into DataGrid
- `pageSizeOptions`, `getRowId`, `slotProps` — Pass-through to MUI DataGrid

### UI Primitives (`components/ui/`)

All accept standard MUI props plus token-based default styling:

- `CustomButton` — Primary, secondary, accent variants
- `CustomCard` — Elevation, border, hover effects
- `CustomTextField` — Consistent input styling
- `CustomDialog` — Modal with token-based chrome
- `CustomAlert` — Success, error, warning, info
- `CustomChip` — Status badges
- `CustomIconButton` — Icon-only actions
- `CustomSelect` — Dropdown with token styling
- `CustomLoadingButton` — Button with loading spinner

---

## Internationalization

Via `i18next` with automatic browser language detection. Translation files in `frontend/src/i18n/`.

Namespace convention: `admin.*`, `common.*`, `orders.*`, `payment.*`, `categories.*`, `months.*`.

---

## Role-Based Access Control (RBAC)

### Supported Roles

Gadgify implements a **5-tier role hierarchy**:

| Role               | Level | Capabilities                                                                  | Frontend Access          | Visual Indicator |
| ------------------ | ----- | ----------------------------------------------------------------------------- | ------------------------ | :--------------: |
| **USER**           | 0     | Browse, purchase, rate products, wishlist                                     | Customer dashboard       |     👤 Blue      |
| **DELIVERY_STAFF** | 1     | Delivery management (future dashboard)                                        | Basic staff access       |     🚚 Blue      |
| **SUPPORT_STAFF**  | 1     | Customer support (future dashboard)                                           | Support ticket viewing   |     👨‍💼 Cyan      |
| **ADMIN**          | 2     | Manage products, categories, orders, create DELIVERY_STAFF/SUPPORT_STAFF/USER | Full admin dashboard     |    ⚙️ Orange     |
| **SUPER_ADMIN**    | 3     | All permissions + create ADMIN accounts, manage roles, view audit logs        | Enhanced admin dashboard |      👑 Red      |

### Authentication Flow

1. **Backend** (`src/middlewares/auth.ts`):
   - `authenticate()` — Verifies JWT token and fetches user role
   - `authorize(...roles)` — Middleware that checks if user has required role(s)
   - Example: `router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"))`

2. **Frontend** (`frontend/src/context/AuthContext.tsx`):
   - `isAuthenticated` — Boolean flag set after login
   - `isAdmin` — Helper that checks if user role is ADMIN or SUPER_ADMIN
   - `user.role` — Actual role string for advanced permission checks
   - User types: Must be updated to include all 5 roles

### Navigation Menu Strategy

**Current Issue:** Frontend navbar shows same admin links to both USER and ADMIN/SUPER_ADMIN roles.

**Solution:** Role-based conditional rendering in navbar:

```tsx
// frontend/src/components/layout/Navbar.tsx

// Check if user can access admin features
const hasAdminAccess = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
const isSuperAdmin = user?.role === "SUPER_ADMIN";

// Navigation items vary by role
const navItems = [
  // Common to all
  { id: "home", label: "Home", to: "/", icon: <Home /> },
  { id: "products", label: "Products", to: "/products", icon: <ShoppingBag /> },

  // Customer-only
  ...(isAuthenticated && !hasAdminAccess
    ? [
        {
          id: "orders",
          label: "Orders",
          to: "/orders",
          icon: <ShoppingCart />,
        },
        {
          id: "wishlist",
          label: "Wishlist",
          to: "/wishlist",
          icon: <Favorite />,
        },
      ]
    : []),

  // Admin & Super Admin
  ...(hasAdminAccess
    ? [
        {
          id: "adminDashboard",
          label: "Dashboard",
          to: "/admin",
          icon: <Dashboard />,
        },
        {
          id: "adminProducts",
          label: "Products",
          to: "/admin/products",
          icon: <Inventory />,
        },
        {
          id: "adminOrders",
          label: "Orders",
          to: "/admin/orders",
          icon: <ShoppingCart />,
        },
        {
          id: "adminCategories",
          label: "Categories",
          to: "/admin/categories",
          icon: <Settings />,
        },
      ]
    : []),

  // Super Admin only
  ...(isSuperAdmin
    ? [
        {
          id: "adminUsers",
          label: "Users",
          to: "/admin/users",
          icon: <People />,
        },
        {
          id: "adminCoupons",
          label: "Coupons",
          to: "/admin/coupons",
          icon: <LocalOffer />,
        },
        {
          id: "auditLogs",
          label: "Audit Logs",
          to: "/admin/audit",
          icon: <History />,
        },
      ]
    : []),
];
```

### Implementation Checklist

- [x] **DONE**: Update User type in `frontend/src/types/index.ts` to include all 5 roles
- [x] **DONE**: Update AuthContext `isAdmin` check to recognize both ADMIN and SUPER_ADMIN
- [x] **DONE**: Create role constants and helper utilities (`constants/roles.ts`, `utils/roleHelper.ts`)
- [x] **DONE**: Create role permissions hook (`hooks/useRolePermissions.ts`)
- [x] **DONE**: Add role badges in ProfilePage, Navbar user menu, AdminDashboard
- [x] **DONE**: Add role-based restrictions in AdminUsers role dropdown
- [x] **DONE**: Add role translations to all 3 locales (en.json, hi.json, mr.json)
- [ ] TODO: Add role-based route protection in `frontend/src/routes/AppRoutes.tsx` (partial - SuperAdminRoute exists)
- [ ] TODO: Create staff-specific dashboards (DeliveryDashboard, SupportDashboard)
- [ ] TODO: Create Audit Logs page (SUPER_ADMIN only)
- [ ] TODO: Update remaining admin pages with role indicators

### Role Infrastructure Files (✅ COMPLETED)

**New files created for role management:**

1. **`frontend/src/constants/roles.ts`** - Role configuration and metadata
   - `ROLE_CONFIG` - Colors, icons, labels, levels for all 5 roles
   - `CREATABLE_ROLES_BY_ROLE` - Permission matrix for role creation
   - `ROLE_LEVELS` - Hierarchy levels (0-3)

2. **`frontend/src/utils/roleHelper.ts`** - Role utility functions
   - `getRoleLabel()`, `getRoleColor()`, `getRoleIcon()` - Display utilities
   - `canCreateRole()` - Permission checking
   - `hasAdminAccess()`, `isSuperAdmin()`, `isStaffRole()` - Role checks
   - 13 total helper functions

3. **`frontend/src/hooks/useRolePermissions.ts`** - Custom permission hook
   - `canAccessAdminPanel()`, `canManageUsers()`, `canViewAuditLogs()`
   - Role-specific dashboard access checks
   - 11 total permission methods

### Updated Components (✅ COMPLETED)

- `frontend/src/pages/admin/AdminUsers.tsx` - Role dropdown with access control ✅
- `frontend/src/pages/ProfilePage.tsx` - Role badge supporting all 5 roles ✅
- `frontend/src/components/layout/Navbar.tsx` - Role indicator in user menu ✅
- `frontend/src/pages/admin/AdminDashboard.tsx` - Role context chip near title ✅

### Backend Authorization (Already Implemented)

**File:** `backend/src/middlewares/auth.ts`

```typescript
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next();
  };
};
```

**Usage in routes:**

```typescript
// Admin and Super Admin only
router.get(
  "/admin/users",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllUsers,
);

// Super Admin only
router.post(
  "/audit-logs/clean",
  authenticate,
  authorize("SUPER_ADMIN"),
  cleanOldLogs,
);
```

---

## 📊 Production Readiness Status

### Overall Platform Maturity: **35% Production-Ready** ⚠️

> This is a **beautiful MVP** with core e-commerce functionality. For production launch, critical features still need implementation (see gaps below).

### Role Implementation Status

| Role               | Current | Target | Gap |     Status      |
| ------------------ | :-----: | :----: | :-: | :-------------: |
| **USER**           |   80%   |  100%  | 20% | ✅ Almost Ready |
| **DELIVERY_STAFF** |   10%   |  100%  | 90% | 🔴 Not Started  |
| **SUPPORT_STAFF**  |   10%   |  100%  | 90% | 🔴 Not Started  |
| **ADMIN**          |   40%   |  100%  | 60% |   ⚠️ Partial    |
| **SUPER_ADMIN**    |   17%   |  100%  | 83% |   🔴 Minimal    |

### ✅ What's Working Well

- Product catalog & browsing
- Shopping cart & order placement
- Payment integration (Stripe + Razorpay)
- User authentication & profile
- Admin product/category management
- Order status tracking
- Analytics dashboard
- Multi-language support (EN, HI, MR)
- GST-compliant pricing
- Role-based access control foundation
- Beautiful UI with MUI v7
- Responsive mobile design

### 🔴 Critical Gaps for Production

**Must Have Before Launch:**

- [ ] **Delivery Management Dashboard** — Delivery staff can't accept/update orders
- [ ] **Support Ticket System** — No customer support infrastructure
- [ ] **Order Returns & Refunds** — Critical for e-commerce
- [ ] **Inventory Alerts** — Risk of overselling products
- [ ] **Audit Logs** — No security audit trail
- [ ] **Tax Configuration (GST)** — Regional tax settings
- [ ] **Shipping Integration** — No shipping provider setup

**Should Have (UX/Operational):**

- [ ] **Order Tracking Page** — Customers expect real-time updates
- [ ] **Invoice Download** — Order receipts
- [ ] **Payment Methods** — Save multiple payment options
- [ ] **Notification System** — Email/SMS alerts
- [ ] **Reports & Export** — Admin needs data export

**Nice to Have (Growth):**

- [ ] **Referral Program** — Customer acquisition
- [ ] **Wishlist Sharing** — Social features
- [ ] **Live Chat Support** — Real-time customer service
- [ ] **Advanced Analytics** — Business intelligence
- [ ] **Marketing Tools** — Email campaigns

### 🚀 Recommended Launch Path

#### **Option A: MVP Launch (4-6 weeks)** ⭐ RECOMMENDED

Complete all "Must Have" features before launch:

1. Delivery staff dashboard & order assignment
2. Support ticket system basics
3. Return/refund request processing
4. Low stock inventory alerts
5. Audit logging
6. Tax rate configuration

**Result**: Feature-complete, customer-ready platform

#### **Option B: Beta Launch (2 weeks)** ⚡ Fast but Risky

Launch with current features + gradual rollout of staff features

- **Risk**: May disappoint customers/staff with missing functionality
- **Timeline**: 1-2 weeks

#### **Option C: Delayed Launch (8-10 weeks)** 🎯 Premium

Implement MVP + all "Should Have" features

- **Result**: Polished, feature-rich platform
- **Timeline**: 8-10 weeks

### 📈 Implementation Roadmap

**Phase 1: Staff Features (Weeks 1-3)**

- [ ] Delivery Staff Dashboard
- [ ] Support Ticket System
- [ ] Basic return request handling

**Phase 2: Critical Ops (Weeks 4-6)**

- [ ] Inventory management & alerts
- [ ] Audit logging
- [ ] Tax configuration
- [ ] Shipping integration

**Phase 3: Customer Experience (Weeks 7-8)**

- [ ] Advanced order tracking
- [ ] Invoice generation
- [ ] Payment method management
- [ ] Notification system

**Phase 4: Growth Features (Weeks 9+)**

- [ ] Referral program
- [ ] Analytics & reports
- [ ] Marketing tools

---

## Security

- **Authentication:** JWT access tokens, bcrypt password hashing
- **Password Reset:** Secure token-based flow — crypto.randomBytes(32), SHA-256 hashed in DB, 1-hour expiry, prevents email enumeration
- **HTTP:** Helmet headers, CORS whitelist, HPP parameter pollution protection
- **Rate Limiting:** Express rate limiter on auth and API endpoints
- **Input Sanitization:** express-mongo-sanitize, Joi validation on all request bodies
- **Soft Deletes:** No data is permanently removed — `deletedAt` timestamp pattern
- **File Uploads:** Multer with type/size restrictions

---

## Recently Implemented Features (2025–2026)

### March 2026

- [x] **Forgot / Reset Password** — Full email-based password reset flow using Resend SDK. Backend generates secure crypto token (SHA-256 hashed, 1-hour expiry), sends styled HTML email with reset link. Frontend includes ForgotPasswordPage and ResetPasswordPage with validation, loading states, and success feedback
- [x] **ChangePasswordPage UI overhaul** — Converted all hardcoded colors to design tokens, updated to MUI v7 `slotProps` pattern
- [x] **Standardized Categories** — 12 product categories defined as shared constants (`frontend/src/constants/categories.tsx`) with icons and colors. Updated HomePage, AdminProducts, and all 3 locale files (English, Hindi, Marathi)
- [x] **Product Detail — Image Zoom** — Replaced oversized image gallery with a responsive container (520px max). Hover-to-zoom at 2× magnification with CSS transform, cursor-following origin. Thumbnail strip below main image for multi-image/video navigation
- [x] **Product Card — List View Layout** — ProductCard now accepts `viewMode` prop. In list view, renders horizontally with a compact 220×200px image, content in the middle, and action buttons on the right — no more oversized full-width cards

### 2025

- [x] **Dynamic HomePage** — Trending products, new arrivals, shop-by-category grid, deal-of-the-day countdown, customer testimonials, newsletter signup
- [x] **Product listing enhancements** — Desktop filter sidebar restored, grid/list view toggle, "Showing X of Y" product counter, URL-driven category/sort filters
- [x] **Product detail enhancements** — Quantity selector, share-product button (copy link), low-stock warnings, related products section ("You May Also Like")
- [x] **Cart improvements** — Coupon/promo code input field, per-item low-stock alerts
- [x] **Order management UX** — Status filter chips (All/Pending/Processing/Shipped/Delivered/Cancelled), order search, "Buy Again" reorder button for delivered orders
- [x] **Full i18n coverage** — 60+ new translation keys across English, Hindi, and Marathi for all new features

## Future Enhancements

- [ ] **Real-time notifications** — WebSocket/SSE for order status updates
- [ ] **Product reviews with images** — Allow users to upload photos in reviews
- [ ] **Advanced search** — Elasticsearch or full-text search with auto-suggestions
- [ ] **Coupon & discount system (backend)** — Admin-managed promo codes, campaign discounts, and backend validation
- [ ] **Inventory alerts** — Low-stock email/push notifications for admins
- [ ] **Multi-vendor support** — Allow third-party sellers on the platform
- [ ] **Analytics dashboard** — Sales trends, customer insights, revenue charts (Chart.js / Recharts)
- [ ] **PWA support** — Service worker, offline cache, installable app
- [ ] **Email notifications** — Order confirmation, shipping updates (Nodemailer / SendGrid)
- [ ] **Image optimization** — Sharp / CDN integration for responsive image serving
- [ ] **CI/CD pipeline** — GitHub Actions for lint, test, build, deploy
- [ ] **Unit & integration tests** — Vitest (frontend) + Jest/Supertest (backend)
- [ ] **Docker Compose** — One-command dev environment (frontend + backend + PostgreSQL)
- [ ] **Address auto-complete** — Google Maps / India Post API for pin-code lookup
- [ ] **Invoice PDF generation** — GST-compliant tax invoice download per order
- [ ] **Role-based admin controls** — Granular permissions (super-admin, manager, support)
- [ ] **Product variants** — Size, color, storage options with separate pricing/stock
- [ ] **Return & refund flow** — Customer-initiated returns with admin approval workflow
- [ ] **SEO optimization** — SSR/SSG with Next.js or meta tags for better discoverability
- [ ] **Accessibility audit** — Full WCAG 2.1 AA compliance pass
- [ ] **AI-powered recommendations** — Personalized product suggestions based on browsing/purchase history
- [ ] **Wishlist sharing** — Share wishlist via link or social media
- [ ] **Order tracking map** — Live delivery tracking with map integration
- [ ] **Voice search** — Speech-to-text product search
- [ ] **A/B testing framework** — Experiment with homepage layouts, CTAs, pricing display

---

## Scripts Reference

### Frontend

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend

```bash
npm run dev            # Nodemon + ts-node
npm run build          # TypeScript compile to dist/
npm start              # Run compiled JS
npm run seed           # Seed database
npm run prisma:studio  # Open Prisma Studio GUI
npm run prisma:migrate # Run pending migrations
npm run prisma:generate # Regenerate Prisma client
```

---

**Built with ❤️ for Maharashtra**
