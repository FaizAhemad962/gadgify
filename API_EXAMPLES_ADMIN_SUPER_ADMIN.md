# Admin & Super Admin API Reference - Complete Examples

## Base Configuration

### API Base URL

```
http://localhost:5000
```

### Authentication Header

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## User Management Endpoints

### 1️⃣ Create User (Only Admin/Super Admin)

#### SUPER_ADMIN: Create Any Role

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_jwt_token_here" \
  -d '{
    "email": "newadmin@gadgify.com",
    "password": "SecurePassword@123",
    "name": "Admin User",
    "phone": "9876543210",
    "role": "ADMIN",
    "state": "Maharashtra",
    "city": "Mumbai",
    "address": "123 Corporate Lane, Bandra",
    "pincode": "400050"
  }'
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clz1h2k3m4n5o6p7q8r9s0t1",
    "email": "newadmin@gadgify.com",
    "name": "Admin User",
    "phone": "9876543210",
    "role": "ADMIN",
    "createdAt": "2026-04-05T10:30:00Z"
  }
}
```

---

#### SUPER_ADMIN: Create SUPER_ADMIN (Promote Another Admin)

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_jwt_token" \
  -d '{
    "email": "admin2@gadgify.com",
    "password": "SecurePassword@456",
    "name": "Second Super Admin",
    "phone": "9876543211",
    "role": "SUPER_ADMIN",
    "state": "Maharashtra",
    "city": "Pune",
    "address": "456 Tech Park, Hinjewadi",
    "pincode": "411001"
  }'
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clz1h2k3m4n5o6p7q8r9s0t2",
    "email": "admin2@gadgify.com",
    "name": "Second Super Admin",
    "phone": "9876543211",
    "role": "SUPER_ADMIN",
    "createdAt": "2026-04-05T10:35:00Z"
  }
}
```

---

#### ADMIN: Create DELIVERY_STAFF

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  -d '{
    "email": "delivery1@gadgify.com",
    "password": "DeliveryPass@789",
    "name": "Rajesh Kumar",
    "phone": "9876543220",
    "role": "DELIVERY_STAFF",
    "state": "Maharashtra",
    "city": "Nagpur",
    "address": "123 Itwari, Nagpur",
    "pincode": "440002"
  }'
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clz1h2k3m4n5o6p7q8r9s0t3",
    "email": "delivery1@gadgify.com",
    "name": "Rajesh Kumar",
    "phone": "9876543220",
    "role": "DELIVERY_STAFF",
    "createdAt": "2026-04-05T10:40:00Z"
  }
}
```

---

#### ADMIN: Attempt to Create ADMIN (FAILS ❌)

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  -d '{
    "email": "newadmin@gadgify.com",
    "password": "Password@123",
    "name": "New Admin",
    "phone": "9876543230",
    "role": "ADMIN"
  }'
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Admins can only create DELIVERY_STAFF, SUPPORT_STAFF, or USER roles"
}
```

---

#### USER: Attempt to Create User (FAILS ❌)

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user_jwt_token" \
  -d '{
    "email": "test@gadgify.com",
    "password": "Password@123",
    "name": "Test User",
    "phone": "9876543240",
    "role": "USER"
  }'
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Access denied"
}
```

---

### 2️⃣ Get All Users

**Request:**

```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users fetched",
  "data": [
    {
      "id": "clz1h2k3m4n5o6p7q8r9s0t1",
      "email": "user1@example.com",
      "name": "Raj Kumar",
      "phone": "9876543210",
      "role": "USER",
      "state": "Maharashtra",
      "city": "Mumbai",
      "createdAt": "2026-04-05T09:00:00Z",
      "_count": {
        "orders": 5
      }
    },
    {
      "id": "clz1h2k3m4n5o6p7q8r9s0t2",
      "email": "admin@example.com",
      "name": "Admin User",
      "phone": "9999999999",
      "role": "ADMIN",
      "state": "Maharashtra",
      "city": "Mumbai",
      "createdAt": "2026-04-05T09:10:00Z",
      "_count": {
        "orders": 0
      }
    },
    {
      "id": "clz1h2k3m4n5o6p7q8r9s0t3",
      "email": "superadmin@example.com",
      "name": "Super Admin",
      "phone": "8888888888",
      "role": "SUPER_ADMIN",
      "state": "Maharashtra",
      "city": "Mumbai",
      "createdAt": "2026-04-05T09:15:00Z",
      "_count": {
        "orders": 0
      }
    }
  ]
}
```

---

### 3️⃣ Change User Role

#### SUPER_ADMIN: Change Any User's Role

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_jwt_token" \
  -d '{
    "role": "SUPPORT_STAFF"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": "clz1h2k3m4n5o6p7q8r9s0t1",
    "email": "user1@example.com",
    "name": "Raj Kumar",
    "role": "SUPPORT_STAFF"
  }
}
```

---

#### ADMIN: Change User's Role (Limited)

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  -d '{
    "role": "DELIVERY_STAFF"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": "clz1h2k3m4n5o6p7q8r9s0t4",
    "email": "user2@example.com",
    "name": "Priya Sharma",
    "role": "DELIVERY_STAFF"
  }
}
```

---

#### ADMIN: Attempt to Promote User to ADMIN (FAILS ❌)

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  -d '{
    "role": "ADMIN"
  }'
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "You are not authorized to assign this role"
}
```

---

