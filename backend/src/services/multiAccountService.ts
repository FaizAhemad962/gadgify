import prisma from "../config/database";
import auditLogService from "./auditLogService";

interface AccountInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  city: string;
  phone: string;
  createdAt: string;
}

class MultiAccountService {
  /**
   * Get all accounts for an email
   */
  async getAccountsByEmail(email: string): Promise<AccountInfo[]> {
    const accounts = await prisma.user.findMany({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
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
      createdAt: acc.createdAt.toISOString(),
    }));
  }

  /**
   * Check if this email has multiple accounts
   */
  async hasMultipleAccounts(email: string): Promise<boolean> {
    const count = await prisma.user.count({
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
  async getAccountCount(email: string): Promise<number> {
    return await prisma.user.count({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  /**
   * Get account info by ID and verify email matches
   */
  async getAccountInfo(userId: string, email: string) {
    return await prisma.user.findFirst({
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
        city: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create a new account for existing email
   */
  async createAccountForEmail(
    email: string,
    password: string,
    role: string,
    name: string,
    phone: string,
    city: string,
    state: string,
    address: string,
    pincode: string,
    accountName?: string,
  ) {
    // Check if account with same role already exists
    const existing = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new Error(
        `Account with role ${role} already exists for this email`,
      );
    }

    const newAccount = await prisma.user.create({
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
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Log account creation
    await auditLogService.logAction({
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
    const result = await prisma.$queryRaw<
      Array<{ email: string; account_count: number }>
    >`
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
    const [totalAccounts, uniqueEmails, emailsWithMultiple, roleDistribution] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.findMany({
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
      accountsWithMultipleRoles: emailsWithMultiple.reduce(
        (sum, item) => sum + item.account_count,
        0,
      ),
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
  private async getRoleStats() {
    const result = await prisma.$queryRaw<
      Array<{ role: string; count: number }>
    >`
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
    const accounts = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
      },
      orderBy: [{ email: "asc" }, { createdAt: "asc" }],
    });

    // Group by email
    const grouped = accounts.reduce(
      (acc, account) => {
        if (!acc[account.email]) {
          acc[account.email] = [];
        }
        acc[account.email].push(account);
        return acc;
      },
      {} as Record<string, typeof accounts>,
    );

    return grouped;
  }
}

export default new MultiAccountService();
