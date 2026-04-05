/**
 * Role Configuration Constants
 * Defines metadata for all 5 roles: colors, icons, labels, and hierarchy levels
 */

export const ROLE_LEVELS = {
  USER: 0,
  DELIVERY_STAFF: 1,
  SUPPORT_STAFF: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
} as const;

export const ROLE_CONFIG = {
  USER: {
    color: "#1976d2",
    icon: "👤",
    label: "User",
    description: "Regular customer",
    level: ROLE_LEVELS.USER,
  },
  DELIVERY_STAFF: {
    color: "#1976d2",
    icon: "🚚",
    label: "Delivery Staff",
    description: "Handles order delivery",
    level: ROLE_LEVELS.DELIVERY_STAFF,
  },
  SUPPORT_STAFF: {
    color: "#0097a7",
    icon: "👨‍💼",
    label: "Support Staff",
    description: "Customer support representative",
    level: ROLE_LEVELS.SUPPORT_STAFF,
  },
  ADMIN: {
    color: "#ff9800",
    icon: "⚙️",
    label: "Admin",
    description: "Administrator with restricted access",
    level: ROLE_LEVELS.ADMIN,
  },
  SUPER_ADMIN: {
    color: "#d32f2f",
    icon: "👑",
    label: "Super Admin",
    description: "Full system access",
    level: ROLE_LEVELS.SUPER_ADMIN,
  },
} as const;

export type RoleType = keyof typeof ROLE_CONFIG;

/**
 * List of roles that users can create based on their current role
 */
export const CREATABLE_ROLES_BY_ROLE = {
  USER: [] as RoleType[],
  DELIVERY_STAFF: [] as RoleType[],
  SUPPORT_STAFF: [] as RoleType[],
  ADMIN: ["USER", "DELIVERY_STAFF", "SUPPORT_STAFF"] as RoleType[],
  SUPER_ADMIN: [
    "USER",
    "DELIVERY_STAFF",
    "SUPPORT_STAFF",
    "ADMIN",
    "SUPER_ADMIN",
  ] as RoleType[],
} as const;

/**
 * Get all available roles sorted by hierarchy
 */
export const ALL_ROLES = Object.keys(ROLE_CONFIG) as RoleType[];

/**
 * Admin and higher roles
 */
export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as RoleType[];

/**
 * Staff roles (non-customer, non-admin)
 */
export const STAFF_ROLES = ["DELIVERY_STAFF", "SUPPORT_STAFF"] as RoleType[];
