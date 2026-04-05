# Role-Based Navigation & Access Control Implementation Guide

## 📋 Overview

The Gadgify application needs to differentiate navigation and UI based on user roles. Currently, the frontend treats all authenticated users the same way, showing identical navigation items regardless of role.

**Current Problem:** A regular USER sees the same admin navigation as SUPER_ADMIN, causing confusion.

**Solution:** Implement role-aware navigation rendering and access control throughout the frontend.

---

## 🎯 Roles Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPER_ADMIN (3)                       │
│  Full system access • Can create any role • View audit logs  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                          ADMIN (2)                            │
│  Manage products/orders/categories • Create limited roles    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│         DELIVERY_STAFF (1) / SUPPORT_STAFF (1)                │
│  Role-specific dashboard access • Limited permissions        │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                         USER (0)                              │
│  Browse & purchase • Rate products • View orders             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files to Update

### 1. **Frontend Types** — `frontend/src/types/index.ts`

**Current:**

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN"; // ❌ Missing roles
  state: string;
  city: string;
  address: string;
  pincode: string;
  profilePhoto?: string;
  createdAt: string;
}
```

**Updated:**

```typescript
export type UserRole =
  | "USER"
  | "DELIVERY_STAFF"
  | "SUPPORT_STAFF"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole; // ✅ All 5 roles
  state: string;
  city: string;
  address: string;
  pincode: string;
  profilePhoto?: string;
  createdAt: string;
}
```

---

### 2. **Auth Context** — `frontend/src/context/AuthContext.tsx`

**Current:**

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean; // ❌ Only checks ADMIN
}

const value = {
  user,
  token,
  login,
  logout,
  isAuthenticated: !!token && !!user,
  isAdmin: user?.role === "ADMIN", // ❌ Doesn't include SUPER_ADMIN
};
```

**Updated:**

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean; // ✅ ADMIN or SUPER_ADMIN
  isSuperAdmin: boolean; // ✅ New
  hasAdminAccess: boolean; // ✅ Alias for isAdmin
  canManageUsers: boolean; // ✅ SUPER_ADMIN only
}

function roleHelper(user: User | null) {
  return {
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    hasAdminAccess: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    canManageUsers: user?.role === "SUPER_ADMIN",
    isStaff: user?.role === "DELIVERY_STAFF" || user?.role === "SUPPORT_STAFF",
  };
}

const value = {
  user,
  token,
  login,
  logout,
  isAuthenticated: !!token && !!user,
  ...roleHelper(user), // ✅ All role checks
};
```

---

### 3. **Navbar Navigation** — `frontend/src/components/layout/Navbar.tsx`

**Current Issue:**

```typescript
const navItems = [
  { id: "home", label: t("nav.home"), to: "/", icon: <Home /> },
  { id: "products", label: t("nav.products"), to: "/products", icon: <ShoppingBag /> },
  ...(isAuthenticated
    ? [
        { id: "orders", label: t("nav.orders"), to: "/orders", icon: <ShoppingCart /> },
        // ❌ These show for ALL authenticated users
      ]
    : []),
  ...(isAdmin
    ? [
        { id: "adminDashboard", label: t("nav.adminDashboard"), to: "/admin", icon: <Dashboard /> },
        // ❌ Only checks ADMIN, not SUPER_ADMIN
      ]
    : []),
];
```

**Solution:**

```typescript
// Role-based navigation builder
const getNavItems = () => {
  const baseItems = [
    { id: "home", label: t("nav.home"), to: "/", icon: <Home /> },
    { id: "products", label: t("nav.products"), to: "/products", icon: <ShoppingBag /> },
  ];

  // Customer items
  const customerItems = isAuthenticated && !isAdmin ? [
    { id: "orders", label: t("nav.orders"), to: "/orders", icon: <ShoppingCart /> },
    { id: "wishlist", label: t("nav.wishlist"), to: "/wishlist", icon: <Favorite /> },
  ] : [];

  // Admin items (both ADMIN and SUPER_ADMIN)
  const adminItems = isAdmin ? [
    { id: "adminDashboard", label: t("nav.adminDashboard"), to: "/admin", icon: <Dashboard /> },
    { id: "adminProducts", label: t("nav.adminProducts"), to: "/admin/products", icon: <Inventory /> },
    { id: "adminOrders", label: t("nav.adminOrders"), to: "/admin/orders", icon: <Assignment /> },
    { id: "adminCategories", label: t("nav.adminCategories"), to: "/admin/categories", icon: <Category /> },
  ] : [];

  // Super Admin only items
  const superAdminItems = isSuperAdmin ? [
    { id: "adminUsers", label: t("nav.adminUsers"), to: "/admin/users", icon: <People /> },
    { id: "adminCoupons", label: t("nav.adminCoupons"), to: "/admin/coupons", icon: <LocalOffer /> },
    { id: "auditLogs", label: t("nav.auditLogs"), to: "/admin/audit", icon: <History /> },
  ] : [];

  // Delivery staff items (future)
  const staffItems = user?.role === "DELIVERY_STAFF" ? [
    { id: "deliveries", label: t("nav.deliveries"), to: "/delivery", icon: <LocalShipping /> },
  ] : [];

  return [...baseItems, ...customerItems, ...adminItems, ...superAdminItems, ...staffItems];
};

const navItems = getNavItems();
```

---

### 4. **Route Protection** — `frontend/src/routes/AppRoutes.tsx`

**Current:**

```typescript
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

**Enhanced:**

