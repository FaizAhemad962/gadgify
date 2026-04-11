import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  // Helper function to scroll to top
  const scrollToTopHelper = () => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    // Also add a small timeout as backup
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  };

  // Scroll on route change
  useEffect(() => {
    scrollToTopHelper();
  }, [pathname]);

  // Scroll on any navigation action (including same route)
  useEffect(() => {
    scrollToTopHelper();
  }, [navigationType]);

  // Scroll on initial mount (page refresh)
  useEffect(() => {
    scrollToTopHelper();
  }, []);

  return null;
};

export default ScrollToTop;
