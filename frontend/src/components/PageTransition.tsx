import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * PageTransition - Adds fade-in animation when navigating between pages
 */
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset visibility on route change
    setIsVisible(false);
    // Fade in after a tiny delay
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <Box
      sx={{
        animation: isVisible
          ? "fadeIn 0.3s ease-in-out"
          : "fadeOut 0.1s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "@keyframes fadeOut": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
