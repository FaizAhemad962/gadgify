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

**Admin:** `admin@gadgify.com` / `admin123`
**User:** `user@example.com` / `user123`

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
│       ├── constants/
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
│       ├── utils/                # Helpers (JWT, validators, etc.)
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
- Product detail with image gallery, video support, ratings
- Shopping cart with quantity management
- Wishlist
- Checkout with Stripe or Razorpay payment
- Order history and order detail tracking
- User profile with password change
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
| User         | id, email, name, phone, role, state, city, address, pincode                                |
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

## Security

- **Authentication:** JWT access tokens, bcrypt password hashing
- **HTTP:** Helmet headers, CORS whitelist, HPP parameter pollution protection
- **Rate Limiting:** Express rate limiter on auth and API endpoints
- **Input Sanitization:** express-mongo-sanitize, Joi validation on all request bodies
- **Soft Deletes:** No data is permanently removed — `deletedAt` timestamp pattern
- **File Uploads:** Multer with type/size restrictions

---

## Recently Implemented Features (2025)

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
- [ ] **Email notifications** — Order confirmation, shipping updates, password reset (Nodemailer / SendGrid)
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
