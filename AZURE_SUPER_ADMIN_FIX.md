# Azure Backend - Super Admin Setup Guide

## Problem

After migration to Azure, no super admin account was created. All registered users have the "USER" role.

## Solution

### Quick Fix: Run Setup Script

In Azure (SSH into the backend container):

```bash
# Navigate to backend directory
cd /home/site/wwwroot

# Run the setup script to create/verify super admin
npm run setup:admin
```

### Expected Output

```
🔐 Setting up Super Admin account...
✅ Super Admin account created successfully!
📊 Super Admin Details:
   📧 Email: super-admin@gadgify.com
   🔑 Password: super-admin9606@
   👤 Name: Super Admin
   📞 Phone: 9000000000
   🏙️  City: Mumbai
   🔐 Role: SUPER_ADMIN

⚠️  WARNING: Change this password immediately after first login!
```

---

## Full Seeding Process

If you need to reset the entire database with seed data:

```bash
# 1. Run migrations (if not already done)
npm run prisma:migrate

# 2. Run seed (creates products + super admin)
npm run seed

# 3. Verify super admin was created
npm run setup:admin
```

---

## Manual Database Check

If you want to verify super admin in the database:

```bash
# Open Prisma Studio (if available in your environment)
npm run prisma:studio

# Or query directly in Azure database explorer
# Look for user with email: super-admin@gadgify.com
# Should have role: SUPER_ADMIN
```

---

## Super Admin Login Credentials

After setup, use these to login:

- **Email**: `super-admin@gadgify.com`
- **Password**: `super-admin9606@`

⚠️ **IMPORTANT**: Change this password immediately after your first login for security!

---

## If Script Still Fails

1. **Check database connection**:

   ```bash
   npm run prisma:studio
   # If this opens successfully, DB connection is fine
   ```

2. **Check environment variables**:

   ```bash
   # Verify DATABASE_URL is set correctly
   echo $DATABASE_URL
   ```

3. **Check user table permissions**:
   - Ensure the database user has `INSERT` permission on the `users` table

4. **Manual creation via Prisma Studio**:
   - Open `npm run prisma:studio`
   - Navigate to `User` model
   - Click `+` to add new record
   - Fill in details with email: `super-admin@gadgify.com`

---

## File Changes Made

1. **`backend/src/setup-super-admin.ts`** (NEW)
   - Standalone script to create/verify super admin
   - Can be run anytime after migration

2. **`backend/src/seed.ts`** (UPDATED)
   - Added error handling for cleanup
   - Checks if super admin already exists before creating
   - Won't fail if super admin already present

3. **`backend/package.json`** (UPDATED)
   - Added `npm run setup:admin` command

---

## Next Steps

1. Run `npm run setup:admin` to create super admin
2. Login with the credentials above
3. Change the password immediately
4. Create additional admin accounts as needed
5. Promote team members to appropriate roles (ADMIN, SUPPORT_STAFF, DELIVERY_STAFF, etc.)
