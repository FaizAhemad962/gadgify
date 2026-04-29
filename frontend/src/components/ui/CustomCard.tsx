import React from "react";
import { Card, type CardProps } from "@mui/material";
import { tokens } from "@/theme/theme";

interface CustomCardProps extends CardProps {
  interactive?: boolean;
}

export const CustomCard = ({
  interactive = false,
  children,
  ...props
}: CustomCardProps) => {
  return (
    <Card
      {...props}
      sx={{
        bgcolor: tokens.white,
        border: `1px solid ${tokens.gray200}`,
        borderRadius: 3,
        transition: interactive
          ? "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          : "none",
        ...(interactive && {
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-4px)",
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </Card>
  );
};
