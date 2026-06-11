import { Button, type ButtonProps, CircularProgress, Box } from "@/mui/material";
import { tokens } from "@/theme/theme";

export type CustomButtonVariant =
  | "primary"
  | "commerce"
  | "success"
  | "admin"
  | "secondary"
  | "danger"
  | "ghost"
  | "upload";

export interface CustomButtonProps extends ButtonProps {
  appVariant?: CustomButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const CustomButton = ({
  appVariant,
  isLoading = false,
  disabled = false,
  children,
  ...props
}: CustomButtonProps) => {
  const isOutlined = props.variant === "outlined";
  const isText = props.variant === "text" || !props.variant;

  const intentButtonSx = ({
    main,
    dark,
    shadow,
  }: {
    main: string;
    dark: string;
    shadow: string;
  }) => {
    if (isOutlined) {
      return {
        color: main,
        borderColor: main,
        bgcolor: tokens.white,
        "&:hover": {
          color: dark,
          borderColor: dark,
          bgcolor: `${main}12`,
        },
      };
    }

    if (isText) {
      return {
        color: main,
        bgcolor: "transparent",
        "&:hover": {
          color: dark,
          bgcolor: `${main}12`,
        },
      };
    }

    return {
      minHeight: 46,
      px: 2.5,
      background: `linear-gradient(135deg, ${main}, ${dark})`,
      backgroundColor: main,
      color: tokens.white,
      borderColor: main,
      boxShadow: `0 10px 22px ${shadow}`,
      "&:hover": {
        background: `linear-gradient(135deg, ${dark}, ${main})`,
        backgroundColor: dark,
        borderColor: dark,
        boxShadow: `0 14px 28px ${shadow}`,
        transform: "translateY(-1px)",
      },
    };
  };

  const variantSx = (() => {
    switch (appVariant) {
      case "primary":
        return intentButtonSx({
          main: tokens.primary,
          dark: tokens.primaryDark,
          shadow: "rgba(37, 99, 235, 0.24)",
        });
      case "commerce":
        return intentButtonSx({
          main: tokens.accent,
          dark: tokens.accentDark,
          shadow: "rgba(249, 115, 22, 0.24)",
        });
      case "success":
        return intentButtonSx({
          main: tokens.success,
          dark: "#15803D",
          shadow: "rgba(22, 163, 74, 0.24)",
        });
      case "admin":
        return intentButtonSx({
          main: tokens.admin,
          dark: tokens.adminDark,
          shadow: "rgba(23, 37, 84, 0.26)",
        });
      case "secondary":
        return {
          color: tokens.secondaryDark,
          borderColor: tokens.gray300,
          bgcolor: tokens.white,
          "&:hover": {
            bgcolor: tokens.gray50,
            borderColor: tokens.secondary,
          },
        };
      case "danger":
        return intentButtonSx({
          main: tokens.error,
          dark: "#B91C1C",
          shadow: "rgba(220, 38, 38, 0.22)",
        });
      case "ghost":
        return {
          color: tokens.gray600,
          bgcolor: "transparent",
          "&:hover": {
            bgcolor: tokens.gray100,
            color: tokens.gray900,
          },
        };
      case "upload":
        return {
          minHeight: 46,
          color: tokens.primary,
          borderColor: tokens.primary,
          backgroundColor: tokens.white,
          borderRadius: "999px",
          "&:hover": {
            backgroundColor: "rgba(27, 42, 74, 0.06)",
            borderColor: tokens.primaryDark,
          },
        };
      default:
        return {};
    }
  })();

  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: "999px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&:disabled": {
          bgcolor: tokens.disabledBg,
          color: tokens.disabledText,
          borderColor: tokens.disabledBg,
          boxShadow: "none",
          cursor: "not-allowed",
          pointerEvents: "auto",
          transform: "none",
        },
        ...variantSx,
        ...props.sx,
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} sx={{ color: "inherit" }} />
          {children}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};
