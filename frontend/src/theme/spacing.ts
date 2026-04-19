/**
 * Responsive Spacing Scale for Gadgify
 * 8px-based spacing system with breakpoint-specific adjustments
 */

/**
 * Base spacing unit = 8px
 * All spacing follows 8px increment scale
 */
export const baseUnit = 8; // px

/**
 * Spacing scale: 8px base
 * 0, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96
 */
export const spacing = {
  0: 0,
  1: baseUnit * 0.5, // 4px
  2: baseUnit * 1, // 8px
  3: baseUnit * 2, // 16px
  4: baseUnit * 3, // 24px
  5: baseUnit * 4, // 32px
  6: baseUnit * 5, // 40px
  7: baseUnit * 6, // 48px
  8: baseUnit * 7, // 56px
  9: baseUnit * 8, // 64px
  10: baseUnit * 9, // 72px
  11: baseUnit * 10, // 80px
  12: baseUnit * 11, // 88px
  13: baseUnit * 12, // 96px
  14: baseUnit * 13, // 104px
  15: baseUnit * 14, // 112px
  16: baseUnit * 16, // 128px
  20: baseUnit * 20, // 160px
  24: baseUnit * 24, // 192px
} as const;

/**
 * Responsive padding/margins that adjust per breakpoint
 * mobile-first approach: start with smallest, increase on larger screens
 */
export const responsiveSpacing = {
  // Page padding
  pagePadding: {
    xs: spacing[2], // 8px on mobile
    sm: spacing[3], // 16px on small screens
    md: spacing[4], // 24px on tablet
    lg: spacing[5], // 32px on desktop
    xl: spacing[6], // 40px on large desktop
  },

  // Container padding
  containerPadding: {
    xs: spacing[3], // 16px
    sm: spacing[4], // 24px
    md: spacing[5], // 32px
    lg: spacing[6], // 40px
    xl: spacing[6], // 40px
  },

  // Section spacing (gap between sections)
  sectionGap: {
    xs: spacing[4], // 24px
    sm: spacing[5], // 32px
    md: spacing[6], // 40px
    lg: spacing[7], // 48px
    xl: spacing[8], // 56px
  },

  // Component spacing (card padding, input padding)
  componentPadding: {
    xs: spacing[2], // 8px
    sm: spacing[3], // 16px
    md: spacing[3], // 16px
    lg: spacing[4], // 24px
  },

  // Grid gaps
  gridGap: {
    xs: spacing[2], // 8px on mobile
    sm: spacing[2], // 8px on small
    md: spacing[3], // 16px on tablet
    lg: spacing[4], // 24px on desktop
  },

  // Compact spacing (buttons, small elements)
  compact: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[2], // 8px
  },

  // Loose spacing (blocks, sections)
  loose: {
    xs: spacing[5], // 32px
    sm: spacing[6], // 40px
    md: spacing[7], // 48px
    lg: spacing[8], // 56px
  },
} as const;

/**
 * Container/Content width
 */
export const containerWidth = {
  sm: "100%", // Full width with padding
  md: "800px",
  lg: "1280px",
  xl: "1440px",
} as const;

/**
 * Fluid width function
 * Maintains max-width with responsive padding
 */
export const createResponsiveContainer = (
  maxWidth: number = 1280,
  basePadding = spacing[3],
) => ({
  width: "100%",
  maxWidth: `${maxWidth}px`,
  padding: `0 ${basePadding}px`,
  margin: "0 auto",
});

/**
 * Touch target minimum size (WCAG requirement: 44x44px)
 */
export const touchTargetSize = 44; // px
