import {
  Box,
  Button,
  Typography,
  type SxProps,
  type Theme,
} from "@/mui/material";
import { ArrowForward } from "@/mui/icons";
import { tokens } from "@/theme/theme";
import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actionLabel?: ReactNode;
  onActionClick?: () => void;
  align?: "left" | "center";
  sx?: SxProps<Theme>;
};

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  align = "left",
  sx,
}: SectionHeaderProps) => {
  const hasAction = actionLabel && onActionClick;

  return (
    <Box
      sx={[
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems:
            align === "center" ? "center" : { xs: "flex-start", sm: "center" },
          flexDirection:
            align === "center" ? "column" : { xs: "column", sm: "row" },
          textAlign: align,
          gap: 1,
          mb: 1,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box>
        <Typography
          variant="h3"
          fontWeight="700"
          sx={{
            color: "text.primary",
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
              maxWidth: align === "center" ? 640 : undefined,
              mx: align === "center" ? "auto" : undefined,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {hasAction && (
        <Button
          endIcon={<ArrowForward />}
          onClick={onActionClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: tokens.primary,
            minHeight: 44,
            px: 2,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default SectionHeader;
