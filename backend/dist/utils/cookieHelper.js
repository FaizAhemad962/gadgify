"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookie = exports.setAuthCookie = void 0;
const config_1 = require("../config");
/**
 * Helper function to set auth cookies with proper security flags
 * For cross-domain requests (frontend on different domain than backend):
 * - Use SameSite=None; Secure for production (allows cross-domain cookies)
 * For same-domain scenarios:
 * - Use SameSite=Lax (prevents CSRF while allowing navigation)
 */
const setAuthCookie = (res, token, options) => {
    const maxAge = options?.maxAge || 24 * 60 * 60 * 1000;
    const isProduction = config_1.config.nodeEnv === "production";
    const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";
    const sameSite = isCrossDomain ? "none" : "lax";
    const cookieOptions = {
        httpOnly: true,
        secure: sameSite === "none" ? true : isProduction,
        sameSite,
        path: "/",
        maxAge,
    };
    // ✅ Only set domain if it's valid
    if (config_1.config.cookieDomain &&
        !config_1.config.cookieDomain.includes("http") &&
        !config_1.config.cookieDomain.includes("/") &&
        !config_1.config.cookieDomain.includes(":")) {
        cookieOptions.domain = config_1.config.cookieDomain;
    }
    res.cookie("authToken", token, cookieOptions);
};
exports.setAuthCookie = setAuthCookie;
/**
 * Helper function to clear auth cookie
 * ✅ SECURITY: Uses same SameSite flags as setAuthCookie to ensure proper clearing
 */
const clearAuthCookie = (res) => {
    const isProduction = config_1.config.nodeEnv === "production";
    const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";
    const sameSite = isCrossDomain ? "none" : "lax";
    const clearOptions = {
        httpOnly: true,
        secure: sameSite === "none" ? true : isProduction,
        sameSite,
        path: "/",
    };
    if (config_1.config.cookieDomain &&
        !config_1.config.cookieDomain.includes("http") &&
        !config_1.config.cookieDomain.includes("/") &&
        !config_1.config.cookieDomain.includes(":")) {
        clearOptions.domain = config_1.config.cookieDomain;
    }
    res.clearCookie("authToken", clearOptions);
};
exports.clearAuthCookie = clearAuthCookie;