```typescript
// Multi-role route protection
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  fallbackPath = "/"
}: {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role as UserRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Usage:
<Route path="/admin" element={<ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}><AdminLayout /></ProtectedRoute>} />
<Route path="/admin/audit" element={<ProtectedRoute requiredRoles={["SUPER_ADMIN"]}><AuditLogPage /></ProtectedRoute>} />
<Route path="/delivery" element={<ProtectedRoute requiredRoles={["DELIVERY_STAFF"]}><DeliveryDashboard /></ProtectedRoute>} />
```

---

### 5. **Admin Sidebar** — `frontend/src/components/layout/AdminSidebar.tsx` (Create if needed)

**Structure:**

```typescript
const AdminSidebar = () => {
  const { isSuperAdmin } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <Dashboard /> },
    { label: "Products", path: "/admin/products", icon: <Inventory /> },
    { label: "Orders", path: "/admin/orders", icon: <Assignment /> },
    { label: "Categories", path: "/admin/categories", icon: <Category /> },

    // Super Admin only
    ...(isSuperAdmin ? [
      { label: "Users", path: "/admin/users", icon: <People /> },
      { label: "Coupons", path: "/admin/coupons", icon: <LocalOffer /> },
      { label: "Audit Logs", path: "/admin/audit", icon: <History /> },
    ] : []),
  ];

  return (
    <Box sx={{ width: 250 }}>
      {menuItems.map(item => (
        <MenuItem key={item.path} to={item.path} icon={item.icon}>
          {item.label}
        </MenuItem>
      ))}
    </Box>
  );
};
```

---

## 🔄 Implementation Steps

### Phase 1: Type Safety ✅

- [ ] Update `User` interface with all 5 roles
- [ ] Create `UserRole` type alias
- [ ] Update API response types

### Phase 2: Auth Context ✅

- [ ] Add `isSuperAdmin`, `canManageUsers`, `isStaff` helpers
- [ ] Ensure `isAdmin` includes both ADMIN and SUPER_ADMIN
- [ ] Update localStorage parsing to handle new roles

### Phase 3: Navigation ✅

- [ ] Refactor Navbar to use role-based item filtering
- [ ] Add conditional rendering for admin/super admin links
- [ ] Style admin links distinctly (background color, badge, etc.)
- [ ] Test with different roles (USER, ADMIN, SUPER_ADMIN)

### Phase 4: Route Protection ✅

- [ ] Create generic `ProtectedRoute` component
- [ ] Replace all admin-only routes with `ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}`
- [ ] Add SUPER_ADMIN-only route protections
- [ ] Add Staff-only route protections (for future)

### Phase 5: UI/UX Enhancements

- [ ] Add role badge in user menu
- [ ] Show role indicator in admin dashboard
- [ ] Create admin sidebar with role-based menu
- [ ] Disable/hide features not available to user's role

### Phase 6: New Pages (Future)

- [ ] `/admin/users` — Full user management (SUPER_ADMIN only)
- [ ] `/admin/audit` — Audit log viewer (SUPER_ADMIN only)
- [ ] `/delivery` — Delivery staff dashboard (DELIVERY_STAFF)
- [ ] `/support` — Support staff dashboard (SUPPORT_STAFF)

---

## 🧪 Testing Scenarios

| Scenario            | Expected Behavior                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| USER logs in        | Sees: Home, Products, Orders, Wishlist. NOT admin links. No access to /admin                                                          |
| ADMIN logs in       | Sees: Home, Products, Dashboard, Products (admin), Orders (admin), Categories. NOT Users/Audit. Access to /admin but not /admin/users |
| SUPER_ADMIN logs in | Sees: ALL navigation items. Full access to /admin, /admin/users, /admin/audit, etc.                                                   |
| Unauthorized access | Trying to visit /admin as USER → redirects to /                                                                                       |
| Unauthorized access | Trying to visit /admin/users as ADMIN → redirects to /admin                                                                           |

---

## 📝 Summary of Changes

| File                                        | Change                         | Impact                       |
| ------------------------------------------- | ------------------------------ | ---------------------------- |
| `frontend/src/types/index.ts`               | Add all 5 roles to User type   | ✅ Type safety               |
| `frontend/src/context/AuthContext.tsx`      | Add role helper methods        | ✅ Cleaner auth checks       |
| `frontend/src/components/layout/Navbar.tsx` | Role-based item filtering      | ✅ Different nav per role    |
| `frontend/src/routes/AppRoutes.tsx`         | Generic ProtectedRoute wrapper | ✅ Flexible route protection |
| `README.md`                                 | Document RBAC approach         | ✅ Clear guidelines          |

---

## 🔗 Related Files

- Backend Role Validation: `backend/src/validators/index.ts` (lines 145-165)
- Backend Auth Middleware: `backend/src/middlewares/auth.ts`
- Backend Admin Routes: `backend/src/routes/adminRoutes.ts` (uses `authorize("ADMIN", "SUPER_ADMIN")`)
- Seed Data: `backend/src/seed.ts` (creates super-admin@gadgify.com)

---

## ✅ Done When

- [x] README.md updated with RBAC section
- [ ] User type includes all 5 roles
- [ ] AuthContext includes role helpers
- [ ] Navbar shows different items per role
- [ ] Routes are protected by role
- [ ] SUPER_ADMIN can access all admin pages
- [ ] ADMIN cannot access /admin/users
- [ ] USER cannot access any /admin/\* routes
- [ ] Every role-specific feature is tested
