import React from "react";
import { Snackbar, Alert, Stack } from "@mui/material";
import { useGlobalError } from "@/hooks/useGlobalError";

export const GlobalSnackbar: React.FC = () => {
  const { errors, clearError } = useGlobalError();

  return (
    <Stack
      spacing={2}
      sx={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
        pointerEvents: "none",
      }}
    >
      {errors.map((error) => (
        <div key={error.id} style={{ pointerEvents: "auto" }}>
          <Snackbar
            open={true}
            autoHideDuration={error.duration}
            onClose={() => clearError(error.id)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={() => clearError(error.id)}
              severity={error.severity}
              sx={{
                width: "100%",
                fontSize: "0.95rem",
                fontWeight: 500,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {error.message}
            </Alert>
          </Snackbar>
        </div>
      ))}
    </Stack>
  );
};

export default GlobalSnackbar;
