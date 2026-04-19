# 🔐 GADGIFY SECURITY FIXES - TODO LIST

**Status**: Ready to Start  
**Total Fixes**: 22 items across 3 phases  
**Total Time**: 20-31 hours  
**Last Updated**: April 19, 2026

---

## 📋 PHASE 1: CRITICAL FIXES (TODAY - 4-6 hours)

**Status After**: 🟠 MEDIUM RISK (critical issues mitigated)

### Critical Issue #1: Default JWT Secret

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #1)
- [ ] Add JWT_SECRET to .env.example
- [ ] Validate JWT_SECRET in config/index.ts at startup
- [ ] Test: Verify app fails to start without JWT_SECRET
- [ ] Estimated Time: 15 minutes
- **File**: backend/src/config/index.ts

### Critical Issue #2: JWT in localStorage

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #2)
- [ ] Remove JWT from localStorage in AuthContext
- [ ] Update to httpOnly cookies instead
- [ ] Update token retrieval logic in client.ts
- [ ] Test: Verify token persists in httpOnly cookie
- [ ] Test: Verify token NOT in localStorage
- [ ] Estimated Time: 2 hours
- **Files**: frontend/src/context/AuthContext.tsx, frontend/src/api/client.ts

### Critical Issue #3: CSRF Tokens in Memory

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #3)
- [ ] Install Redis client package (npm install redis)
- [ ] Setup Redis connection in backend/src/config/redis.ts
- [ ] Update CSRF middleware to use Redis store
- [ ] Test: Verify CSRF tokens persist after server restart
- [ ] Estimated Time: 3 hours
- **Files**: backend/src/middlewares/csrfProtection.ts, backend/src/config/redis.ts

### Critical Issue #4: Empty API Key Defaults

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #4)
- [ ] Add Stripe/Razorpay keys to .env.example
- [ ] Update config/index.ts to validate keys at startup
- [ ] Throw error if keys are missing/empty
- [ ] Test: Verify app fails if keys are empty
- [ ] Estimated Time: 30 minutes
- **File**: backend/src/config/index.ts

---

## 📋 PHASE 2: HIGH-RISK FIXES (THIS WEEK - 10-15 hours)

**Status After**: 🟢 LOW RISK (production ready) ✓

### High Issue #5: Weak Password Requirements

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #5)
- [ ] Update password schema to require 12+ characters
- [ ] Add requirement for uppercase, lowercase, numbers, special chars
- [ ] Update frontend validation to match
- [ ] Update i18n error messages for password requirements
- [ ] Test: Verify weak passwords are rejected
- [ ] Estimated Time: 1 hour
- **Files**: backend/src/validators/index.ts, frontend/src/components/Auth/\*

### High Issue #6: JWT Expires in 7 Days

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #6)
- [ ] Update JWT_EXPIRY from 7d to 24h
- [ ] Add refresh token logic (optional: for better UX)
- [ ] Test: Verify JWT expires after 24 hours
- [ ] Estimated Time: 15 minutes
- **File**: backend/src/config/index.ts

### High Issue #7: No Password Reset Rate Limiting

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #7)
- [ ] Add rate limiter to password reset endpoint
- [ ] Limit to 3 requests per hour per email
- [ ] Add i18n error message for rate limit
- [ ] Test: Verify rate limiting blocks after 3 requests
- [ ] Estimated Time: 1.5 hours
- **Files**: backend/src/routes/authRoutes.ts, backend/src/middlewares/rateLimit.ts

### High Issue #8: Tokens Valid After Logout

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #8)
- [ ] Setup token blacklist in Redis
- [ ] Add token to blacklist on logout
- [ ] Check blacklist on each request
- [ ] Test: Verify token is invalid after logout
- [ ] Estimated Time: 2 hours
- **Files**: backend/src/services/authService.ts, backend/src/middlewares/authenticate.ts

