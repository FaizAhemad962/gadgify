/**
 * Role Helper Utilities
 * Provides functions for role-related operations and checks
 */

import type { RoleType } from "@/constants/roles";
import { ROLE_CONFIG, CREATABLE_ROLES_BY_ROLE } from "@/constants/roles";

/**
 * Get display label for a role
 * @param role - The role type
 * @returns Display label (e.g., "Super Admin" for SUPER_ADMIN)
 */
export const getRoleLabel = (role: string): string => {
  return ROLE_CONFIG[role as RoleType]?.label || role;
};

/**
 * Get color for a role
 * @param role - The role type
 * @returns Hex color code
 */
export const getRoleColor = (role: string): string => {
  return ROLE_CONFIG[role as RoleType]?.color || "#000000";
};

/**
 * Get icon emoji for a role
 * @param role - The role type
 * @returns Icon emoji
 */
export const getRoleIcon = (role: string): string => {
  return ROLE_CONFIG[role as RoleType]?.icon || "❓";
};

/**
 * Get hierarchy level for a role
 * @param role - The role type
 * @returns Numeric level (0-3)
 */
export const getRoleLevel = (role: string): number => {
  return ROLE_CONFIG[role as RoleType]?.level ?? -1;
};

/**
 * Get description for a role
 * @param role - The role type
 * @returns Role description
 */
export const getRoleDescription = (role: string): string => {
  return ROLE_CONFIG[role as RoleType]?.description || "Unknown role";
};

/**
 * Check if a user (by role) can create a specific target role
 * @param userRole - The current user's role
 * @param targetRole - The role to be created
 * @returns true if user can create target role, false otherwise
 */
export const canCreateRole = (
  userRole: string | undefined,
  targetRole: string,
): boolean => {
  if (!userRole) return false;

  const creatableRoles = CREATABLE_ROLES_BY_ROLE[userRole as RoleType];
  return creatableRoles
    ? creatableRoles.includes(targetRole as RoleType)
    : false;
};

/**
 * Check if user role is high enough to access admin features
 * @param userRole - The user's role
 * @returns true if role is ADMIN or SUPER_ADMIN
 */
export const hasAdminAccess = (userRole: string | undefined): boolean => {
  return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
};

/**
 * Check if user role is SUPER_ADMIN
 * @param userRole - The user's role
 * @returns true if SUPER_ADMIN
 */
export const isSuperAdmin = (userRole: string | undefined): boolean => {
  return userRole === "SUPER_ADMIN";
};

/**
 * Check if role is a staff role (non-customer, non-admin)
 * @param role - The role type
 * @returns true if role is DELIVERY_STAFF or SUPPORT_STAFF
 */
export const isStaffRole = (role: string): boolean => {
  return role === "DELIVERY_STAFF" || role === "SUPPORT_STAFF";
};

/**
 * Check if role is a customer role
 * @param role - The role type
 * @returns true if role is USER
 */
export const isCustomerRole = (role: string): boolean => {
  return role === "USER";
};

/**
 * Get all roles a user can assign to others
 * @param userRole - The current user's role
 * @returns Array of assignable roles
 */
export const getAssignableRoles = (
  userRole: string | undefined,
): RoleType[] => {
  if (!userRole) return [];
  return CREATABLE_ROLES_BY_ROLE[userRole as RoleType] || [];
};

/**
 * Compare two roles by hierarchy level
 * @param role1 - First role
 * @param role2 - Second role
 * @returns negative if role1 < role2, 0 if equal, positive if role1 > role2
 */
export const compareRoleLevel = (role1: string, role2: string): number => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  return level1 - level2;
};

/**
 * Format role with icon and label
 * @param role - The role type
 * @returns Formatted string (e.g., "👑 Super Admin")
 */
export const formatRoleWithIcon = (role: string): string => {
  const icon = getRoleIcon(role);
  const label = getRoleLabel(role);
  return `${icon} ${label}`;
};
