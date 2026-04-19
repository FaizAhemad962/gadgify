import React, { createContext, useCallback, useState } from "react";

export interface ErrorNotification {
  id: string;
  message: string;
  severity: "error" | "warning" | "info" | "success";
  duration?: number; // ms, 0 = infinite
}

interface ErrorContextType {
  errors: ErrorNotification[];
  showError: (
    message: string,
    severity?: "error" | "warning" | "info" | "success",
    duration?: number,
  ) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  clearError: (id: string) => void;
  clearAll: () => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<ErrorNotification[]>([]);

  const showError = useCallback(
    (
      message: string,
      severity: "error" | "warning" | "info" | "success" = "error",
      duration = 6000,
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: ErrorNotification = {
        id,
        message,
        severity,
        duration,
      };

      setErrors((prev) => [...prev, notification]);

      // Auto-clear after duration (if duration > 0)
      if (duration > 0) {
        setTimeout(() => clearError(id), duration);
      }
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string) => {
      showError(message, "success", 5000);
    },
    [showError],
  );

  const showWarning = useCallback(
    (message: string) => {
      showError(message, "warning", 6000);
    },
    [showError],
  );

  const showInfo = useCallback(
    (message: string) => {
      showError(message, "info", 5000);
    },
    [showError],
  );

  const clearError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        clearError,
        clearAll,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};
