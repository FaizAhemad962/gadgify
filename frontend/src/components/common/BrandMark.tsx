import { Box, Typography, type SxProps, type Theme } from "@/mui/material";
import { tokens } from "@/theme/theme";

interface BrandMarkProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

const BrandMark = ({
  size = 40,
  showText = false,
  textColor = "inherit",
  onClick,
  sx,
}: BrandMarkProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        cursor: onClick ? "pointer" : "inherit",
        ...sx,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: size,
          height: size,
          borderRadius: Math.max(10, size * 0.25),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentDark} 100%)`,
          boxShadow: `0 6px 18px ${tokens.accent}33`,
          color: tokens.white,
          fontSize: size * 0.55,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.06em",
        }}
      >
        G
      </Box>
      {showText && (
        <Typography
          component="span"
          sx={{
            color: textColor,
            fontWeight: 800,
            fontSize: size >= 64 ? "1.75rem" : "1.25rem",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Gadgify
        </Typography>
      )}
    </Box>
  );
};

export default BrandMark;
