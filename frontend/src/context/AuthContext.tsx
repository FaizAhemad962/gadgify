import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean; // ADMIN or SUPER_ADMIN
  isSuperAdmin: boolean; // SUPER_ADMIN only
  hasAdminAccess: boolean; // Alias for isAdmin
  isStaff: boolean; // DELIVERY_STAFF or SUPPORT_STAFF
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load from localStorage outside component to avoid cascading renders
const getStoredAuth = () => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    return { token: storedToken, user: JSON.parse(storedUser) as User };
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Role checking helper
  const getRoleFlags = (userRole: string | undefined) => {
    return {
      isAdmin: userRole === "ADMIN" || userRole === "SUPER_ADMIN",
      isSuperAdmin: userRole === "SUPER_ADMIN",
      hasAdminAccess: userRole === "ADMIN" || userRole === "SUPER_ADMIN",
      isStaff: userRole === "DELIVERY_STAFF" || userRole === "SUPPORT_STAFF",
    };
  };

  const roleFlags = getRoleFlags(user?.role);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: roleFlags.isAdmin,
    isSuperAdmin: roleFlags.isSuperAdmin,
    hasAdminAccess: roleFlags.hasAdminAccess,
    isStaff: roleFlags.isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
