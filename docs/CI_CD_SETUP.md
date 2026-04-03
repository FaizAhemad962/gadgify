# GitHub Actions CI/CD Pipeline Setup

## Secrets & Variables Required

### 1. Azure Authentication Secrets

Add these to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name             | Value                           | Where to Find                                             |
| ----------------------- | ------------------------------- | --------------------------------------------------------- |
| `AZURE_SUBSCRIPTION_ID` | Your Azure Subscription ID      | Azure Portal → Home → Subscriptions                       |
| `AZURE_TENANT_ID`       | Azure Tenant ID / Directory ID  | Azure Portal → Azure AD → Properties                      |
| `AZURE_CLIENT_ID`       | Service Principal App ID        | Azure Portal → App registrations                          |
| `AZURE_CLIENT_SECRET`   | Service Principal Client Secret | Azure Portal → App registrations → Certificates & secrets |

### 2. Database & API Secrets

| Secret Name                   | Value                         | Example                                                                                  |
| ----------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string  | `postgresql://user:pass@server.postgres.database.azure.com:5432/gadgify?sslmode=require` |
| `JWT_SECRET`                  | Generate strong random string | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`               |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key             | `pk_test_...`                                                                            |

### 3. Variables (Non-sensitive)

Add these to **Settings** → **Secrets and variables** → **Actions** → **New variable**:

| Variable Name  | Value                                            |
| -------------- | ------------------------------------------------ |
| `VITE_API_URL` | `https://gaddgify-backend.azurewebsites.net/api` |

---

## How to Create Azure Service Principal

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac \
  --name "gadgify-github-actions" \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}
```

Output will contain:

- `clientId` → `AZURE_CLIENT_ID`
- `clientSecret` → `AZURE_CLIENT_SECRET`
- `tenantId` → `AZURE_TENANT_ID`
- `subscriptionId` → `AZURE_SUBSCRIPTION_ID`

---

## Pipeline Flow

```
Push to main
    ↓
├─ Build Frontend (lint, test optional)
│  └─ Deploy Frontend to Azure
│
└─ Build Backend (Prisma generate, TypeScript)
   └─ Deploy Backend to Azure
      └─ Run Migrations (npx prisma migrate deploy)
         └─ Health Check (retry 30x until /health returns 200)
            └─ Success! ✅
```

---

## What the Pipeline Does

### Build Stage (Runs Parallel)

- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Build TypeScript → JavaScript

### Deploy Stage (Sequential)

1. **Frontend**: Deploy dist folder to `gadgify-ui`
2. **Backend**:
   - Deploy dist folder to `gaddgify-Backend`
   - Apply Prisma migrations automatically
   - Verify health endpoint responds with database connected
   - If health check fails, deployment is marked as failed

### Automatic Rollback

If health check fails 30 times (60 seconds), the pipeline fails and alerts you.

---

## Monitoring Deployments

1. **GitHub Actions Tab**
   - View pipeline logs in real-time
   - See exact error if migrations fail

2. **Azure Portal**
   - App Service → Deployments tab
   - View deployment history

3. **Application Insights** (Recommended)
   - Configure in App Service → Monitoring → Application Insights
   - Track errors and performance in real-time

---

## Manual Migrations (If Pipeline Fails)

SSH into App Service:

```bash
cd /home/site/wwwroot
npx prisma migrate deploy
```

---

## Troubleshooting Pipeline Failures

### ❌ "Health check failed"

- Database connection issue
- Check: `VITE_API_URL` env variable in App Service
- Check: PostgreSQL firewall allows Azure App Service

### ❌ "Deployment slot config failed"

- Service Principal doesn't have Contributor role
- Regenerate with: `az ad sp create-for-rbac --role Contributor`

### ❌ "Build failed"

- TypeScript errors
- Missing environment variables during build
- Check: All build-time variables in secrets

### ❌ "Prisma migration failed"

- Schema mismatch
- Database doesn't exist
- Manually verify and run: `npx prisma migrate deploy`

---

## Customization

### Change App Names

Edit `ci.yaml`:

```yaml
- name: Deploy Backend to Azure
  with:
    app-name: your-actual-app-name # Change this
    package: ./backend/dist
```

### Change Health Check Timeout

Edit `ci.yaml`:

```yaml
- name: Health Check
  run: |
    MAX_ATTEMPTS=60    # Increase for slower deploys
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```