### High Issue #9: File MIME Type Spoofing

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #9)
- [ ] Add magic byte validation for file uploads
- [ ] Reject files with mismatched MIME/magic bytes
- [ ] Add file type whitelist
- [ ] Test: Verify spoofed files are rejected
- [ ] Estimated Time: 1.5 hours
- **File**: backend/src/middlewares/upload.ts

### High Issue #10: Console.log with Sensitive Data

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #10)
- [ ] Search for console.log in backend code
- [ ] Remove or sanitize sensitive data logs
- [ ] Use structured logging instead
- [ ] Test: Verify no sensitive data in logs
- [ ] Estimated Time: 30 minutes
- **Files**: backend/src/\*_/_.ts (grep for console.log)

### High Issue #11: Missing Content Security Policy

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #11)
- [ ] Add CSP headers to Helmet config
- [ ] Define safe sources for scripts, styles, images
- [ ] Test: Verify CSP headers are present
- [ ] Estimated Time: 1 hour
- **File**: backend/src/middlewares/security.ts

### High Issue #12: No 2FA for Admin Password Reset

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #12)
- [ ] Add 2FA verification before password reset for admins
- [ ] Use email OTP or authenticator app
- [ ] Update admin routes to require 2FA
- [ ] Test: Verify 2FA is required for admin password reset
- [ ] Estimated Time: 2 hours
- **Files**: backend/src/routes/authRoutes.ts, backend/src/services/authService.ts

---

## 📋 PHASE 3: MEDIUM-RISK FIXES (BEFORE LAUNCH - 5-8 hours)

**Status After**: 🟢 MINIMAL RISK (enterprise secure)

### Medium Issue #13: HTTPS Enforcement

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #13)
- [ ] Add HSTS header (max-age=31536000)
- [ ] Redirect HTTP to HTTPS in production
- [ ] Test: Verify HSTS header is present
- [ ] Estimated Time: 1 hour
- **File**: backend/src/middlewares/security.ts

### Medium Issue #14: Email Verification

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #14)
- [ ] Add email_verified field to User table
- [ ] Send verification email on signup
- [ ] Verify email before allowing login
- [ ] Test: Verify unverified emails cannot login
- [ ] Estimated Time: 2 hours
- **Files**: backend/prisma/schema.prisma, backend/src/services/authService.ts

### Medium Issue #15: Activity Logging

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #15)
- [ ] Add AuditLog table to Prisma schema
- [ ] Log important actions (login, password change, orders, etc.)
- [ ] Test: Verify logs are being recorded
- [ ] Estimated Time: 1.5 hours
- **Files**: backend/prisma/schema.prisma, backend/src/\*_/_.ts

### Medium Issue #16: Account Lockout Persistence

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #16)
- [ ] Move lockout info from memory to database
- [ ] Store failed attempts and lockout time
- [ ] Test: Verify lockout persists after server restart
- [ ] Estimated Time: 1 hour
- **Files**: backend/src/services/authService.ts

### Medium Issue #17: Request ID Tracing

