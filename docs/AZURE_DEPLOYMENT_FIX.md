# Azure Deployment - 503 Service Unavailable Fix

## Quick Checklist (Do This First)

### Step 1: Set Database Environment Variables in Azure

1. Go to **Azure Portal** → Your App Service → **Settings** → **Configuration**
2. Add these **Application Settings**:

   ```
   DATABASE_URL = postgresql://username:password@servername.postgres.database.azure.com:5432/gadgify?sslmode=require
   NODE_ENV = production
   FRONTEND_URL = https://your-react-app.azurewebsites.net
   JWT_SECRET = (generate a strong random string)
   RAZORPAY_KEY_ID = (your key)
   RAZORPAY_KEY_SECRET = (your key)
   STRIPE_SECRET_KEY = (your key)
   ```

3. **Important**: Click **Save** at the top after adding variables
4. The app will automatically restart

### Step 2: PostgreSQL Firewall - Allow Azure Services

1. Go to **Azure Portal** → Your PostgreSQL Server
2. Click **Server parameters** or **Networking**
3. Under **Firewall rules**, add:
   - **Rule Name**: `Allow Azure Services`
   - **Start IP**: `0.0.0.0`
   - **End IP**: `0.0.0.0`
4. Click **Save**

### Step 3: Run Database Migrations

**For first deployment**, run migrations in your App Service:

1. Go to **App Service** → **SSH** (or use Cloud Shell)
2. Run:
   ```bash
   cd /home/site/wwwroot
   npx prisma migrate deploy
   ```

### Step 4: Check Logs and Health

1. Check health endpoint:

   ```
   https://your-app.southindia-01.azurewebsites.net/health
   ```

   Should return:

   ```json
   {
     "status": "UP",
     "database": "connected",
     "uptime": 123
   }
   ```

2. View logs:
   - **Azure Portal** → App Service → **Monitoring** → **App Service logs** (turn ON)
   - **Azure Portal** → App Service → **Logs** → **Stream logs**
   - Or use App Insights

### Step 5: Format DATABASE_URL for Azure PostgreSQL

Your `DATABASE_URL` should use this format:

```
postgresql://username@servername:password@servername.postgres.database.azure.com:5432/gadgify?sslmode=require
```

**Or** if you're using `user` format:

```
postgresql://user@servername:password@servername.postgres.database.azure.com:5432/gadgify?sslmode=require
```

---

## Common Errors & Fixes

### Error: "P1002: Can't reach database server"

- **Cause**: DATABASE_URL not set OR PostgreSQL firewall blocking
- **Fix**:
  1. Verify DATABASE_URL in Azure App Service Configuration
  2. Add `0.0.0.0 - 0.0.0.0` to PostgreSQL firewall rules
  3. Test connection string locally first

### Error: "Migrations not run"

- **Cause**: Prisma schema changes not deployed
- **Fix**: Run `npx prisma migrate deploy` in App Service SSH

### Error: "Connection pool exhausted"

- **Cause**: Too many concurrent connections
- **Fix**: Check `prisma/.env` has proper connection pooling config

### Status: 503, database: "disconnected"

- **App started but can't reach DB**
- Check:
  1. DATABASE_URL is set in App Service Configuration
  2. PostgreSQL firewall rules
  3. SSL mode is `require` in connection string

---

## package.json Build & Start Scripts

Ensure your `package.json` has:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate"
  }
}
```

And your `tsconfig.json` compiles to:

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

---

## Testing Locally Before Azure

1. Create `.env.production` locally:

   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   FRONTEND_URL=http://localhost:3000
   ```

2. Build: `npm run build`
3. Start: `npm start`
4. Test: `curl http://localhost:5000/health`

---

## Debugging in Azure

### Enable Application Insights (Recommended)

1. App Service → **Monitoring** → **Application Insights**
2. Click **Enable**
3. Wait 5 minutes
4. View logs in **Logs** tab

### Stream Logs in Real-Time

```bash
az webapp log tail --name your-app-name --resource-group your-rg-name
```

### SSH into App Service

```bash
# List files to verify deployment
ls -la /home/site/wwwroot

# Check logs
cat /home/site/wwwroot/logs/error.log
cat /home/site/wwwroot/logs/combined.log
```

---

## Need More Help?

1. Check if health endpoint works: `GET /health`
2. Review logs for specific error messages
3. Verify all environment variables are set
4. Test DATABASE_URL locally with psql or DBeaver
5. Check PostgreSQL server logs in Azure Portal
