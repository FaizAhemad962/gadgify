import React from "react";
import { Box, Typography, type BoxProps } from "@mui/material";
import { ErrorOutline as ErrorIcon } from "@mui/icons-material";
import { tokens } from "@/theme/theme";
import { CustomButton } from "./CustomButton";

interface EmptyStateProps extends BoxProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  icon = <ErrorIcon sx={{ fontSize: 64, color: tokens.gray300 }} />,
  actionText,
  onAction,
  sx,
  ...props
}: EmptyStateProps) => {
  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        textAlign: "center",
        borderRadius: 4,
        backgroundColor: tokens.gray50,
        border: `2px dashed ${tokens.gray200}`,
        ...sx,
      }}
    >
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <CustomButton variant="contained" onClick={onAction}>
          {actionText}
        </CustomButton>
      )}
    </Box>
  );
};
