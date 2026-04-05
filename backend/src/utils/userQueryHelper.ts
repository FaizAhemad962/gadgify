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
    // Try to find the specific role first
    const user = await prisma.user.findUnique({
      where: {
        email_role: {
          email,
          role: defaultRole,
        },
      },
    });

    if (user) return user;

    // If not found with default role, find any account with this email
    const anyUser = await prisma.user.findFirst({
      where: { email },
      orderBy: { createdAt: "asc" }, // Return oldest account
    });

    return anyUser;
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
    // Find the default role account
    const user = await prisma.user.findUnique({
      where: {
        email_role: {
          email,
          role: defaultRole,
        },
      },
    });

    // Check if there are other accounts with same email
    const allUsersByEmail = await prisma.user.findMany({
      where: { email },
      select: { id: true, role: true },
    });

    return {
      user,
      otherAccounts: allUsersByEmail.filter((u) => u.id !== user?.id),
      allAccountsCount: allUsersByEmail.length,
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
    const user = await prisma.user.findUnique({
      where: {
        email_role: {
          email,
          role,
        },
      },
    });
    return user !== null && !user.deletedAt;
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
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
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
