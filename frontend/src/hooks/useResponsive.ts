import { useMediaQuery, useTheme } from "@mui/material";
import { breakpoints, type BreakpointKey } from "@/theme/breakpoints";

/**
 * Hook for accessing responsive breakpoint info
 * Useful for conditional rendering based on screen size
 */
export const useResponsive = () => {
  const theme = useTheme();

  // Queries for each breakpoint
  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  // Combined utilities
  const isMobile = isXs; // Mobile portrait
  const isTablet = isSm && !isMd; // Tablets
  const isDesktop = isMd; // Desktop and up
  const isLargeScreen = isLg; // Large screens

  return {
    // Individual breakpoint queries
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,

    // Semantic queries
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,

    // Current breakpoint
    currentBreakpoint: isXl
      ? ("xl" as BreakpointKey)
      : isLg
        ? ("lg" as BreakpointKey)
        : isMd
          ? ("md" as BreakpointKey)
          : isSm
            ? ("sm" as BreakpointKey)
            : ("xs" as BreakpointKey),
  };
};

/**
 * Hook for responsive values
 * Returns different values based on current breakpoint
 * Usage: useResponsiveValue({ xs: 8, md: 16, lg: 24 })
 */
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T | undefined => {
  const { currentBreakpoint } = useResponsive();

  const breakpointOrder: BreakpointKey[] = ["xs", "sm", "md", "lg", "xl"];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Find the largest breakpoint with a defined value at or below current
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
};

/**
 * Hook for getting responsive SX styles
 * Helper to apply different sx styles per breakpoint
 */
export const useResponsiveSx = <T extends Record<string, unknown>>(
  styles: Partial<Record<BreakpointKey, T>>,
) => {
  const { currentBreakpoint } = useResponsive();
  return styles[currentBreakpoint] || {};
};
