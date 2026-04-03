import logger from "./logger";
import prisma from "../config/database";
import { config } from "../config";

interface DiagnosticResult {
  name: string;
  status: "OK" | "FAILED" | "WARNING";
  message: string;
  error?: string;
}

/**
 * Run comprehensive startup diagnostics
 * Logs detailed information about configuration and connectivity
 */
export const runStartupDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  logger.info("🔍 Starting startup diagnostics...");
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║     STARTUP DIAGNOSTICS REPORT        ║");
  console.log("╚════════════════════════════════════════╝\n");

  // 1. Environment Check
  results.push({
    name: "Environment Variables",
    status: "OK",
    message: `NODE_ENV: ${config.nodeEnv}`,
  });

  // 2. Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    results.push({
      name: "DATABASE_URL",
      status: "FAILED",
      message: "DATABASE_URL environment variable is not set",
      error:
        "This is critical - your app cannot connect to the database without this",
    });
  } else {
    // Mask the full URL for security
    const maskedUrl = dbUrl.replace(/:[^:@]*@/, ":****@");
    results.push({
      name: "DATABASE_URL",
      status: "OK",
      message: `Set to: ${maskedUrl}`,
    });
  }

  // 3. Database Connection Test
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT NOW()`;
    const connectTime = Date.now() - startTime;

    results.push({
      name: "Database Connection",
      status: "OK",
      message: `Connected successfully in ${connectTime}ms`,
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    results.push({
      name: "Database Connection",
      status: "FAILED",
      message: "Failed to connect to database",
      error: errorMsg,
    });
    logger.error("Database connection failed:", error);
  }

  // 4. Check Prisma Client
  try {
    await prisma.$queryRaw`SELECT COUNT(*) as user_count FROM users`;
    results.push({
      name: "Prisma Client",
      status: "OK",
      message: "Prisma client is working correctly",
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    results.push({
      name: "Prisma Client",
      status: "FAILED",
      message: "Prisma query execution failed",
      error: errorMsg,
    });
  }

  // 5. Check Frontend URL
  results.push({
    name: "Frontend URL",
    status: "OK",
    message: `CORS origin: ${config.frontendUrl}`,
  });

  // 6. Check API Keys (just check if they exist)
  const keyStatus = {
    jwtSecret: !!process.env.JWT_SECRET ? "Set" : "Using default (not secure)",
    stripeKey: !!process.env.STRIPE_SECRET_KEY ? "Set" : "Not configured",
    razorpayKeyId: !!process.env.RAZORPAY_KEY_ID ? "Set" : "Not configured",
  };

  results.push({
    name: "API Keys",
    status: Object.values(keyStatus).every((v) => v === "Set")
      ? "OK"
      : "WARNING",
    message: JSON.stringify(keyStatus),
  });

  // Print results
  console.log("┌─ CONFIGURATION CHECK ─────────────────┐");
  results.forEach((result) => {
    const icon =
      result.status === "OK" ? "✓" : result.status === "WARNING" ? "⚠" : "✗";
    const color =
      result.status === "OK"
        ? "\x1b[32m"
        : result.status === "WARNING"
          ? "\x1b[33m"
          : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(`${color}${icon}${reset} ${result.name}`);
    console.log(`  └─ ${result.message}`);
    if (result.error) {
      console.log(`  └─ ERROR: ${result.error}`);
    }
  });
  console.log("└────────────────────────────────────────┘\n");

  // Log failures
  const failures = results.filter((r) => r.status === "FAILED");
  if (failures.length > 0) {
    logger.error(`⚠️  ${failures.length} startup check(s) failed:`);
    failures.forEach((f) => {
      logger.error(`  - ${f.name}: ${f.error}`);
    });
  }

  return results;
};

/**
 * Get startup diagnostics summary
 */
export const getDiagnosticsSummary = (results: DiagnosticResult[]): string => {
  const passed = results.filter((r) => r.status === "OK").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const warnings = results.filter((r) => r.status === "WARNING").length;

  return `${passed} passed, ${warnings} warnings, ${failed} failed`;
};
