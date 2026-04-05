"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnosticsSummary = exports.runStartupDiagnostics = void 0;
const logger_1 = __importDefault(require("./logger"));
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
/**
 * Run comprehensive startup diagnostics
 * Logs detailed information about configuration and connectivity
 */
const runStartupDiagnostics = async () => {
    const results = [];
    logger_1.default.info("🔍 Starting startup diagnostics...");
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║     STARTUP DIAGNOSTICS REPORT        ║");
    console.log("╚════════════════════════════════════════╝\n");
    // 1. Environment Check
    results.push({
        name: "Environment Variables",
        status: "OK",
        message: `NODE_ENV: ${config_1.config.nodeEnv}`,
    });
    // 2. Check DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        results.push({
            name: "DATABASE_URL",
            status: "FAILED",
            message: "DATABASE_URL environment variable is not set",
            error: "This is critical - your app cannot connect to the database without this",
        });
    }
    else {
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
        await database_1.default.$queryRaw `SELECT NOW()`;
        const connectTime = Date.now() - startTime;
        results.push({
            name: "Database Connection",
            status: "OK",
            message: `Connected successfully in ${connectTime}ms`,
        });
    }
    catch (error) {
        const errorMsg = error?.message || String(error);
        results.push({
            name: "Database Connection",
            status: "FAILED",
            message: "Failed to connect to database",
            error: errorMsg,
        });
        logger_1.default.error("Database connection failed:", error);
    }
    // 4. Check Prisma Client
    try {
        await database_1.default.$queryRaw `SELECT COUNT(*) as user_count FROM users`;
        results.push({
            name: "Prisma Client",
            status: "OK",
            message: "Prisma client is working correctly",
        });
    }
    catch (error) {
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
        message: `CORS origin: ${config_1.config.frontendUrl}`,
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
        const icon = result.status === "OK" ? "✓" : result.status === "WARNING" ? "⚠" : "✗";
        const color = result.status === "OK"
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
        logger_1.default.error(`⚠️  ${failures.length} startup check(s) failed:`);
        failures.forEach((f) => {
            logger_1.default.error(`  - ${f.name}: ${f.error}`);
        });
    }
    return results;
};
exports.runStartupDiagnostics = runStartupDiagnostics;
/**
 * Get startup diagnostics summary
 */
const getDiagnosticsSummary = (results) => {
    const passed = results.filter((r) => r.status === "OK").length;
    const failed = results.filter((r) => r.status === "FAILED").length;
    const warnings = results.filter((r) => r.status === "WARNING").length;
    return `${passed} passed, ${warnings} warnings, ${failed} failed`;
};
exports.getDiagnosticsSummary = getDiagnosticsSummary;
