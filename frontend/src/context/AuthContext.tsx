import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasAdminAccess: boolean;
  isStaff: boolean;
  authChecked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    authApi
      .getProfile()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setAuthChecked(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback((authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAuthChecked(true);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const role = user?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    return {
      user,
      login,
      updateUser,
      logout,
      isAuthenticated: user !== null,
      isAdmin,
      isSuperAdmin: role === "SUPER_ADMIN",
      hasAdminAccess: isAdmin,
      isStaff: role === "DELIVERY_STAFF" || role === "SUPPORT_STAFF",
      authChecked,
    };
  }, [authChecked, login, logout, updateUser, user]);

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
