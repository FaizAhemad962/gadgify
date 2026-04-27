# Production Configuration Fix - Login Redirect Issue

## Problem

Login is stuck between login and home routes after successful authentication on **https://www.aftechnology.com**

## Root Causes

1. ❌ `FRONTEND_URL` environment variable not set in production (defaults to `http://localhost:3000`)
2. ❌ `VITE_API_URL` in frontend still pointing to `http://localhost:5000/api`
3. ❌ Cookie `Secure` flag was hardcoded (now fixed ✅)
4. ❌ CORS failing due to origin mismatch

## Production Environment Variables Required

### Backend (.env in production)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<your_production_db_url>
JWT_SECRET=<your_jwt_secret_min_32_chars>
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://www.aftechnology.com
STRIPE_SECRET_KEY=<your_stripe_key>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
RESEND_API_KEY=<your_resend_key>
EMAIL_FROM=noreply@aftechnology.com
ADMIN_EMAIL=admin@aftechnology.com
```

### Frontend (.env in production)

```env
VITE_API_URL=https://www.aftechnology.com/api
VITE_STRIPE_PUBLIC_KEY=<your_stripe_public_key>
```

## What Was Fixed ✅

### 1. Cookie Helper Created (`backend/src/utils/cookieHelper.ts`)

- Conditionally adds `Secure` flag only in production
- Prevents cookie rejection in HTTPS production environments
- Properly formatted for httpOnly + SameSite=Strict

### 2. Auth Controller Updated

- Replaced all hardcoded `Set-Cookie` headers with `setAuthCookie()` helper
- Signup endpoint: Uses conditional Secure flag
- Login endpoint: Uses conditional Secure flag
- Logout endpoint: Uses `clearAuthCookie()` helper

## Deployment Steps

1. **Update Backend Environment Variables**
   - Set `FRONTEND_URL=https://www.aftechnology.com`
   - Verify all other env vars are set
   - Redeploy backend

2. **Update Frontend Environment Variables**
   - Set `VITE_API_URL=https://www.aftechnology.com/api` (or your actual backend domain)
   - Rebuild frontend
   - Redeploy frontend

3. **Verify HTTPS**
   - Both frontend and backend must use HTTPS
   - SSL certificates must be valid
   - Check browser DevTools → Application → Cookies to verify `authToken` is set with ✅ Secure, HttpOnly, SameSite=Strict

## Testing After Fix

1. Go to **https://www.aftechnology.com/login**
2. Enter credentials and submit
3. Check DevTools → Application → Cookies:
   - Should see `authToken` cookie with:
     - ✅ Secure ✅ HttpOnly ✅ SameSite=Strict
4. Should redirect to **https://www.aftechnology.com/** (home)
5. Page should NOT reload infinitely

## Additional Notes

- Rate limiter for login: 20 attempts per 15 minutes (per email)
- Account lockout: 5 failed attempts lock account for 15 minutes
- Session timeout: 24 hours
