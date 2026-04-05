# Multi-Account & Monitoring System Documentation

## Overview

This system allows users to have **multiple accounts with different roles under the same email address**, plus comprehensive **audit logging and monitoring** capabilities.

---

## Features

### 1. Multi-Account Support

- ✅ One email can have multiple accounts (USER, ADMIN, SUPER_ADMIN, DELIVERY_STAFF, SUPPORT_STAFF)
- ✅ Each account has different roles and permissions
- ✅ Account name/identifier for clarity
- ✅ Seamless account switching

### 2. Audit Logging & Monitoring

- ✅ Track all login attempts
- ✅ Monitor role changes
- ✅ Track account creations
- ✅ Record failed actions
- ✅ Admin dashboard with summary stats
- ✅ Search by action, email, or date range
- ✅ Auto-cleanup of old logs

---

## Database Schema Changes

### User Model Update

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    // Multiple accounts per email
  password          String
  name              String
  role              String    @default("USER")
  accountName       String?   // e.g., "Admin Account", "Personal Account"
  // ... other fields

  @@unique([email, role])  // One role per email (but multiple roles per email possible)
}
```

### New AuditLog Model

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String   // User who performed action
  action      String   // LOGIN, ROLE_CHANGE, ACCOUNT_CREATED, etc.
  description String?  // Details about the action
  email       String   // Reference email (for tracking across changes)
  oldValue    String?  // Previous value (for updates)
  newValue    String?  // New value (for updates)
  ipAddress   String?  // IP for security tracking
  userAgent   String?  // Device/browser info
  status      String   @default("SUCCESS") // SUCCESS or FAILED
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

---

## API Endpoints

### Base URL

```
http://localhost:5000/api/accounts
```

### Multi-Account Endpoints

#### 1. Get All Accounts for Current User's Email

```http
GET /api/accounts/my-accounts
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Accounts fetched",
  "data": {
    "email": "admin@example.com",
    "totalAccounts": 2,
    "accounts": [
      {
        "id": "user-id-1",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "ADMIN",
        "accountName": "Admin Account",
        "city": "Mumbai",
        "phone": "9999999999",
        "createdAt": "2026-04-05T10:30:00Z"
      },
      {
        "id": "user-id-2",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "USER",
        "accountName": "Personal Account",
        "city": "Mumbai",
        "phone": "9999999999",
        "createdAt": "2026-04-05T10:35:00Z"
      }
    ]
  }
}
```

---

#### 2. Check if User Has Multiple Accounts

```http
GET /api/accounts/check-multiple
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Account check completed",
  "data": {
    "email": "admin@example.com",
    "hasMultipleAccounts": true,
    "totalAccounts": 2
  }
}
```

---

#### 3. Create Additional Account (Same Email)

```http
POST /api/accounts/create-additional
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "password": "NewPassword@123",
  "role": "DELIVERY_STAFF",
  "name": "Admin User",
  "phone": "9999999999",
  "city": "Mumbai",
  "state": "Maharashtra",
  "address": "999 Admin Tower, Mumbai",
  "pincode": "400050",
  "accountName": "Delivery Account"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Additional account created successfully",
  "data": {
    "id": "user-id-3",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "DELIVERY_STAFF",
    "accountName": "Delivery Account",
    "createdAt": "2026-04-05T11:00:00Z"
  }
}
```

---

### Audit Log Endpoints

#### 4. Get User's Own Audit Logs

```http
GET /api/accounts/audit-logs/my-logs?limit=50&offset=0
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Audit logs fetched",
  "data": [
    {
      "id": "log-id-1",
      "action": "LOGIN",
      "description": "Logged in with ADMIN account",
      "email": "admin@example.com",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "status": "SUCCESS",
      "timestamp": "2026-04-05T10:45:00Z"
    },
    {
      "id": "log-id-2",
      "action": "ACCOUNT_CREATED",
      "description": "New DELIVERY_STAFF account created",
      "email": "admin@example.com",
      "oldValue": null,
      "newValue": "DELIVERY_STAFF",
      "status": "SUCCESS",
      "timestamp": "2026-04-05T11:00:00Z"
    }
  ]
}
```

---

#### 5. Get Audit Logs by Email (Admin Only)

```http
GET /api/accounts/audit-logs/email/admin@example.com?limit=100&offset=0
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Email audit logs fetched",
  "data": [
    // All logs for this email across all accounts
  ]
}
```

---

#### 6. Get Audit Dashboard (Admin Only)

```http
GET /api/accounts/audit-logs/dashboard
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Audit dashboard retrieved",
  "data": {
    "totalLogs": 1250,
    "loginCount": 890,
    "roleChanges": 45,
    "accountCreations": 28,
    "failedActions": 5,
    "recentActivity": [
      {
        "id": "log-id-1",
        "action": "LOGIN",
        "email": "admin@example.com",
        "timestamp": "2026-04-05T11:15:00Z",
        "status": "SUCCESS"
      }
      // ... more recent activities
    ]
  }
}
```

---

#### 7. Get Audit Logs by Action (Admin Only)

```http
GET /api/accounts/audit-logs/action/LOGIN?limit=100&offset=0
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Audit logs for action: LOGIN",
  "data": [
    {
      "id": "log-id-1",
      "userId": "user-id-1",
      "action": "LOGIN",
      "description": "User logged in",
      "email": "admin@example.com",
      "timestamp": "2026-04-05T10:45:00Z",
      "status": "SUCCESS"
    }
    // ... more LOGIN actions
  ]
}
```

---

#### 8. Get Failed Audit Logs (Admin Only)

```http
GET /api/accounts/audit-logs/failed?limit=50&offset=0
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Failed audit logs",
  "data": [
    {
      "id": "log-id-1",
      "userId": "user-id-1",
      "action": "ROLE_CHANGE",
      "description": "Failed to change role - insufficient permissions",
      "email": "admin@example.com",
      "timestamp": "2026-04-05T11:20:00Z"
    }
  ]
}
```

---

#### 9. Get Multi-Account Statistics (Admin Only)

```http
GET /api/accounts/stats
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Multi-account statistics",
  "data": {
    "totalAccounts": 18,
    "totalUniqueEmails": 10,
    "emailsWithMultipleAccounts": 3,
    "accountsWithMultipleRoles": 8,
    "roleDistribution": [
      { "role": "USER", "count": 10 },
      { "role": "ADMIN", "count": 5 },
      { "role": "SUPER_ADMIN", "count": 2 },
      { "role": "SUPPORT_STAFF", "count": 1 }
    ]
  }
}
```

---

#### 10. Get All Accounts Grouped by Email (Admin Only)

```http
GET /api/accounts/all-accounts
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "All accounts grouped by email",
  "data": {
    "admin@example.com": [
      {
        "id": "user-id-1",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "ADMIN",
        "accountName": "Admin Account",
        "phone": "9999999999",
        "city": "Mumbai",
        "createdAt": "2026-04-05T10:30:00Z"
      },
      {
        "id": "user-id-2",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "USER",
        "accountName": "Personal Account",
        "phone": "9999999999",
        "city": "Mumbai",
        "createdAt": "2026-04-05T10:35:00Z"
      }
    ],
    "superadmin@example.com": [
      // ... all superadmin accounts
    ]
  }
}
```

---

#### 11. Clean Old Audit Logs (Super Admin Only)

```http
POST /api/accounts/audit-logs/clean
Authorization: Bearer {superadmin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "daysOld": 90
}
```

**Response:**

```json
{
  "success": true,
  "message": "Deleted 245 audit logs older than 90 days",
  "data": {
    "deletedCount": 245
  }
}
```

---

## Test Accounts (Multi-Account Demo)

Run `npm run seed` to create these test accounts:

### Admin Email (2 Accounts)

```
Email: admin@example.com
Password: password123

