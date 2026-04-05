/**
 * useRolePermissions Hook
 * Provides permission checking utilities based on current user's role
 */

import { useAuth } from "@/context/AuthContext";
import {
  canCreateRole,
  hasAdminAccess,
  isSuperAdmin as checkSuperAdmin,
  isStaffRole,
  getAssignableRoles,
} from "@/utils/roleHelper";

export const useRolePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if current user can access admin panel
   */
  const canAccessAdminPanel = (): boolean => {
    return hasAdminAccess(user?.role);
  };

  /**
   * Check if current user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return checkSuperAdmin(user?.role);
  };

  /**
   * Check if current user can manage users
   */
  const canManageUsers = (): boolean => {
    return isSuperAdmin();
  };

  /**
   * Check if can create a specific role
   */
  const canCreateRoleType = (targetRole: string): boolean => {
    return canCreateRole(user?.role, targetRole);
  };

  /**
   * Get all roles current user can assign
   */
  const getCreatableRoles = () => {
    return getAssignableRoles(user?.role);
  };

  /**
   * Check if can view audit logs (super admin only)
   */
  const canViewAuditLogs = (): boolean => {
    return isSuperAdmin();
  };

  /**
   * Check if can view delivery dashboard (delivery staff only)
   */
  const canAccessDeliveryDashboard = (): boolean => {
    return user?.role === "DELIVERY_STAFF";
  };

  /**
   * Check if can view support dashboard (support staff only)
   */
  const canAccessSupportDashboard = (): boolean => {
    return user?.role === "SUPPORT_STAFF";
  };

  /**
   * Check if user has any of the required roles
   */
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.includes(user?.role || "");
  };

  /**
   * Check if user is a customer (USER role)
   */
  const isCustomer = (): boolean => {
    return user?.role === "USER";
  };

  /**
   * Check if user is staff (DELIVERY_STAFF or SUPPORT_STAFF)
   */
  const isStaff = (): boolean => {
    return isStaffRole(user?.role || "");
  };

  return {
    canAccessAdminPanel,
    isSuperAdmin,
    canManageUsers,
    canCreateRoleType,
    getCreatableRoles,
    canViewAuditLogs,
    canAccessDeliveryDashboard,
    canAccessSupportDashboard,
    hasAnyRole,
    isCustomer,
    isStaff,
  };
};
