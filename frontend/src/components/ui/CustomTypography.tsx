import React from "react";
import { Typography, type TypographyProps } from "@mui/material";

interface CustomTypographyProps extends TypographyProps {
  /**
   * If true, adds a gradient effect to the text (primary to accent)
   */
  gradient?: boolean;
}

export const CustomTypography = ({
  gradient = false,
  sx,
  children,
  ...props
}: CustomTypographyProps) => {
  return (
    <Typography
      {...props}
      sx={{
        ...(gradient && {
          background: (theme) =>
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
        }),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};
