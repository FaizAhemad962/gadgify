# Debugging the 503 Error - Step by Step

## Step 1: Check Azure App Service Logs (DO THIS FIRST)

1. Go to **Azure Portal** → Your App Service `gaddgify-Backend`
2. Click **Monitoring** → **App Service logs**
3. Turn **ON** the following:
   - Application Logging (Linux Filesystem)
   - Web server logging
   - Detailed error messages
4. Click **Save**
5. Click **Logs** tab and **Stream logs** (real-time)
6. Look for error messages when app starts

## Step 2: Check via SSH in Azure App Service

1. Go to **App Service** → **Development Tools** → **SSH**
2. Paste this to see what's deployed:

```bash
# Check if files exist
ls -la /home/site/wwwroot/
ls -la /home/site/wwwroot/dist/ || echo "❌ dist/ not found"
ls /home/site/wwwroot/dist/server.js || echo "❌ server.js not found"

# Check node_modules
ls /home/site/wwwroot/node_modules/ | wc -l

# Check package.json
cat /home/site/wwwroot/package.json

# Check environment variables
env | grep DATABASE

# Try running the app manually
cd /home/site/wwwroot
PORT=8080 timeout 5 node dist/server.js 2>&1 || true
```

## Step 3: Verify DATABASE_URL

Go to **App Service** → **Settings** → **Configuration** → Check:

```
Name: DATABASE_URL
Value: postgresql://username:password@server.postgres.database.azure.com:5432/gadgify?sslmode=require
```

It MUST exist and be correct!

## Step 4: Check PostgreSQL Firewall

Go to **PostgreSQL Server** → **Networking**:

- Add rule: Name = "Allow Azure", Start IP = 0.0.0.0, End IP = 0.0.0.0
- Or whitelist your specific App Service IP

## Step 5: Re-deploy with Debugging

Push to GitHub and watch the pipeline:

```bash
git add .github/workflows/ci.yaml
git commit -m "debug: add deployment verification"
git push origin main
```

Watch the pipeline output for:

- ✅ "dist/server.js exists"
- ✅ "✅ X files deployed"

If you see ❌ errors there, report them.

## Common Issues

### ❌ "dist/server.js NOT found!"

- Build failed silently
- tsconfig.json wrong outDir
- Check build logs in GitHub Actions

### ❌ "Cannot find module"

- node_modules not deployed
- Pipeline didn't copy node_modules
- Check GitHub Actions "Prepare deployment package" step output

### ❌ "P1002: Can't reach database server"

- DATABASE_URL not set in App Service Configuration
- PostgreSQL firewall blocking Azure
- Connection string has typo

### ❌ "listen EADDRINUSE"

- Port already in use
- Previous process didn't stop
- Fresh deployment usually fixes this

## Fastest Way to Get More Info

1. **SSH into App Service**
2. Run: `cat /home/LogFiles/2024_*/default_docker.log` (or latest date)
3. Send me the last 50 lines
