import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: number | string;
  padding?: string | number;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "1500px",
  padding,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: maxWidth,
        mx: "auto",
        px: padding || (isMobile ? 3 : 6), // 24px mobile, 48px desktop
        py: isMobile ? 2 : 4, // 16px mobile, 32px desktop
        boxSizing: "border-box",
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
