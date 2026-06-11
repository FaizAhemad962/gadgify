import { useEffect, useRef, useState } from "react";

interface UseInViewAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for animating elements when they come into view
 * Returns ref to attach to element and isVisible state
 */
export const useInViewAnimation = (options: UseInViewAnimationOptions = {}) => {
  const { threshold = 0.05, rootMargin = "200px", triggerOnce = true } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);

          // Stop observing if triggerOnce is true
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else {
          // Only reset visibility if triggerOnce is false
          if (!triggerOnce) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref: elementRef,
    isVisible: triggerOnce ? hasBeenVisible : isVisible,
  };
};

export default useInViewAnimation;
