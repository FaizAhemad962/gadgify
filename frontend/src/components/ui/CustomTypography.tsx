import { Typography, type TypographyProps } from "@/mui/material";
import { tokens } from "@/theme/theme";

interface CustomTypographyProps extends TypographyProps {
  /**
   * If true, adds a gradient effect to the text (primary to accent)
   */
  gradient?: boolean;
  appColor?: "primary" | "secondary" | "muted" | "success" | "danger" | "commerce";
  weight?: "regular" | "medium" | "semibold" | "bold" | "black";
}

export const CustomTypography = ({
  gradient = false,
  appColor,
  weight,
  sx,
  children,
  ...props
}: CustomTypographyProps) => {
  const colorSx = (() => {
    switch (appColor) {
      case "primary":
        return tokens.gray900;
      case "secondary":
        return tokens.gray600;
      case "muted":
        return tokens.gray500;
      case "success":
        return tokens.success;
      case "danger":
        return tokens.error;
      case "commerce":
        return tokens.accent;
      default:
        return undefined;
    }
  })();

  const weightSx = (() => {
    switch (weight) {
      case "regular":
        return 400;
      case "medium":
        return 500;
      case "semibold":
        return 600;
      case "bold":
        return 700;
      case "black":
        return 800;
      default:
        return undefined;
    }
  })();

  return (
    <Typography
      {...props}
      sx={{
        ...(colorSx && { color: colorSx }),
        ...(weightSx && { fontWeight: weightSx }),
        ...(gradient && {
          background: `linear-gradient(45deg, ${tokens.primary}, ${tokens.primaryDark})`,
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
