import React from "react";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import { tokens } from "@/theme/theme";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay = ({
  open,
  message,
  transparent = false,
}: LoadingOverlayProps) => {
  return (
    <Backdrop
      sx={{
        color: tokens.accent,
        zIndex: (theme) => theme.zIndex.drawer + 1000,
        backgroundColor: transparent ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
      {message && (
        <Box sx={{ color: tokens.primary, fontWeight: 600 }}>{message}</Box>
      )}
    </Backdrop>
  );
};
