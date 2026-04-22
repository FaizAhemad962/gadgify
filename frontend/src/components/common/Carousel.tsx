/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useCallback, useMemo } from "react";
import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { tokens } from "@/theme/theme";

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveBreakpoint {
  breakpoint: number;
  slidesPerView: number;
  spaceBetween: number;
}

/**
 * Carousel component props
 */
export interface CarouselProps {
  /** Array of items/content to display in carousel */
  items: React.ReactNode[];

  /** Number of slides to display per view (default: 3) */
  slidesPerView?: number;

  /** Space between slides in pixels (default: 16) */
  spaceBetween?: number;

  /** Responsive breakpoints configuration */
  breakpoints?: ResponsiveBreakpoint[];

  /** Enable autoplay (default: false) */
  autoplay?: boolean;

  /** Autoplay delay in milliseconds (default: 5000) */
  autoplayDelay?: number;

  /** Show pagination dots (default: true) */
  showPagination?: boolean;

  /** Show navigation arrows (default: true) */
  showNavigation?: boolean;

  /** Loop infinite carousel (default: true) */
  loop?: boolean;

  /** Enable coverflow 3D effect (default: false) */
  effect?: "slide" | "coverflow";

  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;

  /** Custom styles for container */
  sx?: SxProps<Theme>;

  /** Hide dots on mobile (default: true) */
  hidePaginationOnMobile?: boolean;

  /** Center slides (default: false) */
  centeredSlides?: boolean;

  /** Pause autoplay on hover (default: true) */
  pauseOnHover?: boolean;

  /** Keyboard navigation (default: true) */
  keyboard?: boolean;

  /** Mouse wheel control (default: true) */
  mouseWheel?: boolean;

  /** Custom navigation button styles */
  navButtonSx?: SxProps<Theme>;

  /** Lazy load images (default: false) */
  lazy?: boolean;

