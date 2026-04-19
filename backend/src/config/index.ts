import dotenv from "dotenv";

dotenv.config();

// Validate critical environment variables at startup
const validateRequiredEnv = () => {
  const requiredVars = [
    "JWT_SECRET",
    "DATABASE_URL",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missingVars = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      "❌ CRITICAL: Missing required environment variables:",
      missingVars.join(", "),
    );
    console.error(
      "Application cannot start without these variables. Please set them in your .env file.",
    );
    process.exit(1);
  }

  // Validate JWT_SECRET length (minimum 32 chars recommended)
  if (process.env.JWT_SECRET!.length < 32) {
    console.warn(
      "⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security",
    );
  }
};

// Run validation at module load time
validateRequiredEnv();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET!, // Will throw if not set
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h", // Reduced from 7d to 24h
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET!,
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Gadgify <onboarding@resend.dev>",
  adminEmail: process.env.ADMIN_EMAIL || "",
  // ✅ SECURITY: Email service configuration for SMTP
  emailProvider: process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      }
    : null,
};
