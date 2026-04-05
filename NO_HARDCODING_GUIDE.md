# 🔧 No Hardcoding - Configuration & Database First

**Principle**: All values should come from configuration, database, or environment variables  
**Status**: Guidelines for current and future development

---

## ❌ HARDCODING - WRONG WAY

```typescript
// ❌ WRONG: Hardcoded role names
if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
  // ...
}

// ❌ WRONG: Hardcoded prices/discounts
const discount = 100; // For all products
const taxRate = 0.18; // Always 18%

// ❌ WRONG: Hardcoded limits
if (password.length < 8) {
  // Magic number
  throw new Error("Too short");
}

// ❌ WRONG: Hardcoded colors
const roleColor = user.role === "ADMIN" ? "#ff9800" : "#1976d2";

// ❌ WRONG: Hardcoded email templates
const email = "Your order was placed!"; // In code

// ❌ WRONG: Hardcoded feature flags
if (currentDate.getMonth() === 11) {
  // December sales
  applyDiscount();
}

// ❌ WRONG: Hardcoded delivery charges
const shipping = 50; // For all orders

// ❌ WRONG: Hardcoded timezones/currencies
const currency = "INR";
```

---

## ✅ CORRECT WAY - Configuration & Database

### 1. **Environment Variables** (.env)

```bash
# .env.local / .env.production

# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_URL=https://api.gadgify.com

# Feature Flags
VITE_ENABLE_DELIVERY_TRACKING=true
VITE_ENABLE_LIVE_CHAT=false
VITE_ENABLE_REFERRAL_PROGRAM=false

# Payments
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxx

# Limits
VITE_PASSWORD_MIN_LENGTH=8
VITE_PRODUCT_REVIEW_MIN_LENGTH=10

# Business rules
VITE_GST_RATE=0.18
VITE_MIN_ORDER_VALUE=0
VITE_FREE_SHIPPING_ABOVE=500

# Localization
VITE_DEFAULT_CURRENCY=INR
VITE_DEFAULT_TIMEZONE=Asia/Kolkata
VITE_SUPPORTED_LANGUAGES=en,hi,mr

# Timeouts
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_OTP_VALIDITY_MINUTES=5

# Rate limiting
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_RATE_LIMIT_WINDOW_MINUTES=15
```

**Backend .env:**

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gadgify

# Security
JWT_SECRET=your-secret-key-from-secrets-manager
JWT_EXPIRY=24h
BCRYPT_ROUNDS=10

# Email
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=noreply@gadgify.com
SMTP_PASSWORD=secret-from-vault

# Payment Keys (From vault, NEVER in git)
STRIPE_SECRET_KEY=sk_test_xxx
RAZORPAY_KEY_SECRET=rzp_secret_xxx

# Business Rules
GST_RATE=0.18
DELIVERY_CHARGE=50
FREE_DELIVERY_ABOVE=500

# Feature Flags
ENABLE_DELIVERY_TRACKING=true
ENABLE_SUPPORT_TICKETS=true
ENABLE_REFERRAL_PROGRAM=false

# Limits
MAX_LOGIN_ATTEMPTS=5
SESSION_TIMEOUT_MINUTES=30
PASSWORD_MIN_LENGTH=8
```

---

### 2. **Constants Files** (For App-Level Defaults)

#### Frontend: `src/constants/config.ts`

```typescript
/**
 * Application Configuration Constants
 * Values that change per environment should use .env
 * Values that are truly constant go here
 */

// ✅ CORRECT: Get from env
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const PASSWORD_MIN_LENGTH = parseInt(
  import.meta.env.VITE_PASSWORD_MIN_LENGTH || "8",
);
export const GST_RATE = parseFloat(import.meta.env.VITE_GST_RATE || "0.18");
export const MIN_ORDER_VALUE = parseFloat(
  import.meta.env.VITE_MIN_ORDER_VALUE || "0",
);
export const FREE_SHIPPING_ABOVE = parseFloat(
  import.meta.env.VITE_FREE_SHIPPING_ABOVE || "500",
);

