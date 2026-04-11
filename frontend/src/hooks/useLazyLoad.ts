import { useEffect, useRef, useState } from "react";

/**
 * Hook to detect when an element enters the viewport using Intersection Observer.
 * Useful for lazy loading components/images as user scrolls.
 *
 * @returns { ref: React.RefObject, isVisible: boolean }
 * @example
 * const { ref, isVisible } = useLazyLoad();
 * return <div ref={ref}>{isVisible && <ExpensiveComponent />}</div>;
 */
export const useLazyLoad = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // If component is already visible in viewport initially, mark it as visible
    const checkInitialVisibility = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setIsVisible(true);
        }
      }
    };

    checkInitialVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after becoming visible to avoid re-renders
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.01,
        ...options,
      },
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible };
};