Account 1:
- Role: ADMIN
- Name: Admin User
- Account Name: Admin Account

Account 2:
- Role: USER
- Name: Admin User
- Account Name: Personal Account
```

### Super Admin Email (3 Accounts)

```
Email: superadmin@example.com
Password: password123

Account 1:
- Role: SUPER_ADMIN
- Name: Super Admin
- Account Name: Super Admin Account

Account 2:
- Role: ADMIN
- Name: Super Admin
- Account Name: Admin Account

Account 3:
- Role: USER
- Name: Super Admin
- Account Name: Personal Account
```

### Regular Users (Single Accounts)

```
user1@example.com / password123 (USER)
user2@example.com / password123 (USER)
user3@example.com / password123 (USER)
```

---

## Frontend Workflow

### Step 1: Login with Email & Password

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

### Step 2: Check if Multiple Accounts

```typescript
const checkMultiple = await fetch("/api/accounts/check-multiple", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await checkMultiple.json();

if (data.data.hasMultipleAccounts) {
  // Show account selector modal
}
```

### Step 3: Get All Accounts

```typescript
const getAccounts = async () => {
  const response = await fetch("/api/accounts/my-accounts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### Step 4: Account Selector Modal

```typescript
// Show dropdown with all accounts
// User selects: "Switch to ADMIN Account"
// Frontend stores new token for selected account
```

---

## Action Types for Audit Logs

| Action             | Description                    |
| ------------------ | ------------------------------ |
| LOGIN              | User logged in                 |
| LOGOUT             | User logged out                |
| LOGIN_FAILED       | Failed login attempt           |
| ROLE_CHANGED       | User's role was changed        |
| ROLE_CHANGE_FAILED | Failed role change attempt     |
| ACCOUNT_CREATED    | New account created            |
| ACCOUNT_DELETED    | Account was deleted            |
| ACCOUNT_SWITCHED   | User switched accounts         |
| PERMISSION_GRANTED | Role change permission granted |
| PERMISSION_REVOKED | Role change permission revoked |
| PASSWORD_CHANGED   | Password updated               |
| PASSWORD_RESET     | Password was reset             |

---

## Monitoring Dashboard Topics

1. **Login Activity**
   - Total logins today/week/month
   - Failed login attempts
   - Most active accounts
   - Unusual login patterns

2. **Account Management**
   - New accounts created
   - Accounts deleted
   - Role changes
   - Multi-account users

3. **Security**
   - Failed actions
   - Suspicious activities
   - Unusual IP addresses
   - Rapidly changing roles

4. **User Statistics**
   - Total users
   - Users with multiple accounts
   - Role distribution
   - Active vs inactive users

---

## Security Best Practices

1. **Account Passwords**: Each account needs its own password
2. **Session Management**: Separate JWT for each account
3. **Audit Trail**: All actions are logged with timestamps and IPs
4. **Role Hierarchy**: Cannot escalate beyond authorized level
5. **Soft Deletes**: Deleted accounts preserved in audit logs
6. **IP Tracking**: Unusual locations flagged
7. **Failed Attempts**: Tracked and monitored
8. **Data Retention**: Old logs cleaned after 90 days (configurable)

---

## Admin Monitoring Tasks

1. **Check for Suspicious Activity**

   ```
   GET /api/accounts/audit-logs/failed
   ```

2. **Monitor Role Changes**

   ```
   GET /api/accounts/audit-logs/action/ROLE_CHANGED
   ```

3. **Review New Accounts**

   ```
   GET /api/accounts/audit-logs/action/ACCOUNT_CREATED
   ```

4. **View Dashboard Summary**

   ```
   GET /api/accounts/audit-logs/dashboard
   ```

5. **Track Multi-Account Users**
   ```
   GET /api/accounts/stats
   ```

---

## Error Handling

### Email-Role Uniqueness Error

```json
{
  "success": false,
  "message": "Account with role ADMIN already exists for this email"
}
```

### Insufficient Permissions

```json
{
  "success": false,
  "message": "Access denied"
}
```

### Invalid Role

```json
{
  "success": false,
  "message": "Invalid role"
}
```

---

## Migration & Deployment

1. **Run Migration**

   ```bash
   npx prisma migrate dev --name add_multi_account_and_audit_logs
   ```

2. **Seed Test Data**

   ```bash
   npm run seed
   ```

3. **Verify Backend Builds**

   ```bash
   npm run build
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

---

## Future Enhancements

- [ ] Email notifications for suspicious activities
- [ ] IP-based account restrictions
- [ ] Two-factor authentication per account
- [ ] Account recovery/merge options
- [ ] Automatic account deactivation on multiple failed logins
- [ ] Advanced analytics dashboard
- [ ] Real-time activity streaming
- [ ] Account activity reports generation