- [ ] Read fix details in SECURITY_FIXES_IMPLEMENTATION.md (Issue #17)
- [ ] Add unique request ID to each request
- [ ] Include in logs for better tracing
- [ ] Test: Verify request IDs are in logs
- [ ] Estimated Time: 1 hour
- **File**: backend/src/middlewares/requestLogger.ts

### Medium Issue #18-22: Additional Medium Issues

- [ ] See SECURITY_COMPLETE_ISSUES_LIST.md for issues #18-22 details
- [ ] Total Time: 1-2 hours for remaining items

---

## 🧪 TESTING & VERIFICATION (1-2 hours)

### Pre-Deployment Testing

- [ ] Run `npm audit` - verify no critical vulnerabilities
- [ ] Check for hardcoded secrets: `grep -r "your-secret-key" ./`
- [ ] Test all authentication flows
- [ ] Verify security headers are present
- [ ] Test rate limiting on auth endpoints
- [ ] Verify httpOnly cookies work (curl -v test)
- [ ] Check CSRF token flow
- [ ] Verify file upload validation
- [ ] Test password reset with rate limiting
- [ ] Verify account lockout mechanism
- [ ] Test logout and token blacklist

### Security Headers Verification

- [ ] Check Content-Security-Policy header
- [ ] Check X-Frame-Options header
- [ ] Check X-Content-Type-Options header
- [ ] Check Strict-Transport-Security header
- [ ] Check X-XSS-Protection header

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Quality

- [ ] All security fixes implemented
- [ ] No console.logs with sensitive data
- [ ] No hardcoded secrets or API keys
- [ ] No plaintext passwords
- [ ] Code reviewed by 2+ team members

### Configuration

- [ ] All environment variables set
- [ ] .env.example updated with required vars
- [ ] Database migrations run
- [ ] Redis server running
- [ ] Payment keys configured

### Security

- [ ] All 4 CRITICAL issues fixed
- [ ] All 8 HIGH issues fixed (minimum)
- [ ] All MEDIUM issues fixed (optional but recommended)
- [ ] Pre-deployment checklist complete

### Testing

- [ ] Authentication flows tested
- [ ] Payment flows tested
- [ ] All endpoints tested
- [ ] Security headers verified
- [ ] Rate limiting verified
- [ ] Error messages reviewed (no sensitive data)

### Documentation

- [ ] Security fixes documented
- [ ] Configuration documented
- [ ] Migration steps documented
- [ ] Rollback procedure documented

---

## 📊 PROGRESS TRACKING

### Phase 1 Progress

- Total Items: 4
- Completed: ☐ 0/4
- Time Used: 0 / 4-6 hours
- Status: ⏳ Not Started

### Phase 2 Progress

- Total Items: 8
- Completed: ☐ 0/8
- Time Used: 0 / 10-15 hours
- Status: ⏳ Not Started

### Phase 3 Progress

- Total Items: 5+
- Completed: ☐ 0/5
- Time Used: 0 / 5-8 hours
- Status: ⏳ Not Started

### Overall Progress

```
Phase 1: ▯▯▯▯▯▯▯▯▯▯ (0%)
Phase 2: ▯▯▯▯▯▯▯▯▯▯ (0%)
Phase 3: ▯▯▯▯▯▯▯▯▯▯ (0%)
Testing: ▯▯▯▯▯▯▯▯▯▯ (0%)

Total: ▯▯▯▯▯▯▯▯▯▯ (0%)
```

---

## 🎯 QUICK START INSTRUCTIONS

### When You're Ready to Begin:

1. **Start Phase 1** (4-6 hours TODAY)

   ```
   Ask: "Help me fix the 4 CRITICAL security issues. Start with issue #1."
   ```

2. **Check Off Items as Completed**

   ```
   Edit this file and check boxes: [x] when done
   ```

3. **After Each Phase**

   ```
   Ask: "Help me verify Phase 1 is complete"
   ```

4. **Move to Next Phase**

   ```
   Ask: "Now let's start Phase 2. Help me fix issue #5."
   ```

5. **Before Deployment**
   ```
   Ask: "Help me complete the pre-deployment checklist"
   ```

---

## 📚 REFERENCE DOCUMENTS

- **SECURITY_AUDIT_REPORT.md** - Detailed analysis of each issue
- **SECURITY_FIXES_IMPLEMENTATION.md** - Code examples for each fix
- **SECURITY_CHECKLIST.md** - Quick overview
- **SECURITY_COMPLETE_ISSUES_LIST.md** - All issues in table format

---

## 📝 NOTES

- Check marks these items as you complete them
- Update time tracking as you work
- Move to next phase only after previous phase testing passes
- Use SECURITY_FIXES_IMPLEMENTATION.md as reference while coding
- All fixes must be tested before deployment

---

**Remember**: You have everything documented and ready. Just follow this list, ask for help with each fix, and you'll have an enterprise-secure application in 20-31 hours of focused work.

🚀 **Ready to get started? Ask about Phase 1 when you're ready!**
