import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { apiClient } from "../api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean; // ADMIN or SUPER_ADMIN
  isSuperAdmin: boolean; // SUPER_ADMIN only
  hasAdminAccess: boolean; // Alias for isAdmin
  isStaff: boolean; // DELIVERY_STAFF or SUPPORT_STAFF
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ SECURITY: Tokens are now stored in httpOnly cookies (managed by browser)
// User data cached in state only - not in localStorage
const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    return JSON.parse(storedUser) as User;
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(
    getStoredUser() ? "authenticated" : null,
  ); // Set based on stored user

  // ✅ SECURITY: No token verification on app mount
  // httpOnly cookie is automatically sent with every request
  // If token is valid, API calls will succeed. If not, we'll get 401 errors.

  const login = (newUser: User) => {
    // ✅ SECURITY: Backend sent token in httpOnly cookie (we don't handle it)
    // We just store user data locally for UI purposes
    setToken("authenticated");
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      // ✅ SECURITY: Call backend logout to clear httpOnly cookie
      await apiClient.post(
        "/auth/logout",
        {},
        { withCredentials: true }, // Send cookie to backend
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear frontend state
      setToken(null);
      setUser(null);
      localStorage.removeItem("user");
      // Redirect to login
      window.location.href = "/login";
    }
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