// ✅ Business rules stored in DB
export const BUSINESS_CONFIG_TABLE = "BusinessConfiguration";

// ✅ Role constants (from database, not hardcoded)
export const VALID_ROLES = [
  "USER",
  "DELIVERY_STAFF",
  "SUPPORT_STAFF",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

// ✅ API timeout (standard, unlikely to change)
export const API_TIMEOUT_MS = 30000;

// ✅ Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
```

#### Backend: `src/constants/config.ts`

```typescript
import { config } from "dotenv";

config();

export const DATABASE_URL = process.env.DATABASE_URL!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10");
export const GST_RATE = parseFloat(process.env.GST_RATE || "0.18");
export const DELIVERY_CHARGE = parseFloat(process.env.DELIVERY_CHARGE || "50");
export const FREE_DELIVERY_ABOVE = parseFloat(
  process.env.FREE_DELIVERY_ABOVE || "500",
);
export const MAX_LOGIN_ATTEMPTS = parseInt(
  process.env.MAX_LOGIN_ATTEMPTS || "5",
);
export const SESSION_TIMEOUT_MINUTES = parseInt(
  process.env.SESSION_TIMEOUT_MINUTES || "30",
);

// Feature flags from env
export const FEATURES = {
  DELIVERY_TRACKING: process.env.ENABLE_DELIVERY_TRACKING === "true",
  SUPPORT_TICKETS: process.env.ENABLE_SUPPORT_TICKETS === "true",
  REFERRAL_PROGRAM: process.env.ENABLE_REFERRAL_PROGRAM === "true",
  LIVE_CHAT: process.env.ENABLE_LIVE_CHAT === "true",
};
```

---

### 3. **Database Configuration Tables** (For Runtime Changes)

#### Schema: `prisma/schema.prisma`

```prisma
model BusinessConfiguration {
  id            String    @id @default(uuid())
  key           String    @unique
  value         String    // Stored as JSON string for flexibility
  dataType      String    @default("string") // "string", "number", "boolean", "json"
  description   String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?   // User ID who changed it

  @@map("business_configurations")
}

model FeatureFlag {
  id            String    @id @default(uuid())
  name          String    @unique
  description   String?
  isEnabled     Boolean   @default(false)
  percentage    Int       @default(100) // For gradual rollout (1-100)
  targetRoles   String?   // JSON array: ["ADMIN", "SUPER_ADMIN"]
  targetUsers   String?   // JSON array: ["user_id_1", "user_id_2"]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  enabledAt     DateTime?
  disabledAt    DateTime?

  @@map("feature_flags")
}

model SystemSettings {
  id                    String    @id @default(uuid())
  companyName           String
  companyEmail          String
  supportEmail          String
  taxRate              Float     @default(0.18)
  defaultCurrency      String    @default("INR")
  defaultTimezone      String    @default("Asia/Kolkata")
  minOrderValue        Float     @default(0)
  deliveryCharge       Float     @default(50)
  freeDeliveryAbove    Float     @default(500)
  smsProvider          String?   // "twilio", "aws_sns", etc.
  emailProvider        String?   // "resend", "sendgrid", etc.
  paymentGateway       String?   // "stripe", "razorpay"
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@map("system_settings")
}

model RolePermission {
  id              String    @id @default(uuid())
  role            String    @unique
  canCreateUsers  Boolean   @default(false)
  canManageOrders Boolean   @default(false)
  canViewAnalytics Boolean  @default(false)
  permissions     String    // JSON: ["create:products", "read:orders", ...]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("role_permissions")
}
```

#### Backend Service: `src/services/configService.ts`

```typescript
import prisma from "../config/database";

export class ConfigService {
  // Get business config value
  static async getConfig(key: string, defaultValue?: any) {
    const config = await prisma.businessConfiguration.findUnique({
      where: { key },
    });

    if (!config) return defaultValue;

    // Parse JSON if needed
    if (config.dataType === "number") return parseFloat(config.value);
    if (config.dataType === "boolean") return config.value === "true";
    if (config.dataType === "json") return JSON.parse(config.value);

    return config.value;
  }

  // Get all settings
  static async getSystemSettings() {
    return prisma.systemSettings.findFirst();
  }

  // Update config (needs SUPER_ADMIN)
  static async updateConfig(
    key: string,
    value: any,
    dataType: string,
    userId: string,
  ) {
    return prisma.businessConfiguration.upsert({
      where: { key },
      create: {
        key,
        value: String(value),
        dataType,
        createdBy: userId,
      },
      update: {
        value: String(value),
        dataType,
        createdBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  // Check if feature is enabled
  static async isFeatureEnabled(
    featureName: string,
    userRole?: string,
    userId?: string,
  ) {
    const flag = await prisma.featureFlag.findUnique({
      where: { name: featureName },
    });

    if (!flag || !flag.isEnabled) return false;

    // Check role restriction
    if (userRole && flag.targetRoles) {
      const allowedRoles = JSON.parse(flag.targetRoles);
      if (!allowedRoles.includes(userRole)) return false;
    }

    // Check user restriction
    if (userId && flag.targetUsers) {
      const allowedUsers = JSON.parse(flag.targetUsers);
      if (!allowedUsers.includes(userId)) return false;
    }

    // Check percentage rollout
    if (flag.percentage < 100) {
      const userHash = parseInt(userId?.slice(0, 8) || "0", 16);
      const isIncluded = userHash % 100 < flag.percentage;
      if (!isIncluded) return false;
    }

    return true;
  }
}
```

#### Frontend Hook: `src/hooks/useConfig.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export const useConfig = (key: string, defaultValue?: any) => {
  return useQuery({
    queryKey: ["config", key],
    queryFn: async () => {
      const { data } = await apiClient.get(`/config/${key}`);
      return data.value ?? defaultValue;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useFeatureFlag = (featureName: string) => {
  return useQuery({
    queryKey: ["feature-flag", featureName],
    queryFn: async () => {
      const { data } = await apiClient.get(`/feature-flags/${featureName}`);
      return data.isEnabled;
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};
```

---

### 4. **API Endpoints for Dynamic Configuration**

#### Backend Routes: `src/routes/configRoutes.ts`

```typescript
import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { ConfigService } from "../services/configService";

const router = Router();

// Public: Get config values (cached heavily)
router.get("/config/:key", async (req, res) => {
  try {
    const value = await ConfigService.getConfig(req.params.key);
    res.json({ success: true, data: { value } });
  } catch (error) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Public: Check feature flag
router.get("/feature-flags/:name", async (req, res) => {
  try {
    const isEnabled = await ConfigService.isFeatureEnabled(
      req.params.name,
      req.user?.role,
      req.user?.id,
    );
    res.json({ success: true, data: { isEnabled } });
  } catch (error) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Super Admin: Update config
router.post(
  "/config/:key",
  authenticate,
  authorize("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { value, dataType } = req.body;
      const result = await ConfigService.updateConfig(
        req.params.key,
        value,
        dataType || "string",
        req.user!.id,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error?.message });
    }
  },
);

export default router;
```

---

### 5. **Using Configuration in Code**

#### ❌ WRONG: Hardcoded

```typescript
// Controller
export const createOrder = async (req: AuthRequest, res: Response) => {
  const shipping = 50; // HARDCODED
  const tax = 0.18; // HARDCODED
  const minOrder = 0; // HARDCODED

  const total = calculate(order.total, shipping, tax);
  // ...
};
```

#### ✅ CORRECT: From Config

```typescript
// Controller
import { ConfigService } from "../services/configService";

export const createOrder = async (req: AuthRequest, res: Response) => {
  // Get values from database/config
  const deliveryCharge = await ConfigService.getConfig("delivery_charge", 50);
  const taxRate = await ConfigService.getConfig("tax_rate", 0.18);
  const minOrderValue = await ConfigService.getConfig("min_order_value", 0);

  if (order.subtotal < minOrderValue) {
    throw new Error(`Minimum order value is ₹${minOrderValue}`);
  }

  const tax = order.subtotal * taxRate;
  const total = order.subtotal + tax + deliveryCharge;
  // ...
};
```

---

### 6. **Admin Panel for Configuration**

#### Frontend Page: `src/pages/admin/SystemConfiguration.tsx`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function SystemConfiguration() {
  const { isSuperAdmin } = useAuth();

  // Show config UI for SUPER_ADMIN only
  if (!isSuperAdmin) {
    return <Typography>Access denied</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Configuration
      </Typography>

      <ConfigField
        label="GST Rate (%)"
        configKey="tax_rate"
        type="number"
      />

      <ConfigField
        label="Delivery Charge (₹)"
        configKey="delivery_charge"
        type="number"
      />

      <ConfigField
        label="Free Delivery Above (₹)"
        configKey="free_delivery_above"
        type="number"
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5">Feature Flags</Typography>
        <FeatureFlagToggle name="DELIVERY_TRACKING" />
        <FeatureFlagToggle name="SUPPORT_TICKETS" />
        <FeatureFlagToggle name="REFERRAL_PROGRAM" />
      </Box>
    </Box>
  );
}

function ConfigField({ label, configKey, type }: any) {
  const { data: value } = useQuery({
    queryKey: ['config', configKey],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/config/${configKey}`);
      return data.value;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newValue: any) => {
      await apiClient.post(`/api/config/${configKey}`, {
        value: newValue,
        dataType: type,
      });
    },
  });

  return (
    <TextField
      label={label}
      type={type}
      value={value || ''}
      onChange={(e) => mutation.mutate(e.target.value)}
      sx={{ mb: 2, mr: 2 }}
    />
  );
}
```

---

## 📋 Checklist: No Hardcoding

### What Should NEVER Be Hardcoded:

- ❌ Business rules (tax rate, shipping cost, discounts)
- ❌ Feature flags (new features, experiments)
- ❌ Limits (password length, page size, retry attempts)
- ❌ Credentials (API keys, secrets, database URLs)
- ❌ User-facing messages (error messages, email templates)
- ❌ Configuration values (currency, timezone, language)
- ❌ Roles & permissions (which roles can do what)
- ❌ Prices & costs
- ❌ Email templates
- ❌ SMS templates
- ❌ Report formats
- ❌ Integration endpoints
- ❌ Timeouts & retry logic
- ❌ Color schemes (if they can change)
- ❌ Navigation menus (if they're role-based)

### What SHOULD Be Hardcoded:

- ✅ Core algorithm logic
- ✅ API timeout constants (if universal)
- ✅ Standard pagination defaults
- ✅ HTTP status codes
- ✅ TRUE constant values (like `MAX_INT`)
- ✅ Technical constants related to frameworks
- ✅ Role names (but behavior is in DB)

---

## 🎯 Implementation Pattern

```typescript
// Pattern: Config → Service → Controller → Response

// 1. Environment Variable
// .env: VITE_GST_RATE=0.18

// 2. Config Service (gets from DB or env)
// ConfigService.getConfig('tax_rate')

// 3. Business Logic
// const tax = subtotal * taxRate;

// 4. Controller uses it
// export const calculateOrder = async (order) => {
//   const taxRate = await ConfigService.getConfig('tax_rate');
//   // ...
// }

// 5. Admin can change it from UI without code changes!
```

---

## ✨ Benefits

1. **Change without redeploying** - Update via admin panel
2. **A/B Testing** - Different values for different users
3. **Feature Flags** - Enable/disable features gradually
4. **Regional Configuration** - Different tax rates, shipping per region
5. **Easy Testing** - Inject test values
6. **Audit Trail** - Track who changed what when
7. **No Secrets in Code** - All sensitive data in vault/env
8. **Multi-tenant Ready** - Each client has own config

---

## 🚀 Next Steps

When building new features:

1. ✅ Create migration for any config needed
2. ✅ Add to `BusinessConfiguration` or `FeatureFlag` table
3. ✅ Create service method to fetch it
4. ✅ Use in controller/service
5. ✅ Add admin UI to manage it
6. ✅ Never hardcode the value!

**Remember**: If a value might change without code deployment, it belongs in configuration, not code!
