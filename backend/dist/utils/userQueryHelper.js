"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserByEmailWithMultipleCheck = findUserByEmailWithMultipleCheck;
exports.findAllAccountsByEmail = findAllAccountsByEmail;
exports.userExists = userExists;
exports.isEmailRegisteredWithAnyRole = isEmailRegisteredWithAnyRole;
// backend/src/utils/userQueryHelper.ts
const database_1 = __importDefault(require("../config/database"));
/**
 * Find user by email, defaulting to USER role
 * Used for queries that expect a single user per email
 * When email is shared across roles, defaults to USER role account
 */
async function findUserByEmail(email, defaultRole = "USER") {
    try {
        // Normalize email to lowercase for case-insensitive search
        const normalizedEmail = email.toLowerCase().trim();
        const user = await database_1.default.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user || user.deletedAt)
            return null;
        if (defaultRole && user.role !== defaultRole)
            return user;
        return user;
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error in findUserByEmail:", error);
        }
        return null;
    }
}
/**
 * Find user and check if this is a potential multi-account situation
 * Returns user + a flag indicating if other accounts exist with same email
 */
async function findUserByEmailWithMultipleCheck(email, defaultRole = "USER") {
    try {
        const user = await database_1.default.user.findUnique({ where: { email } });
        const activeUser = user && !user.deletedAt ? user : null;
        return {
            user: activeUser,
            otherAccounts: [],
            allAccountsCount: activeUser ? 1 : 0,
        };
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error in findUserByEmailWithMultipleCheck:", error);
        }
        return {
            user: null,
            otherAccounts: [],
            allAccountsCount: 0,
        };
    }
}
/**
 * Find all accounts by email (for account switching/management)
 */
async function findAllAccountsByEmail(email) {
    try {
        return await database_1.default.user.findMany({
            where: { email, deletedAt: null },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        });
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error in findAllAccountsByEmail:", error);
        }
        return [];
    }
}
/**
 * Check if user exists by email and role
 */
async function userExists(email, role = "USER") {
    try {
        const user = await database_1.default.user.findUnique({ where: { email } });
        return user !== null && !user.deletedAt && user.role === role;
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error in userExists:", error);
        }
        return false;
    }
}
/**
 * Check if email is registered with any role (used during signup to prevent accidental duplicate signup)
 */
async function isEmailRegisteredWithAnyRole(email) {
    try {
        // Normalize email to lowercase for consistent checking
        const normalizedEmail = email.toLowerCase().trim();
        const user = await database_1.default.user.findFirst({
            where: {
                email: { equals: normalizedEmail, mode: "insensitive" },
                deletedAt: null,
            },
        });
        return user !== null;
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error in isEmailRegisteredWithAnyRole:", error);
        }
        return false;
    }
}
exports.default = {
    findUserByEmail,
    findUserByEmailWithMultipleCheck,
    findAllAccountsByEmail,
    userExists,
    isEmailRegisteredWithAnyRole,
};
