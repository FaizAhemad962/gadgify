import { Suspense, ReactNode } from "react";
import { Box, Skeleton, keyframes } from "@mui/material";
import { useLazyLoad } from "@/hooks/useLazyLoad";

// Fade-in animation for loaded content
const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Pulse animation for skeleton loaders
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
`;

interface LazySectionProps {
  children: ReactNode;
  skeletonHeight?: number;
  fallback?: ReactNode;
}

/**
 * Wrapper component for lazy-loaded sections.
 * Detects when section enters viewport before loading the component.
 * Shows skeleton/fallback with smooth animations while content loads.
 *
 * @example
 * <LazySection skeletonHeight={400}>
 *   <ExpensiveComponent />
 * </LazySection>
 */
export const LazySection = ({
  children,
  skeletonHeight = 400,
  fallback,
}: LazySectionProps) => {
  const { ref, isVisible } = useLazyLoad();

  const defaultFallback = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 8 }}>
      {[...Array(3)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={skeletonHeight / 3}
          sx={{
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
            borderRadius: 2,
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box
      ref={ref}
      sx={{
        animation: isVisible
          ? `${fadeInAnimation} 0.6s ease-out forwards`
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {/* Only render children when visible to prevent unnecessary loads */}
      {isVisible ? (
        <Suspense fallback={fallback || defaultFallback}>
          <Box
            sx={{
              animation: `${fadeInAnimation} 0.6s ease-out forwards`,
              willChange: "opacity, transform",
            }}
          >
            {children}
          </Box>
        </Suspense>
      ) : (
        /* Show placeholder while not in viewport */
        <Box sx={{ minHeight: skeletonHeight }} />
      )}
    </Box>
  );
};
