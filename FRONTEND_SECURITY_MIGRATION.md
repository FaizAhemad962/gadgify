# Frontend Security Update Guide - httpOnly Cookies Migration

**Updated**: April 19, 2026  
**Status**: READY FOR IMPLEMENTATION  
**Estimated Time**: 2-3 hours

---

## 🔄 What Changed on Backend

The backend now **automatically manages authentication tokens in httpOnly cookies**:

✅ **What the browser does automatically**:

- Sends httpOnly cookies with every request
- Prevents JavaScript from accessing tokens (XSS protection)
- Clears cookies on logout
- Respects cookie expiration

❌ **What the frontend should NOT do anymore**:

- Store tokens in `localStorage`
- Set `Authorization` headers manually
- Manage token refresh in code
- Pass tokens between components

---

## 📝 Migration Steps

### 1. Update AuthContext.tsx

**REMOVE** all localStorage token management:

```typescript
// ❌ REMOVE THIS:
localStorage.setItem("token", newToken);
localStorage.removeItem("token");

// ❌ REMOVE THIS:
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
```

**KEEP** user persistence only:

```typescript
// ✅ KEEP THIS (user info only):
localStorage.setItem("user", JSON.stringify(newUser));
localStorage.removeItem("user");

// ✅ KEEP THIS (for user data, not token):
const storedUser = localStorage.getItem("user");
```

**Here's the updated AuthContext structure**:

```typescript
import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void; // ✅ User only, no token
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasAdminAccess: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load user from localStorage (NOT token)
const getStoredAuth = () => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    return { user: JSON.parse(storedUser) as User };
  }
  return { user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    // ✅ Token is in httpOnly cookie - no need to store here
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // ✅ Cookie is cleared by server on /logout endpoint
  };

  const getRoleFlags = (userRole: string | undefined) => {
    return {
      isAdmin: userRole === "ADMIN" || userRole === "SUPER_ADMIN",
      isSuperAdmin: userRole === "SUPER_ADMIN",
      isStaff: userRole === "DELIVERY_STAFF" || userRole === "SUPPORT_STAFF",
    };
  };

  const flags = getRoleFlags(user?.role);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: flags.isAdmin,
    isSuperAdmin: flags.isSuperAdmin,
    hasAdminAccess: flags.isAdmin,
    isStaff: flags.isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

---

### 2. Update Login/Signup API Calls

**BEFORE** (old way with token in response):

```typescript
export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  return {
    token: data.token, // ❌ OLD: Token was in response
    user: data.user,
  };
};
```

**AFTER** (new way with httpOnly cookies):

```typescript
export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ IMPORTANT: Send/receive cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // ✅ Token is now in httpOnly cookie (automatic)
  return {
    user: data.user,
    // No token in response anymore
  };
};
```

---

### 3. Update All API Calls

Add `credentials: "include"` to all authenticated requests:

**BEFORE**:

```typescript
const res = await fetch(`${API_URL}/orders`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`, // ❌ Manually managing token
  },
});
```

**AFTER**:

```typescript
const res = await fetch(`${API_URL}/orders`, {
  method: "GET",
  credentials: "include", // ✅ Browser automatically sends cookie
  // ❌ No Authorization header needed
});
```

**All fetch calls in these files need updating**:

- `frontend/src/api/auth.ts`
- `frontend/src/api/orders.ts`
- `frontend/src/api/products.ts`
- `frontend/src/api/cart.ts`
- `frontend/src/api/wishlist.ts`
- etc. (all files that make authenticated requests)

**Pattern for all API functions**:

```typescript
// ✅ Correct pattern:
export const fetchUserOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, {
    method: "GET",
    credentials: "include", // ✅ Essential for httpOnly cookies
  });

  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};
```

---

### 4. Update Logout

**BEFORE**:

```typescript
export const logoutUser = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
```

**AFTER**:

```typescript
export const logoutUser = async () => {
  // ✅ Call logout endpoint to clear httpOnly cookie
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", // ✅ Important
  });

  // ✅ Only remove user from localStorage
  localStorage.removeItem("user");
};
```

---

### 5. Update React Query Hooks

If using React Query with custom headers:

**BEFORE**:

```typescript
const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`, // ❌ Remove this
        },
      });
      return res.json();
    },
  });
};
```

**AFTER**:

```typescript
const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/orders`, {
        credentials: "include", // ✅ Add this
      });
      return res.json();
    },
  });
};
```

---

