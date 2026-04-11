// backend/src/utils/userQueryHelper.ts
import prisma from "../config/database";

/**
 * Find user by email, defaulting to USER role
 * Used for queries that expect a single user per email
 * When email is shared across roles, defaults to USER role account
 */
export async function findUserByEmail(
  email: string,
  defaultRole: string = "USER",
) {
  try {
    // Normalize email to lowercase for case-insensitive search
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || user.deletedAt) return null;
    if (defaultRole && user.role !== defaultRole) return user;
    return user;
  } catch (error) {
    console.error("Error in findUserByEmail:", error);
    return null;
  }
}

/**
 * Find user and check if this is a potential multi-account situation
 * Returns user + a flag indicating if other accounts exist with same email
 */
export async function findUserByEmailWithMultipleCheck(
  email: string,
  defaultRole: string = "USER",
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const activeUser = user && !user.deletedAt ? user : null;

    return {
      user: activeUser,
      otherAccounts: [],
      allAccountsCount: activeUser ? 1 : 0,
    };
  } catch (error) {
    console.error("Error in findUserByEmailWithMultipleCheck:", error);
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
export async function findAllAccountsByEmail(email: string) {
  try {
    return await prisma.user.findMany({
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
  } catch (error) {
    console.error("Error in findAllAccountsByEmail:", error);
    return [];
  }
}

/**
 * Check if user exists by email and role
 */
export async function userExists(
  email: string,
  role: string = "USER",
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user !== null && !user.deletedAt && user.role === role;
  } catch (error) {
    console.error("Error in userExists:", error);
    return false;
  }
}

/**
 * Check if email is registered with any role (used during signup to prevent accidental duplicate signup)
 */
export async function isEmailRegisteredWithAnyRole(
  email: string,
): Promise<boolean> {
  try {
    // Normalize email to lowercase for consistent checking
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        deletedAt: null,
      },
    });
    return user !== null;
  } catch (error) {
    console.error("Error in isEmailRegisteredWithAnyRole:", error);
    return false;
  }
}

export default {
  findUserByEmail,
  findUserByEmailWithMultipleCheck,
  findAllAccountsByEmail,
  userExists,
  isEmailRegisteredWithAnyRole,
};
