import type { ReactNode } from "react";
import { Box, Chip, Paper, Stack, Typography, type SxProps, type Theme } from "@/mui/material";
import { tokens } from "@/theme/theme";
import { adminPanelSx } from "./adminStyleTokens";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: ReactNode;
  action?: ReactNode;
  sx?: SxProps<Theme>;
};

export const AdminPageHeader = ({
  title,
  subtitle,
  eyebrow,
  icon,
  action,
  sx,
}: AdminPageHeaderProps) => (
  <Paper
    elevation={0}
    sx={{
      ...adminPanelSx,
      p: { xs: 2.5, md: 3 },
      mb: 3,
      background:
        "linear-gradient(135deg, rgba(27,42,74,0.06), rgba(255,107,44,0.08))",
      ...(sx as object),
    }}
  >
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      gap={2}
    >
      <Stack direction="row" spacing={1.75} alignItems="center">
        {icon && (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              color: tokens.accent,
              bgcolor: `${tokens.accent}14`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          {eyebrow && (
            <Chip
              label={eyebrow}
              size="small"
              sx={{
                mb: 1,
                bgcolor: tokens.white,
                color: tokens.primary,
                fontWeight: 800,
              }}
            />
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: tokens.gray900,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ mt: 0.5, color: tokens.gray600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  </Paper>
);

type AdminStatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: string;
  helper?: ReactNode;
};

export const AdminStatCard = ({
  label,
  value,
  icon,
  color = tokens.primary,
  helper,
}: AdminStatCardProps) => (
  <Paper
    elevation={0}
    sx={{
      ...adminPanelSx,
      p: 2.25,
      height: "100%",
      position: "relative",
      overflow: "hidden",
      transition: "transform 180ms ease, box-shadow 180ms ease",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "0 auto 0 0",
        width: 5,
        bgcolor: color,
      },
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 18px 44px ${color}22`,
      },
    }}
  >
    <Stack direction="row" spacing={1.75} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          color,
          bgcolor: `${color}14`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, color: tokens.gray900 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.gray500 }}>
          {label}
        </Typography>
        {helper}
      </Box>
    </Stack>
  </Paper>
);
