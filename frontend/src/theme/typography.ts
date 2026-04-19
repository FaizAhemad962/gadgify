/**
 * Responsive Typography Scale for Gadgify
 * Fluid typography that scales smoothly between breakpoints
 * Follows modern web typography practices
 */

import { breakpoints } from "./breakpoints";

/**
 * Fluid typography function
 * Scales font size smoothly from minSize to maxSize across viewport
 * @param minSize - Font size on mobile (px)
 * @param maxSize - Font size on desktop (px)
 * @param minWidth - Viewport width for minimum size (px)
 * @param maxWidth - Viewport width for maximum size (px)
 */
export const fluidType = (
  minSize: number,
  maxSize: number,
  minWidth: number = breakpoints.xs,
  maxWidth: number = breakpoints.xl,
): string => {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const intercept = minSize - slope * minWidth;
  const slopePercent = slope * 100;

  return `clamp(${minSize}px, ${slopePercent.toFixed(2)}vw + ${intercept.toFixed(2)}px, ${maxSize}px)`;
};

/**
 * Responsive typography variants
 * Each variant includes mobile and desktop sizes with smooth transitions
 */
export const responsiveTypography = {
  // Display/Hero headings
  h1: {
    xs: {
      fontSize: "2rem", // 32px
      lineHeight: "1.2",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    sm: {
      fontSize: "2.5rem", // 40px
      lineHeight: "1.2",
    },
    md: {
      fontSize: "3rem", // 48px
    },
    lg: {
      fontSize: "3.5rem", // 56px
    },
    xl: {
      fontSize: "4rem", // 64px
    },
  },

  // Section headings
  h2: {
    xs: { fontSize: "1.75rem", fontWeight: 700, lineHeight: "1.3" },
    sm: { fontSize: "2.125rem" },
    md: { fontSize: "2.5rem" },
    lg: { fontSize: "2.8rem" },
    xl: { fontSize: "3rem" },
  },

  // Subsection headings
  h3: {
    xs: { fontSize: "1.375rem", fontWeight: 700, lineHeight: "1.4" },
    sm: { fontSize: "1.625rem" },
    md: { fontSize: "1.875rem" },
    lg: { fontSize: "2.125rem" },
    xl: { fontSize: "2.25rem" },
  },

  // Card/component headings
  h4: {
    xs: { fontSize: "1.125rem", fontWeight: 700, lineHeight: "1.4" },
    sm: { fontSize: "1.25rem" },
    md: { fontSize: "1.375rem" },
    lg: { fontSize: "1.5rem" },
    xl: { fontSize: "1.625rem" },
  },

  // Labels & smaller headings
  h5: {
    xs: { fontSize: "1rem", fontWeight: 600, lineHeight: "1.5" },
    sm: { fontSize: "1.0625rem" },
    md: { fontSize: "1.125rem" },
  },

  h6: {
    xs: { fontSize: "0.875rem", fontWeight: 600, lineHeight: "1.5" },
    md: { fontSize: "0.9375rem" },
  },

  // Body text (main content)
  body1: {
    xs: { fontSize: "0.9375rem", lineHeight: "1.6", fontWeight: 400 },
    md: { fontSize: "1rem" },
  },

  // Secondary body text
  body2: {
    xs: { fontSize: "0.875rem", lineHeight: "1.5", fontWeight: 400 },
    md: { fontSize: "0.9375rem" },
  },

  // Small text (captions, metadata)
  caption: {
    xs: { fontSize: "0.75rem", lineHeight: "1.4", fontWeight: 400 },
    md: { fontSize: "0.8125rem" },
  },

  // Overline (all caps labeling)
  overline: {
    xs: { fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.06em" },
    md: { fontSize: "0.75rem" },
  },

  // UI text (buttons, labels)
  button: {
    xs: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: "1.5" },
    md: { fontSize: "1rem" },
  },
} as const;

/**
 * Helper to get responsive font size with proper scaling
 * Usage: typography.getResponsiveSize('h1')
 */
export const getResponsiveSize = (
  variant: keyof typeof responsiveTypography,
) => {
  const sizes = responsiveTypography[variant];
  return sizes;
};

/**
 * Fluid size generator - returns CSS that scales smoothly
 * Usage: typography.fluid.h1 for smooth scaling from xs to xl
 */
export const fluidSizes = {
  h1: fluidType(32, 64),
  h2: fluidType(28, 48),
  h3: fluidType(22, 36),
  h4: fluidType(18, 32),
  body1: fluidType(15, 16),
  body2: fluidType(14, 15),
} as const;
