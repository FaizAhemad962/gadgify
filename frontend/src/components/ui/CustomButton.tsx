import { Button, type ButtonProps, CircularProgress, Box } from "@/mui/material";
import { tokens } from "@/theme/theme";

interface CustomButtonProps extends ButtonProps {
  appVariant?: "primary" | "admin" | "secondary" | "danger" | "ghost" | "upload";
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
  const variantSx = (() => {
    switch (appVariant) {
      case "primary":
        return {
          minHeight: 46,
          px: 2.5,
          background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.accentDark})`,
          backgroundColor: tokens.accent,
          color: tokens.white,
          borderColor: tokens.accent,
          boxShadow: "0 10px 22px rgba(255, 107, 44, 0.22)",
          "&:hover": {
            background: `linear-gradient(135deg, ${tokens.accentDark}, ${tokens.accent})`,
            backgroundColor: tokens.accentDark,
            borderColor: tokens.accentDark,
            boxShadow: "0 14px 28px rgba(255, 107, 44, 0.3)",
            transform: "translateY(-1px)",
          },
        };
      case "admin":
        return {
          minHeight: 46,
          px: 2.5,
          background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.primaryDark})`,
          backgroundColor: tokens.primary,
          color: tokens.white,
          borderColor: tokens.primary,
          boxShadow: "0 10px 22px rgba(27, 42, 74, 0.22)",
          "&:hover": {
            background: `linear-gradient(135deg, ${tokens.primaryDark}, ${tokens.primary})`,
            backgroundColor: tokens.primaryDark,
            borderColor: tokens.primaryDark,
            boxShadow: "0 14px 28px rgba(27, 42, 74, 0.3)",
            transform: "translateY(-1px)",
          },
        };
      case "secondary":
        return {
          color: tokens.primary,
          borderColor: tokens.primary,
          bgcolor: tokens.white,
          "&:hover": {
            bgcolor: "rgba(27, 42, 74, 0.06)",
            borderColor: tokens.primaryDark,
          },
        };
      case "danger":
        return {
          backgroundColor: tokens.error,
          color: tokens.white,
          borderColor: tokens.error,
          "&:hover": {
            backgroundColor: "#B91C1C",
            borderColor: "#B91C1C",
          },
        };
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
          bgcolor: tokens.gray200,
          color: tokens.gray500,
          borderColor: tokens.gray200,
          boxShadow: "none",
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
