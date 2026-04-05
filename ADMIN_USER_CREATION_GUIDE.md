# Admin & Super Admin User Creation Guide

## Overview

This guide explains how the admin and super admin role system works, including:

- Role hierarchy and restrictions
- Creating users with specific roles
- Seeded test accounts
- API endpoints for user management

---

## Role Hierarchy & Permissions

### Roles Defined

1. **USER** (Level 0) - Regular customer
2. **DELIVERY_STAFF** (Level 1) - Order delivery personnel
3. **SUPPORT_STAFF** (Level 1) - Customer support representative
4. **ADMIN** (Level 2) - Platform administrator
5. **SUPER_ADMIN** (Level 3) - Full system control

### Who Can Create Users?

- **SUPER_ADMIN**: Can create users with ANY role (USER, ADMIN, SUPER_ADMIN, DELIVERY_STAFF, SUPPORT_STAFF)
- **ADMIN**: Can only create USER, DELIVERY_STAFF, or SUPPORT_STAFF roles
- **Other Roles**: Cannot create users

### Who Can Change Roles?

- **SUPER_ADMIN**: Can change any user's role
- **ADMIN**: Can change DELIVERY_STAFF, SUPPORT_STAFF, and USER roles
- **Other Roles**: Cannot change any roles

---

## Seeded Test Accounts

After running `npm run seed`, the following test accounts are automatically created:

### Super Admin Account

```
Email: superadmin@example.com
Password: password123
Role: SUPER_ADMIN
Name: Super Admin
```

### Admin Account

```
Email: admin@example.com
Password: password123
Role: ADMIN
Name: Admin User
```

### Regular User Accounts

- user1@example.com (USER)
- user2@example.com (USER)
- user3@example.com (USER)

---

## Setting Up Test Data

### 1. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

### 2. Run Seed to Create Test Accounts

```bash
npm run seed
```

### 3. Verify in Prisma Studio

```bash
npx prisma studio
```

Visit `http://localhost:5555` to view created users and their roles.

---

## API Endpoints for User Management

### Base URL

```
http://localhost:5000/api/admin
```

### 1. Create User (ADMIN & SUPER_ADMIN Only)

**Endpoint:** `POST /users`

