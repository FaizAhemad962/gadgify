"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const auditLogService_1 = __importDefault(require("./auditLogService"));
class MultiAccountService {
    /**
     * Get all accounts for an email
     */
    async getAccountsByEmail(email) {
        const accounts = await database_1.default.user.findMany({
            where: {
                email,
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountName: true,
                city: true,
                phone: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return accounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            phone: acc.phone,
            role: acc.role,
            city: acc.city,
            accountName: acc.accountName || undefined,
            createdAt: acc.createdAt.toISOString(),
        }));
    }
    /**
     * Check if this email has multiple accounts
     */
    async hasMultipleAccounts(email) {
        const count = await database_1.default.user.count({
            where: {
                email,
                deletedAt: null,
            },
        });
        return count > 1;
    }
    /**
     * Get account count for email
     */
    async getAccountCount(email) {
        return await database_1.default.user.count({
            where: {
                email,
                deletedAt: null,
            },
        });
    }
    /**
     * Get account info by ID and verify email matches
     */
    async getAccountInfo(userId, email) {
        return await database_1.default.user.findFirst({
            where: {
                id: userId,
                email,
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountName: true,
                city: true,
                phone: true,
                createdAt: true,
            },
        });
    }
    /**
     * Create a new account for existing email
     */
    async createAccountForEmail(email, password, role, name, phone, city, state, address, pincode, accountName) {
        // Check if account with same role already exists
        const existing = await database_1.default.user.findFirst({
            where: {
                email,
                role,
                deletedAt: null,
            },
        });
        if (existing) {
            throw new Error(`Account with role ${role} already exists for this email`);
        }
        const newAccount = await database_1.default.user.create({
            data: {
                email,
                password,
                role,
                name,
                phone,
                city,
                state,
                address,
                pincode,
                accountName: accountName || `${role} Account`,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountName: true,
                createdAt: true,
            },
        });
        // Log account creation
        await auditLogService_1.default.logAction({
            userId: newAccount.id,
            action: "ACCOUNT_CREATED",
            description: `New ${role} account created`,
            email,
            newValue: role,
        });
        return newAccount;
    }
    /**
     * Get all unique emails with multiple accounts
     */
    async getEmailsWithMultipleAccounts() {
        const result = await database_1.default.$queryRaw `
      SELECT 
        email,
        COUNT(*) as account_count
      FROM users
      WHERE "deletedAt" IS NULL
      GROUP BY email
      HAVING COUNT(*) > 1
      ORDER BY account_count DESC
    `;
        return result;
    }
    /**
     * Get dashboard stats
     */
    async getMultiAccountStats() {
        const [totalAccounts, uniqueEmails, emailsWithMultiple, roleDistribution] = await Promise.all([
            database_1.default.user.count({ where: { deletedAt: null } }),
            database_1.default.user.findMany({
                distinct: ["email"],
                where: { deletedAt: null },
                select: { email: true },
            }),
            this.getEmailsWithMultipleAccounts(),
            this.getRoleDistribution(),
        ]);
        return {
            totalAccounts,
            totalUniqueEmails: uniqueEmails.length,
            emailsWithMultipleAccounts: emailsWithMultiple.length,
            accountsWithMultipleRoles: emailsWithMultiple.reduce((sum, item) => sum + item.account_count, 0),
            roleDistribution,
        };
    }
    /**
     * Get role distribution
     */
    async getRoleDistribution() {
        return await this.getRoleStats();
    }
    /**
     * Get role statistics
     */
    async getRoleStats() {
        const result = await database_1.default.$queryRaw `
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      WHERE "deletedAt" IS NULL
      GROUP BY role
      ORDER BY count DESC
    `;
        return result;
    }
    /**
     * List all accounts (admin only)
     */
    async getAllAccountsGroupedByEmail() {
        const accounts = await database_1.default.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountName: true,
                phone: true,
                city: true,
                createdAt: true,
            },
            orderBy: [{ email: "asc" }, { createdAt: "asc" }],
        });
        // Group by email
        const grouped = accounts.reduce((acc, account) => {
            if (!acc[account.email]) {
                acc[account.email] = [];
            }
            acc[account.email].push(account);
            return acc;
        }, {});
        return grouped;
    }
}
exports.default = new MultiAccountService();
