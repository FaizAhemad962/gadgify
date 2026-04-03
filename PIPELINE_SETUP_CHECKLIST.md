# 🚀 Pipeline Setup Checklist

## Step 1: Create GitHub Secrets (5 minutes)

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

### Create These Secrets:

```
Name: AZURE_SUBSCRIPTION_ID
Value: Your subscription ID from Azure Portal

Name: AZURE_TENANT_ID
Value: Your tenant ID from Azure AD

Name: AZURE_CLIENT_ID
Value: Service Principal App ID

Name: AZURE_CLIENT_SECRET
Value: Service Principal secret

Name: DATABASE_URL
Value: postgresql://username:password@server.postgres.database.azure.com:5432/gadgify?sslmode=require

Name: JWT_SECRET
Value: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: Your Stripe public key (pk_test_...)
```

### Create These Variables:

```
Name: VITE_API_URL
Value: https://gaddgify-backend.azurewebsites.net/api
```

## Step 2: Create Azure Service Principal (5 minutes)

Run this command:

```bash
az login
az ad sp create-for-rbac \
  --name "gadgify-github-actions" \
  --role Contributor \
  --scopes /subscriptions/{YOUR-SUBSCRIPTION-ID}
```

Copy the output values:

- `clientId` → `AZURE_CLIENT_ID`
- `clientSecret` → `AZURE_CLIENT_SECRET`
- `tenantId` → `AZURE_TENANT_ID`

## Step 3: Verify App Service Settings (5 minutes)

Go to **Azure Portal** → `gaddgify-Backend` App Service → **Settings** → **Configuration**

Verify these are set:

- ✅ `DATABASE_URL` (must match your secret)
- ✅ `NODE_ENV` = `production`
- ✅ `FRONTEND_URL` = your React app URL
- ✅ `JWT_SECRET` (same as GitHub secret)

## Step 4: Test the Pipeline

1. Go to GitHub → **Actions** tab
2. Make a small change to `backend/src/server.ts` (like add a comment)
3. Commit and push to main
4. Watch the pipeline run:
   - ✅ Frontend builds
   - ✅ Backend builds
   - ✅ Frontend deploys
   - ✅ Backend deploys
   - ✅ Migrations run
   - ✅ Health check passes

## Step 5: Verify Deployment

Once pipeline succeeds:

```bash
curl https://gaddgify-backend.azurewebsites.net/health
```

Should return:

```json
{
  "status": "UP",
  "database": "connected",
  "uptime": 123
}
```

---

## ⚠️ If Pipeline Fails

### "Health check failed"

- Check: `https://portal.azure.com` → App Service Logs
- Check: PostgreSQL firewall allows Azure services
- Run manually: SSH into app and run `npx prisma migrate deploy`

### "Login to Azure failed"

- Verify Service Principal has Contributor role
- Verify `AZURE_CLIENT_SECRET` is set correctly

### "Deploy failed"

- Check: Correct app name (`gaddgify-Backend`)
- Check: Dist folder exists after build

---

## ✅ You're Done!

From now on:

- Push to main → Pipeline automatically builds & deploys
- Database migrations run automatically
- Health is verified automatically

No more manual steps needed! 🎉