**Authorization:** Bearer token (must be ADMIN or SUPER_ADMIN)

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "9876543210",
  "role": "DELIVERY_STAFF",
  "state": "Maharashtra",
  "city": "Mumbai",
  "address": "123 Main St",
  "pincode": "400001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-id-123",
    "email": "newuser@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "role": "DELIVERY_STAFF",
    "createdAt": "2026-04-05T10:30:00Z"
  }
}
```

**Restrictions:**

- SUPER_ADMIN can create any role
- ADMIN cannot create ADMIN or SUPER_ADMIN roles
- Email must be unique
- Password must be at least 8 characters

---

### 2. Get All Users

**Endpoint:** `GET /users`

**Authorization:** Bearer token (must be ADMIN or SUPER_ADMIN)

**Response:**

```json
{
  "success": true,
  "message": "Users fetched",
  "data": [
    {
      "id": "user-id-123",
      "email": "user1@example.com",
      "name": "Raj Kumar",
      "phone": "9876543210",
      "role": "USER",
      "state": "Maharashtra",
      "city": "Mumbai",
      "createdAt": "2026-04-05T10:00:00Z",
      "_count": { "orders": 5 }
    }
    // ... more users
  ]
}
```

---

### 3. Change User Role

**Endpoint:** `PATCH /users/:id/role`

**Authorization:** Bearer token (must be ADMIN or SUPER_ADMIN)

**Request Body:**

```json
{
  "role": "SUPPORT_STAFF"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": "user-id-123",
    "email": "user1@example.com",
    "name": "Raj Kumar",
    "role": "SUPPORT_STAFF"
  }
}
```

**Restrictions:**

- Cannot change own role
- ADMIN cannot promote users to ADMIN or SUPER_ADMIN
- Role must be valid (USER, ADMIN, SUPER_ADMIN, DELIVERY_STAFF, SUPPORT_STAFF)

---

### 4. Delete User (Soft Delete)

**Endpoint:** `DELETE /users/:id`

**Authorization:** Bearer token (must be ADMIN or SUPER_ADMIN)

**Response:**

```json
{
  "success": true,
  "message": "User deleted"
}
```

**Restrictions:**

- Cannot delete own account
- Soft delete (user's `deletedAt` field is set, not hard deleted)

---

## Role Change Endpoints

### Check Role Change Permission

**Endpoint:** `GET /api/role-change/check-permission`

**Authorization:** Bearer token

**Response:**

```json
{
  "success": true,
  "message": "Permission checked",
  "data": {
    "canChangeRoles": true,
    "message": "You have permission to change roles"
  }
}
```

---

### Grant Role Change Permission (SUPER_ADMIN Only)

**Endpoint:** `POST /api/role-change/grant`

**Authorization:** Bearer token (must be SUPER_ADMIN)

**Request Body:**

```json
{
  "email": "admin@example.com",
  "canRemovePermission": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Role change permission granted successfully",
  "data": {
    "id": "perm-id-123",
    "grantedToId": "user-id-123",
    "grantedById": "super-admin-id",
    "canRemovePermission": true,
    "createdAt": "2026-04-05T10:30:00Z"
  }
}
```

---

### Get All Permissions

**Endpoint:** `GET /api/role-change/permissions`

**Authorization:** Bearer token (must be ADMIN or SUPER_ADMIN)

**Response:**

```json
{
  "success": true,
  "message": "Permissions fetched successfully",
  "data": [
    {
      "id": "perm-id-123",
      "grantedTo": {
        "id": "user-id-123",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "ADMIN"
      },
      "grantedBy": {
        "id": "super-admin-id",
        "email": "superadmin@example.com",
        "name": "Super Admin"
      },
      "canRemovePermission": true,
      "createdAt": "2026-04-05T10:30:00Z"
    }
  ]
}
```

---

## Frontend: RoleManagementDashboard Component

The frontend provides a comprehensive UI for managing roles and permissions:

### Features

- View all users and their current roles
- Change user roles with dropdown menu
- Grant and revoke role change permissions
- Real-time table updates with React Query

### Location

```
frontend/src/components/admin/RoleManagementDashboard.tsx
```

### Usage

```tsx
import RoleManagementDashboard from "@/components/admin/RoleManagementDashboard";

export const RoleAdminPage = () => {
  return <RoleManagementDashboard />;
};
```

### Role Dropdown Roles Available

The component shows all 5 available roles:

- USER
- SUPER_ADMIN
- ADMIN
- DELIVERY_STAFF
- SUPPORT_STAFF

---

## Testing Guide

### 1. Test Creating a New User (cURL)

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "newsupport@example.com",
    "password": "SecurePassword123",
    "name": "Support Agent",
    "phone": "9876543210",
    "role": "SUPPORT_STAFF",
    "state": "Maharashtra",
    "city": "Pune",
    "address": "123 Street, Pune",
    "pincode": "411001"
  }'
```

### 2. Test Changing User Role

```bash
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "DELIVERY_STAFF"}'
```

### 3. Test Admin Cannot Create Admin

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePassword123",
    "name": "New Admin",
    "phone": "9876543210",
    "role": "ADMIN",
    "state": "Maharashtra",
    "city": "Mumbai",
    "address": "123 Street",
    "pincode": "400001"
  }'
```

Expected Response:

```json
{
  "success": false,
  "message": "Admins can only create DELIVERY_STAFF, SUPPORT_STAFF, or USER roles"
}
```

### 4. Test Super Admin Can Create Multiple Admins

```bash
# Create first admin
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin1@example.com",
    "password": "SecurePassword123",
    "name": "Admin 1",
    "phone": "9876543210",
    "role": "ADMIN",
    "state": "Maharashtra",
    "city": "Mumbai",
    "address": "123 Street",
    "pincode": "400001"
  }'

# Create second admin
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin2@example.com",
    "password": "SecurePassword123",
    "name": "Admin 2",
    "phone": "9876543211",
    "role": "ADMIN",
    "state": "Maharashtra",
    "city": "Pune",
    "address": "456 Street",
    "pincode": "411001"
  }'
