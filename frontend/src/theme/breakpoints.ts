/**
 * Responsive Breakpoints for Gadgify
 * Following Material Design principles with ecommerce-friendly sizing
 */

export const breakpoints = {
  xs: 0, // Mobile portrait (phones)
  sm: 640, // Mobile landscape & small tablets
  md: 960, // Tablets & small desktops
  lg: 1280, // Desktop
  xl: 1536, // Large desktop
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Media query generators
 * Usage: ${media.sm} { ... }
 */
export const media = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  // Useful for mobile-first approach
  smallOnly: `@media (max-width: ${breakpoints.sm - 1}px)`,
  mediumOnly: `@media (max-width: ${breakpoints.md - 1}px)`,
} as const;

/**
 * Container queries template
 * Usage: css with container queries for component-level responsiveness
 */
export const containerQueries = {
  sm: "@container (min-width: 300px)",
  md: "@container (min-width: 500px)",
  lg: "@container (min-width: 800px)",
  xl: "@container (min-width: 1200px)",
} as const;
