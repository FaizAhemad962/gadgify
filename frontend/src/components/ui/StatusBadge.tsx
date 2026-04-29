import React from "react";
import { CustomChip } from "./CustomChip";
import { tokens } from "@/theme/theme";

type StatusType = "success" | "error" | "warning" | "info" | "primary" | "secondary";

interface StatusBadgeProps {
  label: string;
  status: StatusType;
}

export const StatusBadge = ({ label, status }: StatusBadgeProps) => {
  const getColors = () => {
    switch (status) {
      case "success":
        return { bg: `${tokens.success}15`, color: tokens.success };
      case "error":
        return { bg: `${tokens.error}15`, color: tokens.error };
      case "warning":
        return { bg: `${tokens.warning}15`, color: tokens.warning };
      case "info":
        return { bg: `${tokens.info}15`, color: tokens.info };
      case "primary":
        return { bg: `${tokens.primary}15`, color: tokens.primary };
      case "secondary":
        return { bg: `${tokens.secondary}15`, color: tokens.secondary };
      default:
        return { bg: tokens.gray100, color: tokens.gray700 };
    }
  };

  const colors = getColors();

  return (
    <CustomChip
      label={label}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 700,
        fontSize: "0.75rem",
        borderRadius: "6px",
        border: "none",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    />
  );
};