```

---

## Database Schema

### User Table (Updated)

```sql
-- Relevant fields in users table
id: UUID (Primary Key)
email: String (Unique)
password: String (Hashed with bcryptjs)
name: String
phone: String
role: String (Enum: USER, ADMIN, SUPER_ADMIN, DELIVERY_STAFF, SUPPORT_STAFF)
state: String
city: String
address: String
pincode: String
createdAt: Timestamp
updatedAt: Timestamp
deletedAt: Timestamp (Soft delete)
```

### RoleChangePermission Table

```sql
id: UUID (Primary Key)
grantedById: UUID (Foreign Key → users.id)
grantedToId: UUID (Foreign Key → users.id)
canRemovePermission: Boolean
createdAt: Timestamp
updatedAt: Timestamp
deletedAt: Timestamp
```

---

## Authorization Flow

```
Request to /api/admin/* or /api/role-change/*
    ↓
authenticate middleware (validates JWT token)
    ↓
Is token valid?
    ├─ No → 401 Unauthorized
    └─ Yes → Extract user info
        ↓
    user.role = ?
        ├─ USER, DELIVERY_STAFF, SUPPORT_STAFF → 403 Forbidden
        └─ ADMIN or SUPER_ADMIN → Continue
            ↓
        Controller receives request
            ↓
        For CREATE operations:
            ├─ SUPER_ADMIN → Can create any role
            └─ ADMIN → Can only create USER, DELIVERY_STAFF, SUPPORT_STAFF

        For CHANGE ROLE operations:
            ├─ SUPER_ADMIN → Can change to any role
            └─ ADMIN → Cannot promote to ADMIN or SUPER_ADMIN
```

---

## Troubleshooting

### Issue: "Access denied" when trying to create user

**Solution:**

- Verify you're using ADMIN or SUPER_ADMIN token
- Check if your role is in the `authorize("ADMIN", "SUPER_ADMIN")` middleware
- Ensure JWT token is not expired

### Issue: "Admins can only create DELIVERY_STAFF..." error

**Solution:**

- If you need to create ADMIN or SUPER_ADMIN, use a SUPER_ADMIN account
- ADMIN accounts cannot create other ADMIN or SUPER_ADMIN accounts by design

### Issue: Users not showing in list after creation

**Solution:**

- Ensure soft delete filter is working (deletedAt IS NULL)
- Check that your token is from ADMIN or SUPER_ADMIN
- Verify user was actually created (check `npx prisma studio`)

### Issue: Role dropdown not showing all options

**Solution:**

- Ensure ChangeRoleDialog component is using AVAILABLE_ROLES constant
- Check that all 5 roles are defined in the component
- Verify permissions check passed (user has role change permission)

---

## Best Practices

1. **Always Use SUPER_ADMIN for Critical Operations**
   - Creating other ADMIN accounts
   - Granting role change permissions
   - System-wide role assignments

2. **ADMIN Accounts for Day-to-Day Management**
   - Creating SUPPORT_STAFF and DELIVERY_STAFF
   - Managing user permissions
   - Handling user-related tasks

3. **Regular Users Cannot Create Accounts**
   - Prevents unauthorized account creation
   - Maintains security and consistency
   - All user creation must go through admin interface

4. **Monitor Role Changes**
   - Keep audit logs of role changes
   - Review permissions granted
   - Regular security audits

5. **Password Security**
   - Enforce strong passwords (min 8 characters)
   - Hash all passwords with bcryptjs (salt rounds: 10)
   - Never expose passwords in logs or responses

---

## Related Files

- **Backend:**
  - `src/controllers/userController.ts` - User creation and management
  - `src/routes/adminRoutes.ts` - Admin routes with authorization
  - `src/validators/index.ts` - createUserSchema validation
  - `src/seed.ts` - Test data seeding with SUPER_ADMIN

- **Frontend:**
  - `src/components/admin/ChangeRoleDialog.tsx` - Role change dialog
  - `src/components/admin/RoleManagementDashboard.tsx` - Main admin interface
  - `src/api/roleChangeAPI.ts` - React Query hooks for role operations

---

## Next Steps

1. Run `npm run seed` to create test accounts
2. Login with `superadmin@example.com / password123`
3. Use RoleManagementDashboard to create additional admins
4. Test creating different user roles
5. Verify role-based restrictions work correctly