  /** Custom class name */
  className?: string;

  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Carousel Component - Responsive, customizable carousel using Swiper
 *
 * Features:
 * - Fully responsive with mobile, tablet, desktop breakpoints
 * - TypeScript support with complete prop typing
 * - Multiple effects (slide, coverflow)
 * - Autoplay with pause on hover
 * - Keyboard and mouse wheel navigation
 * - Accessibility features
 * - Lazy loading support
 * - Customizable styling
 *
 * @example
 * ```tsx
 * <Carousel
 *   items={products.map(p => <ProductCard key={p.id} product={p} />)}
 *   slidesPerView={3}
 *   spaceBetween={16}
 *   autoplay={true}
 *   effect="slide"
 * />
 * ```
 */
const Carousel = ({
  items,
  slidesPerView = 3,
  spaceBetween = 16,
  breakpoints,
  autoplay = false,
  autoplayDelay = 5000,
  showPagination = true,
  showNavigation = true,
  loop = true,
  effect = "slide",
  onSlideChange,
  sx,
  hidePaginationOnMobile = true,
  centeredSlides = false,
  pauseOnHover = true,
  keyboard = true,
  mouseWheel = true,
  navButtonSx,
  className,
  ariaLabel = "Image carousel",
}: CarouselProps) => {
  const theme = useTheme();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Breakpoint detection
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  /**
   * Default responsive breakpoints if not provided
   */
  const activeBreakpoints = useMemo(() => {
    const defaultBreakpoints: ResponsiveBreakpoint[] = [
      { breakpoint: 0, slidesPerView: slidesPerView || 1, spaceBetween: 12 }, // Mobile
      { breakpoint: 600, slidesPerView: slidesPerView || 2, spaceBetween: 14 }, // Tablet
      { breakpoint: 960, slidesPerView: slidesPerView || 3, spaceBetween: 16 }, // Desktop
      { breakpoint: 1280, slidesPerView: slidesPerView || 4, spaceBetween: 18 }, // Large
    ];
    return breakpoints || defaultBreakpoints;
  }, [breakpoints]);

  /**
   * Convert breakpoints to Swiper format
   */
  const swiperBreakpoints = useMemo(() => {
    const breakpointMap: Record<
      number,
      { slidesPerView: number; spaceBetween: number }
    > = {};
    activeBreakpoints.forEach((bp) => {
      breakpointMap[bp.breakpoint] = {
        slidesPerView: bp.slidesPerView,
        spaceBetween: bp.spaceBetween,
      };
    });
    return breakpointMap;
  }, [activeBreakpoints]);

  /**
   * Handle slide change
   */
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      onSlideChange?.(swiper.activeIndex);
    },
    [onSlideChange],
  );

  /**
   * Navigate to previous slide
   */
  const goToPrevious = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  /**
   * Navigate to next slide
   */
  const goToNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  /**
   * Get responsive slides per view
   */
  const getResponsiveSlidesPerView = useCallback(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isLargeScreen) return Math.min(slidesPerView + 1, items.length);
    return slidesPerView;
  }, [isMobile, isTablet, isLargeScreen, slidesPerView, items.length]);

  // Return empty state if no items
  if (!items || items.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.gray100,
          borderRadius: 2,
          ...sx,
        }}
      >
        No items to display
      </Box>
    );
  }

  return (
    <Box
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: "100%",
        position: "relative",
        "& .swiper": {
          width: "100%",
          height: "100%",
        },
        "& .swiper-slide": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        ...sx,
      }}
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <Swiper
        ref={swiperRef as unknown as any}
        modules={[
          Navigation,
          Pagination,
          Autoplay,
          ...(effect === "coverflow" ? [EffectCoverflow] : []),
        ]}
        slidesPerView={getResponsiveSlidesPerView()}
        spaceBetween={spaceBetween}
        breakpoints={swiperBreakpoints}
        autoplay={
          autoplay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: true,
                pauseOnMouseEnter: pauseOnHover,
              }
            : false
        }
        pagination={
          showPagination
            ? {
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 3,
              }
            : false
        }
        navigation={
          showNavigation
            ? {
                nextEl: ".carousel-next",
                prevEl: ".carousel-prev",
              }
            : false
        }
        loop={loop && items.length > 1}
        onSlideChange={handleSlideChange}
        centeredSlides={centeredSlides}
        keyboard={{ enabled: keyboard }}
        mousewheel={mouseWheel}
        effect={effect}
        coverflowEffect={
          effect === "coverflow"
            ? {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }
            : undefined
        }
        grabCursor={true}
        speed={500}
        watchSlidesProgress={true}
        className="gadgify-carousel"
      >
        {items.map((item, index) => (
          <SwiperSlide key={index} data-index={index} style={{ width: "100%" }}>
            <Box sx={{ width: "100%" }}>{item}</Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      {showNavigation && items.length > 1 && (
        <>
          {/* Previous Button */}
          <IconButton
            className="carousel-prev"
            onClick={goToPrevious}
            sx={{
              position: "absolute",
              left: { xs: 8, sm: 12, md: 16 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: `${tokens.white}cc`,
              color: tokens.accent,
              transition: "all 0.3s ease",
              opacity: isHovered ? 1 : 0.7,
              "&:hover": {
                backgroundColor: tokens.white,
                color: tokens.primary,
                boxShadow: `0 4px 12px rgba(255, 152, 0, 0.3)`,
              },
              width: { xs: 36, sm: 40, md: 44 },
              height: { xs: 36, sm: 40, md: 44 },
              ...navButtonSx,
            }}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Next Button */}
          <IconButton
            className="carousel-next"
            onClick={goToNext}
            sx={{
              position: "absolute",
              right: { xs: 8, sm: 12, md: 16 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: `${tokens.white}cc`,
              color: tokens.accent,
              transition: "all 0.3s ease",
              opacity: isHovered ? 1 : 0.7,
              "&:hover": {
                backgroundColor: tokens.white,
                color: tokens.primary,
                boxShadow: `0 4px 12px rgba(255, 152, 0, 0.3)`,
              },
              width: { xs: 36, sm: 40, md: 44 },
              height: { xs: 36, sm: 40, md: 44 },
              ...navButtonSx,
            }}
            aria-label="Next slide"
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {/* Custom Pagination Styles */}
      <style>{`
        .gadgify-carousel .swiper-pagination {
          bottom: ${hidePaginationOnMobile && isMobile ? "-40px" : "16px"};
          opacity: ${hidePaginationOnMobile && isMobile ? "0" : "1"};
          transition: all 0.3s ease;
        }

        .gadgify-carousel .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: ${tokens.gray300};
          opacity: 0.7;
          margin: 0 6px;
          transition: all 0.3s ease;
        }

        .gadgify-carousel .swiper-pagination-bullet-active {
          background-color: ${tokens.accent};
          width: 24px;
          border-radius: 4px;
          opacity: 1;
        }

        .gadgify-carousel .swiper-pagination-progressbar-fill {
          background: linear-gradient(90deg, ${tokens.accent}, ${tokens.primary});
        }

        /* Keyboard focus styles for accessibility */
        .gadgify-carousel .carousel-prev:focus,
        .gadgify-carousel .carousel-next:focus {
          outline: 2px solid ${tokens.accent};
          outline-offset: 2px;
        }

        /* Touch and mobile improvements */
        @media (max-width: 600px) {
          .gadgify-carousel .swiper-pagination {
            bottom: 8px;
          }

          .gadgify-carousel .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            margin: 0 4px;
          }

          .gadgify-carousel .carousel-prev,
          .gadgify-carousel .carousel-next {
            opacity: 0.5;
          }

          .gadgify-carousel:hover .carousel-prev,
          .gadgify-carousel:hover .carousel-next {
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default Carousel;
