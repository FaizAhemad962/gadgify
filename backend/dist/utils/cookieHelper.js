"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookie = exports.setAuthCookie = void 0;
const config_1 = require("../config");
const getAuthCookieOptions = (maxAge) => {
    const isProduction = config_1.config.nodeEnv === "production";
    const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";
    const sameSite = isCrossDomain ? "none" : "lax";
    const cookieOptions = {
        httpOnly: true,
        secure: sameSite === "none" ? true : isProduction,
        sameSite,
        path: "/",
    };
    if (maxAge) {
        cookieOptions.maxAge = maxAge;
    }
    // Only set domain if it is a bare hostname/domain, not a URL.
    if (config_1.config.cookieDomain &&
        !config_1.config.cookieDomain.includes("http") &&
        !config_1.config.cookieDomain.includes("/") &&
        !config_1.config.cookieDomain.includes(":")) {
        cookieOptions.domain = config_1.config.cookieDomain;
    }
    return cookieOptions;
};
const setAuthCookie = (res, token, options) => {
    const maxAge = options?.maxAge || 24 * 60 * 60 * 1000;
    res.cookie("authToken", token, getAuthCookieOptions(maxAge));
};
exports.setAuthCookie = setAuthCookie;
const clearAuthCookie = (res) => {
    res.clearCookie("authToken", getAuthCookieOptions());
};
exports.clearAuthCookie = clearAuthCookie;
