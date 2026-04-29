/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from "@mui/material";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

interface InViewProps extends ComponentProps<typeof Box> {
  children: React.ReactNode;
  animationType?:
    | "fadeIn"
    | "slideUp"
    | "slideInLeft"
    | "slideInRight"
    | "zoom";
  delay?: number;
  threshold?: number;
}

/**
 * InView component wraps content and animates it when scrolled into view
 */
export const InView = forwardRef<HTMLDivElement, InViewProps>(
  (
    {
      children,
      animationType = "fadeIn",
      delay = 0,
      threshold = 0.1,
      sx,
      ...props
    },
    externalRef,
  ) => {
    const { ref, isVisible } = useInViewAnimation({
      threshold,
      triggerOnce: true,
    });

    const getAnimation = () => {
      const baseAnimation = {
        opacity: isVisible ? 1 : 0,
        transform:
          animationType === "fadeIn"
            ? "translateY(0)"
            : animationType === "slideUp"
              ? isVisible
                ? "translateY(0)"
                : "translateY(40px)"
              : animationType === "slideInLeft"
                ? isVisible
                  ? "translateX(0)"
                  : "translateX(-40px)"
                : animationType === "slideInRight"
                  ? isVisible
                    ? "translateX(0)"
                    : "translateX(40px)"
                  : animationType === "zoom"
                    ? isVisible
                      ? "scale(1)"
                      : "scale(0.95)"
                    : "none",
      };

      return {
        ...baseAnimation,
        transition: isVisible ? `all 0.4s ease-out ${delay}ms` : "none",
      };
    };

    return (
      <Box
        ref={(element: any) => {
          (ref as any).current = element;
          if (typeof externalRef === "function") {
            externalRef(element);
          } else if (externalRef) {
            externalRef.current = element;
          }
        }}
        sx={{
          ...getAnimation(),
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

InView.displayName = "InView";

export default InView;
