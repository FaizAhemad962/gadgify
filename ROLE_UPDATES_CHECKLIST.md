# Role Updates Implementation Checklist

## 🎯 Production Requirements vs Current Implementation

**Overall Platform Readiness**: **35% Production-Ready** ⚠️

### Role Maturity Matrix

| Role               | Component Updates | Dashboard | API Endpoints | Workflows | Production Ready |
| ------------------ | :---------------: | :-------: | :-----------: | :-------: | :--------------: |
| **USER**           |      ✅ 100%      |    ✅     |      ✅       |    ✅     |      🟡 80%      |
| **DELIVERY_STAFF** |      ⏳ 50%       |    ❌     |      ❌       |    ❌     |      🔴 10%      |
| **SUPPORT_STAFF**  |      ⏳ 50%       |    ❌     |      ❌       |    ❌     |      🔴 10%      |
| **ADMIN**          |      ✅ 100%      |    ✅     |      ✅       |    ⏳     |      🟡 40%      |
| **SUPER_ADMIN**    |      ✅ 100%      |    ⏳     |      ⏳       |    ❌     |      🔴 17%      |

**Legend**: ✅ Complete | ⏳ In Progress | ❌ Not Started | 🔴 Critical | 🟡 Warning

---

## 🚨 Production Launch Blockers

### MUST COMPLETE BEFORE LAUNCH:

1. **Delivery Staff System**
   - Dashboard page
   - Order assignment workflow
   - Status update API
   - GPS tracking
   - Proof of delivery

2. **Support Ticket System**
   - Ticket creation & management
   - Staff assignment
   - Response workflow
   - Status tracking

3. **Returns & Refunds**
   - Return request flow
   - Refund processing
   - Status tracking

4. **Inventory Management**
   - Low stock alerts
   - Stock tracking
   - Reorder points

5. **Audit & Compliance**
   - Audit logs page
   - GST configuration
   - Tax reports

---

## 📋 All Components Needing Role Updates

### **PRIORITY 1: Critical Files (Core Functionality)**

- [x] **`frontend/src/types/index.ts`** ✅ DONE
  - Issue: User type only has `"USER" | "ADMIN"`
  - Fix: Add all 5 roles: `"USER" | "ADMIN" | "SUPER_ADMIN" | "DELIVERY_STAFF" | "SUPPORT_STAFF"`
  - Status: All 5 roles now defined in User interface

- [x] **`frontend/src/pages/admin/AdminUsers.tsx`** ✅ DONE
  - Issue: Role dropdown only shows USER and ADMIN (lines 176-195)
  - Fix: Add all 5 role options to Menu Items with role-based restrictions
  - Changes:
    - Added `useAuth()` hook to get current user's role
    - Added `getAssignableRoles()` to determine which roles user can assign
    - Dropdown disabled if user has no assignable roles
    - Conditional rendering of role options based on user permissions
  - Status: Full role-based access control implemented

- [x] **`frontend/src/pages/ProfilePage.tsx`** ✅ DONE
  - Issue: Role chip only handles USER and ADMIN (lines 331-345)
  - Fix: Add role chip logic for all 5 roles with different colors/icons
  - Changes:
    - Added support for all 5 roles: USER, DELIVERY_STAFF, SUPPORT_STAFF, ADMIN, SUPER_ADMIN
    - Each role has distinct emoji: 👤 👚 👨‍💼 ⚙️ 👑
    - Each role has distinct color: blue, blue, cyan, orange, red
  - Status: All roles now display correctly in profile badge

---

### **PRIORITY 2: Display & UI Components**

- [x] **`frontend/src/components/layout/Navbar.tsx`** ✅ DONE
  - Issue: Admin links only labeled for "Dashboard", no role differentiation
  - Fix: Add role badge display in user menu with role-aware indicators
  - Changes:
    - Added Chip import from MUI
    - Imported `getRoleIcon`, `getRoleLabel`, `getRoleColor` helpers
    - Added role badge chip in user dropdown menu showing current user's role
    - Badge displays with emoji icon, role label, and role-specific color
  - Status: Role badge now visible in navbar user menu

- [x] **`frontend/src/pages/admin/AdminDashboard.tsx`** ✅ DONE
  - Issue: Dashboard title says "Dashboard" but should show role context
  - Fix: Add role indicator near title with color-coded chip
  - Changes:
    - Added `useAuth()` hook to get current user
    - Imported role helper functions
    - Updated title to display with role chip badge
    - Role indicator shows before title with emoji, label, and role color
    - Example: "Admin Dashboard [👑 Super Admin]"
  - Status: Role context now visible on admin dashboard

- [ ] **`frontend/src/components/common/CompareBar.tsx`**
  - Issue: May need role check for feature access
  - Fix: Verify if compare bar should be disabled for non-customer roles
  - Status: Not started (blocked by other priorities)

---

### **PRIORITY 3: Translations & Internationalization**

- [x] **`frontend/src/i18n/locales/en.json`** ✅ DONE
  - Added role display names in English:
    - `profileRoleUser` → "User"
    - `profileRoleAdmin` → "Admin"
    - `profileRoleSuperAdmin` → "Super Admin"
    - `profileRoleDeliveryStaff` → "Delivery Staff"
    - `profileRoleSupportStaff` → "Support Staff"
  - Status: All 5 role translations added