#### User: Attempt to Change Own Role (FAILS ❌)

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user_jwt_token" \
  -d '{
    "role": "ADMIN"
  }'
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Access denied"
}
```

---

#### Admin: Cannot Change Own Role (FAILS ❌)

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  -d '{
    "role": "SUPER_ADMIN"
  }'
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Cannot change your own role"
}
```

---

### 4️⃣ Delete User (Soft Delete)

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/admin/users/clz1h2k3m4n5o6p7q8r9s0t5 \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Role Change Permission Endpoints

### 5️⃣ Grant Role Change Permission (SUPER_ADMIN Only)

**Request:**

```bash
curl -X POST http://localhost:5000/api/role-change/grant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_jwt_token" \
  -d '{
    "email": "admin@example.com",
    "canRemovePermission": true
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Role change permission granted successfully",
  "data": {
    "id": "perm-clz1h2k3m4n5o6p7q8r9s0t1",
    "grantedToId": "clz1h2k3m4n5o6p7q8r9s0t2",
    "grantedById": "clz1h2k3m4n5o6p7q8r9s0t3",
    "canRemovePermission": true,
    "createdAt": "2026-04-05T10:30:00Z"
  }
}
```

---

### 6️⃣ Get All Role Change Permissions

**Request:**

```bash
curl -X GET http://localhost:5000/api/role-change/permissions \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Permissions fetched successfully",
  "data": [
    {
      "id": "perm-clz1h2k3m4n5o6p7q8r9s0t1",
      "grantedTo": {
        "id": "clz1h2k3m4n5o6p7q8r9s0t2",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "ADMIN"
      },
      "grantedBy": {
        "id": "clz1h2k3m4n5o6p7q8r9s0t3",
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

### 7️⃣ Revoke Role Change Permission

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/role-change/revoke/clz1h2k3m4n5o6p7q8r9s0t2 \
  -H "Authorization: Bearer superadmin_jwt_token"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Role change permission revoked successfully"
}
```

---

### 8️⃣ Check Own Role Change Permission

**Request:**

```bash
curl -X GET http://localhost:5000/api/role-change/check-permission \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response - Has Permission (200):**

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

**Success Response - No Permission (200):**

```json
{
  "success": true,
  "message": "Permission checked",
  "data": {
    "canChangeRoles": false,
    "message": "You don't have permission to change roles"
  }
}
```

---

## Error Response Examples

### 401 - Unauthorized (No Token)

```json
{
  "message": "Authentication required"
}
```

### 403 - Forbidden (Insufficient Role)

```json
{
  "message": "Access denied"
}
```

### 400 - Bad Request (Invalid Data)

```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Test Scenarios

### Scenario 1: Super Admin Creates Multiple Roles

**Step 1:** Create an Admin

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_token" \
  -d '{
    "email": "manager@gadgify.com",
    "password": "Password@123",
    "name": "Manager",
    "phone": "9876543250",
    "role": "ADMIN"
  }'
# Response: 201 ✅
```

**Step 2:** Admin Creates Support Staff

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer manager_token" \
  -d '{
    "email": "support@gadgify.com",
    "password": "Password@456",
    "name": "Support Agent",
    "phone": "9876543260",
    "role": "SUPPORT_STAFF"
  }'
# Response: 201 ✅
```

**Step 3:** Super Admin Changes Support Staff to Delivery Staff

```bash
curl -X PATCH http://localhost:5000/api/admin/users/SUPPORT_STAFF_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer superadmin_token" \
  -d '{"role": "DELIVERY_STAFF"}'
# Response: 200 ✅
```

---

### Scenario 2: Role Hierarchy Enforcement

```
✅ SUPER_ADMIN creates ADMIN
✅ ADMIN creates USER
❌ ADMIN tries to create ADMIN → Returns 403
❌ USER tries to create anything → Returns 403
✅ SUPER_ADMIN creates SUPER_ADMIN
```

---

## Postman Collection URL

Add to Postman environment variables:

```
{{base_url}} = http://localhost:5000
{{superadmin_token}} = (login response token)
{{admin_token}} = (login response token)
{{user_token}} = (login response token)
```

---

## Frontend Integration

### Using React Query Hooks

```typescript
import {
  useCreateUser,
  useChangeUserRole,
  useGetAllUsers,
} from "@/api/adminAPI";

// Create user
const createUserMutation = useCreateUser();
await createUserMutation.mutateAsync({
  email: "newuser@gadgify.com",
  password: "Password@123",
  name: "New User",
  phone: "9876543210",
  role: "SUPPORT_STAFF",
  state: "Maharashtra",
  city: "Mumbai",
  address: "123 Street",
  pincode: "400001",
});

// Get users
const { data: users } = useGetAllUsers();

// Change role
const changeRoleMutation = useChangeUserRole();
await changeRoleMutation.mutateAsync({
  userId: "user-id",
  role: "DELIVERY_STAFF",
});
```

---

## Notes & Best Practices

1. **Always Use SUPER_ADMIN for Critical Operations**: Creating admins, granting permissions
2. **ADMIN for Day-to-Day**: Creating staff, managing users
3. **Store Tokens Safely**: Use httpOnly cookies (already implemented)
4. **Monitor Role Changes**: Check audit logs
5. **Prevent Privilege Escalation**: Hierarchy is enforced at backend
6. **Test Authorization**: Always test with non-admin user to ensure restrictions work