### 6. CORS Configuration

The backend already has CORS configured to accept cookies:

```typescript
cors({
  origin: config.frontendUrl,
  credentials: true, // ✅ This allows cookies
});
```

Make sure your frontend's API calls include `credentials: "include"`.

---

## 🧪 Testing Checklist

### Test Login Flow:

- [ ] User can log in successfully
- [ ] User data displays correctly
- [ ] No "token is null" errors
- [ ] Browser Dev Tools → Application → Cookies shows `authToken` (httpOnly)
- [ ] Network tab shows cookie sent with requests

### Test Logout Flow:

- [ ] User can log out successfully
- [ ] User data is cleared
- [ ] `authToken` cookie is deleted
- [ ] User redirected to login page

### Test Protected Routes:

- [ ] Can access `/profile` without errors
- [ ] Can access `/orders` without errors
- [ ] Can create orders
- [ ] Can update profile
- [ ] API calls succeed with 200 status

### Test Error Handling:

- [ ] Invalid credentials show proper error
- [ ] Expired token redirects to login
- [ ] Network error shows user-friendly message
- [ ] No JavaScript errors in console

---

## ⚠️ Common Issues & Fixes

### Issue: "Credentials are not included"

**Error**: API calls fail even though user is logged in

**Fix**: Add `credentials: "include"` to **ALL** fetch calls

```typescript
// ❌ Wrong
const res = await fetch(url, { method: "GET" });

// ✅ Correct
const res = await fetch(url, { method: "GET", credentials: "include" });
```

---

### Issue: "Cookie is not being set"

**Possible Causes**:

- Backend not sending Set-Cookie header correctly
- Missing `credentials: "include"` in fetch
- HTTPS not configured (cookies need Secure flag in production)

**Debug**:

```bash
# In browser DevTools, check Network tab:
# 1. Find login request
# 2. Response Headers should show: Set-Cookie: authToken=...
# 3. Application tab → Cookies should show authToken
```

---

### Issue: "X-CSRF-Token error"

**If using CSRF protection**:

```typescript
// Get CSRF token from meta tag or request header
const getCsrfToken = () => {
  return document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
};

// Add to POST/PUT/DELETE requests
const res = await fetch(url, {
  method: "POST",
  credentials: "include",
  headers: {
    "X-CSRF-Token": getCsrfToken(),
  },
  body: JSON.stringify(data),
});
```

---

## 📚 Files to Update

**Priority Order**:

1. `frontend/src/context/AuthContext.tsx` - Remove token storage
2. `frontend/src/api/auth.ts` - Update login/signup/logout
3. `frontend/src/hooks/useAuth.ts` - Add credentials to fetch calls
4. `frontend/src/api/orders.ts` - Add credentials to all requests
5. `frontend/src/api/products.ts` - Add credentials
6. `frontend/src/api/cart.ts` - Add credentials
7. `frontend/src/api/wishlist.ts` - Add credentials
8. `frontend/src/api/admin.ts` - Add credentials
9. Any custom fetch wrapper - Update defaults
10. All React Query hooks - Add credentials

---

## ✅ Verification Checklist

After all changes:

```bash
# 1. No TypeScript errors
npm run lint

# 2. No console errors about missing token
npm run dev
# Open browser console - should be clean

# 3. Can log in and access protected pages
# 4. Can log out
# 5. Can perform authenticated actions (order, profile update)
# 6. Cookie visible in Dev Tools → Application → Cookies
```

---

## 🚀 Benefits You're Getting

| Before                              | After                              |
| ----------------------------------- | ---------------------------------- |
| ❌ Token in localStorage (XSS risk) | ✅ Token in httpOnly cookie (safe) |
| ❌ Manual token management          | ✅ Browser handles automatically   |
| ❌ Token visible in DevTools        | ✅ Token hidden from JavaScript    |
| ❌ Complex auth code                | ✅ Simple, cleaner code            |
| ❌ Vulnerable to XSS attacks        | ✅ Protected from XSS              |

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Network tab to see if cookies are being sent
3. Verify `credentials: "include"` is in all fetch calls
4. Test API directly with cURL to ensure backend works:

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Cookie: authToken=your-token-here"
```

---

**Remember**: The browser now handles all cookie management automatically. You just need to:

1. Add `credentials: "include"` to fetch calls
2. Remove manual token handling
3. Trust the browser and httpOnly cookies to protect your tokens

This is the **secure, industry-standard approach** used by major web applications.
