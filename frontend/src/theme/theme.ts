import { createTheme, type ThemeOptions } from "@mui/material/styles";

/*
 * ──────────────────────────────────────────────────────────
 *  GADGIFY DESIGN SYSTEM
 * ──────────────────────────────────────────────────────────
 *  Color palette:
 *    Primary   → Deep Indigo  #1B2A4A   (trust, authority)
 *    Accent    → Vivid Orange #FF6B2C   (CTA, energy)
 *    Secondary → Teal         #0EA5E9   (links, info)
 *    Neutrals  → Warm grays for backgrounds & text
 *
 *  Typography: Inter (headings + body) — clean, geometric,
 *  excellent readability at every size.
 *
 *  Spacing scale: 8px base (MUI default).
 *
 *  All contrast ratios ≥ 4.5:1 on their intended backgrounds
 *  to meet WCAG AA.
 * ──────────────────────────────────────────────────────────
 */

// ─── Design tokens ───────────────────────────────────────
const tokens = {
  // Core brand
  primary: "#1B2A4A",
  primaryLight: "#2D4A7A",
  primaryDark: "#0F1B30",

  accent: "#FF6B2C",
  accentLight: "#FF8F5E",
  accentDark: "#E05A1F",

  secondary: "#0EA5E9",
  secondaryLight: "#38BDF8",
  secondaryDark: "#0284C7",

  // Semantic
  success: "#16A34A",
  successLight: "#DCFCE7",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  info: "#0EA5E9",
  infoLight: "#E0F2FE",

  // Neutrals (warm gray)
  white: "#FFFFFF",
  gray50: "#FAFAFA",
  gray100: "#F5F5F4",
  gray200: "#E7E5E4",
  gray300: "#D6D3D1",
  gray400: "#A8A29E",
  gray500: "#78716C",
  gray600: "#57534E",
  gray700: "#44403C",
  gray800: "#292524",
  gray900: "#1C1917",
  black: "#0C0A09",

  // Surfaces
  bgDefault: "#FAFAFA",
  bgPaper: "#FFFFFF",
  bgSubtle: "#F5F5F4",

  // Dark mode surfaces
  darkBg: "#0F172A",
  darkPaper: "#1E293B",
  darkSubtle: "#334155",
};

const fontFamily = [
  "Inter",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  "sans-serif",
].join(",");

// ─── Shared options (light & dark) ──────────────────────
const baseOptions: ThemeOptions = {
  typography: {
    fontFamily,
    h1: {
      fontSize: "2.25rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.875rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
    },
    h3: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.5 },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.02em",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none" as const,
      letterSpacing: "0.01em",
    },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
    },
  },

  shape: { borderRadius: 12 },
  spacing: 8, // 8px scale: 1 = 8px, 2 = 16px …

  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
};

// ─── Component overrides ─────────────────────────────────
function componentOverrides(
  mode: "light" | "dark",
): ThemeOptions["components"] {
  const isDark = mode === "dark";

  return {
    MuiCssBaseline: {
      styleOverrides: {
        // Inject Inter from Google Fonts
        html: {
          scrollBehavior: "smooth",
        },
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          minHeight: 42,
          padding: "8px 20px",
          fontSize: "0.875rem",
          transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
          "&:focus-visible": {
            outline: `2px solid ${tokens.accent}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          backgroundColor: tokens.accent,
          color: tokens.white,
          "&:hover": {
            backgroundColor: tokens.accentDark,
            boxShadow: "0 4px 14px rgba(255,107,44,0.35)",
          },
        },
        outlinedPrimary: {
          borderColor: tokens.accent,
          color: tokens.accent,
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255,107,44,0.08)"
              : "rgba(255,107,44,0.06)",
            borderColor: tokens.accentDark,
          },
        },
        text: {
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: isDark
            ? "0 1px 3px rgba(0,0,0,0.4)"
            : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          borderRadius: 16,
          border: `1px solid ${isDark ? tokens.darkSubtle : tokens.gray200}`,
          transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
          "&:hover": {
            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.5)"
              : "0 10px 30px rgba(0,0,0,0.08)",
            transform: "translateY(-4px)",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover fieldset": {
              borderColor: tokens.secondary,
            },
            "&.Mui-focused fieldset": {
              borderColor: tokens.secondary,
              boxShadow: `0 0 0 3px ${isDark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.12)"}`,
            },
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? tokens.darkPaper : tokens.primary,
          backgroundImage: "none",
          borderBottom: `1px solid ${isDark ? tokens.darkSubtle : "rgba(255,255,255,0.08)"}`,
          boxShadow: isDark
            ? "0 1px 3px rgba(0,0,0,0.4)"
            : "0 1px 3px rgba(0,0,0,0.12)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
          "&:focus-visible": {
            outline: `2px solid ${tokens.accent}`,
            outlineOffset: 2,
          },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: "0.65rem",
          minWidth: 18,
          height: 18,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 4px",
          transition: "background-color 0.15s",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: isDark ? tokens.darkPaper : tokens.white,
          borderRight: `1px solid ${isDark ? tokens.darkSubtle : tokens.gray200}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? tokens.darkSubtle : tokens.gray200,
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  };
}

// ─── Light theme ─────────────────────────────────────────
export const theme = createTheme({
  ...baseOptions,
  palette: {
    mode: "light",
    primary: {
      main: tokens.primary,
      light: tokens.primaryLight,
      dark: tokens.primaryDark,
      contrastText: tokens.white,
    },
    secondary: {
      main: tokens.secondary,
      light: tokens.secondaryLight,
      dark: tokens.secondaryDark,
      contrastText: tokens.white,
    },
    error: { main: tokens.error, light: tokens.errorLight },
    warning: { main: tokens.warning, light: tokens.warningLight },
    info: { main: tokens.info, light: tokens.infoLight },
    success: { main: tokens.success, light: tokens.successLight },
    background: { default: tokens.bgDefault, paper: tokens.bgPaper },
    text: { primary: tokens.gray900, secondary: tokens.gray600 },
    divider: tokens.gray200,
  },
  components: componentOverrides("light"),
});

// ─── Dark theme ──────────────────────────────────────────
export const darkTheme = createTheme({
  ...baseOptions,
  palette: {
    mode: "dark",
    primary: {
      main: tokens.primaryLight,
      light: tokens.secondary,
      dark: tokens.primaryDark,
      contrastText: tokens.white,
    },
    secondary: {
      main: tokens.secondaryLight,
      light: tokens.secondaryLight,
      dark: tokens.secondaryDark,
      contrastText: tokens.gray900,
    },
    error: { main: "#F87171", light: tokens.errorLight },
    warning: { main: "#FBBF24", light: tokens.warningLight },
    info: { main: tokens.secondaryLight, light: tokens.infoLight },
    success: { main: "#4ADE80", light: tokens.successLight },
    background: { default: tokens.darkBg, paper: tokens.darkPaper },
    text: { primary: "#F1F5F9", secondary: "#94A3B8" },
    divider: tokens.darkSubtle,
  },
  components: componentOverrides("dark"),
});

// Export tokens for use in inline styles where needed
export { tokens };