- [x] **`frontend/src/i18n/locales/hi.json`** ✅ DONE
  - Translated role names to Hindi:
    - "वापरकर्ता" (User)
    - "प्रशासन" (Admin)
    - "सुपर प्रशासन" (Super Admin)
    - "डिलीवरी कर्मचारी" (Delivery Staff)
    - "समर्थन कर्मचारी" (Support Staff)
  - Status: All 5 role translations added

- [x] **`frontend/src/i18n/locales/mr.json`** ✅ DONE
  - Translated role names to Marathi:
    - "वापरकर्ता" (User)
    - "प्रशासन" (Admin)
    - "सुपर प्रशासन" (Super Admin)
    - "डिलिव्हरी कर्मचारी" (Delivery Staff)
    - "समर्थन कर्मचारी" (Support Staff)
  - Status: All 5 role translations added

---

### **PRIORITY 4: Helper Functions & Constants**

- [x] **`frontend/src/constants/roles.ts`** ✅ DONE (NEW FILE)
  - Created comprehensive role configuration with:
    - `ROLE_LEVELS` - Hierarchy levels (0-3) for each role
    - `ROLE_CONFIG` - Complete metadata:
      - USER: color: "#1976d2", icon: "👤", level: 0
      - DELIVERY_STAFF: color: "#1976d2", icon: "🚚", level: 1
      - SUPPORT_STAFF: color: "#0097a7", icon: "👨‍💼", level: 1
      - ADMIN: color: "#ff9800", icon: "⚙️", level: 2
      - SUPER_ADMIN: color: "#d32f2f", icon: "👑", level: 3
    - `CREATABLE_ROLES_BY_ROLE` - Permission matrix for role creation
    - `ALL_ROLES`, `ADMIN_ROLES`, `STAFF_ROLES` - Role groupings
  - Status: Fully implemented and exported

- [x] **`frontend/src/utils/roleHelper.ts`** ✅ DONE (NEW FILE)
  - Created utility functions:
    - `getRoleLabel(role)` → Display name
    - `getRoleColor(role)` → Hex color code
    - `getRoleIcon(role)` → Emoji icon
    - `getRoleLevel(role)` → Hierarchy level (0-3)
    - `getRoleDescription(role)` → Role description
    - `canCreateRole(userRole, targetRole)` → Permission check
    - `hasAdminAccess(userRole)` → Admin check
    - `isSuperAdmin(userRole)` → Super admin check
    - `isStaffRole(role)` → Staff category check
    - `isCustomerRole(role)` → Customer check
    - `getAssignableRoles(userRole)` → Get creatable roles
    - `compareRoleLevel(role1, role2)` → Compare hierarchy
    - `formatRoleWithIcon(role)` → Format with emoji + label
  - Status: All 13 helper functions implemented

---

### **PRIORITY 5: Pages That Display Roles**

- [ ] **`frontend/src/pages/admin/AdminOrders.tsx`**
  - Show order creator role
  - Display delivery staff role if assigned

- [ ] **`frontend/src/pages/admin/AdminProducts.tsx`**
  - Show who created/last edited by (role)
  - Display if only admin can see

- [ ] **`frontend/src/pages/admin/AdminCategories.tsx`**
  - Show role access levels per category
  - If role-based category access needed

- [ ] **`frontend/src/pages/admin/AdminDashboard.tsx`** (Statistics)
  - Add role distribution chart
  - Show users by role count

- [ ] **`frontend/src/pages/admin/AdminCoupons.tsx`**
  - Show who can use each coupon (role restrictions)

---

### **PRIORITY 6: Context & Hooks**

- [x] **`frontend/src/context/AuthContext.tsx`** ✅ DONE
  - Already has: `isAdmin`, `isSuperAdmin`, `hasAdminAccess`, `isStaff`
  - Already handles all 5 roles

- [x] **`frontend/src/hooks/useRolePermissions.ts`** ✅ DONE (NEW HOOK)
  - Created custom hook with permission checking utilities:
    - `canAccessAdminPanel()` → Check if ADMIN or SUPER_ADMIN
    - `isSuperAdmin()` → Check if SUPER_ADMIN
    - `canManageUsers()` → Check if SUPER_ADMIN
    - `canCreateRoleType(targetRole)` → Check if can create specific role
    - `getCreatableRoles()` → Get all roles user can assign
    - `canViewAuditLogs()` → Check if SUPER_ADMIN
    - `canAccessDeliveryDashboard()` → Check if DELIVERY_STAFF
    - `canAccessSupportDashboard()` → Check if SUPPORT_STAFF
    - `hasAnyRole(requiredRoles)` → Check array of roles
    - `isCustomer()` → Check if USER
    - `isStaff()` → Check if DELIVERY_STAFF or SUPPORT_STAFF
  - Status: Fully implemented with 11 permission checking methods

---

### **PRIORITY 7: Admin-Specific Pages**

- [ ] **`frontend/src/pages/admin/AdminUsers.tsx`** (Already in PRIORITY 1)
  - Enhanced: Add role permissions display
  - Show what roles they can create (based on their role)
  - Restrict ADMIN from changing ADMIN/SUPER_ADMIN roles

- [ ] **Create `frontend/src/pages/admin/AuditLogs.tsx`** (SUPER_ADMIN ONLY)
  - Display all system audit logs
  - Filter by user, action, date range

- [ ] **Create `frontend/src/pages/staff/DeliveryDashboard.tsx`** (DELIVERY_STAFF)
  - Show assigned deliveries
  - Update delivery status

- [ ] **Create `frontend/src/pages/staff/SupportDashboard.tsx`** (SUPPORT_STAFF)
  - Show customer support tickets/conversations
  - Manage support requests

---

### **PRIORITY 8: API & Data Types**

- [ ] **`frontend/src/api/users.ts`**
  - Update `AdminUser` interface to include all role types
  - Add role filtering endpoint

- [ ] **`frontend/src/api/admin.ts`** (if exists)
  - Ensure all endpoints handle 5 roles
  - Add role statistics endpoint

---

### **PRIORITY 9: Validation & Restriction Logic**

- [ ] **`frontend/src/pages/admin/AdminUsers.tsx`** Role Dropdown Logic
  - **ADMIN can only see**: USER, DELIVERY_STAFF, SUPPORT_STAFF
  - **SUPER_ADMIN can see**: All 5 roles
  - **USER cannot see**: Role dropdown (if they somehow access page)

- [ ] **`frontend/src/routes/AppRoutes.tsx`**
  - Verify route protections for new staff pages
  - Add `/delivery` and `/support` routes

---

### **PRIORITY 10: Testing Components**

- [ ] **Test `AdminUsers.tsx` role switching**
  - Login as ADMIN → Can change USER to DELIVERY_STAFF ✅
  - Login as ADMIN → Cannot see SUPER_ADMIN option ✅
  - Login as SUPER_ADMIN → Can see all roles ✅

- [ ] **Test `ProfilePage.tsx` role display**
  - USER profile → Shows "👤 User" badge ✅
  - ADMIN profile → Shows "⚙️ Admin" badge ✅
  - SUPER_ADMIN profile → Shows "👑 Super Admin" badge ✅
  - DELIVERY_STAFF profile → Shows "🚚 Delivery Staff" badge ✅
  - SUPPORT_STAFF profile → Shows "👨‍💼 Support Staff" badge ✅

- [ ] **Test Navbar role indicators**
  - User dropdown shows current role ✅
  - Navigation items hidden/shown per role ✅

---

## 📊 File Priority Matrix

| Priority | File                                          | Type            | Impact                       |
| -------- | --------------------------------------------- | --------------- | ---------------------------- |
| 1        | `frontend/src/types/index.ts`                 | Type Definition | HIGH - blocks everything     |
| 1        | `frontend/src/pages/admin/AdminUsers.tsx`     | UI              | HIGH - user management       |
| 1        | `frontend/src/pages/ProfilePage.tsx`          | UI              | HIGH - user sees their role  |
| 2        | `frontend/src/components/layout/Navbar.tsx`   | UI              | MEDIUM - UX improvement      |
| 2        | `frontend/src/pages/admin/AdminDashboard.tsx` | UI              | MEDIUM - admin context       |
| 3        | `frontend/src/i18n/locales/*.json`            | i18n            | MEDIUM - localization        |
| 4        | `frontend/src/constants/roles.ts`             | Utility         | MEDIUM - reduces duplication |
| 4        | `frontend/src/utils/roleHelper.ts`            | Utility         | MEDIUM - reusable logic      |
| 5        | Admin pages (Orders, Products, etc.)          | UI              | LOW - nice-to-have           |
| 6        | `frontend/src/hooks/useRolePermissions.ts`    | Hook            | LOW - future use             |
| 7        | Staff pages (Delivery, Support)               | Page            | LOW - not built yet          |

---

## 🎯 Implementation Order

1. ✅ **Fix `frontend/src/types/index.ts`** → Unblock all type errors
2. ✅ **Fix `frontend/src/pages/admin/AdminUsers.tsx`** → Allow role changes
3. ✅ **Fix `frontend/src/pages/ProfilePage.tsx`** → Show correct role badge
4. ⬜ **Create role constants & helpers** → Reduce code duplication
5. ⬜ **Add translations** → Support multi-language
6. ⬜ **Update Navbar** → Show role indicator
7. ⬜ **Create audit logs page** → SUPER_ADMIN feature
8. ⬜ **Create staff pages** → For future staff roles

---

## ✅ Completion Status

- **Completed**: 2/10 (Types, AdminUsers)
- **In Progress**: 0/10
- **Not Started**: 8/10
- **Overall**: 20%

---

## 🔗 Related Documentation

- [ROLE_BASED_NAVIGATION.md](docs/ROLE_BASED_NAVIGATION.md)
- [README.md - RBAC Section](README.md#role-based-access-control-rbac)
- Backend role validation: `backend/src/validators/index.ts`
