import { useState, useEffect, useRef } from "react";
import { Fab } from "@/mui/material";
import { KeyboardArrowUp } from "@/mui/icons";
import { tokens } from "@/theme/theme";

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);
  const showButtonRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const handleScroll = () => {
    if (rafRef.current != null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const next = window.scrollY > 300;
      if (showButtonRef.current !== next) {
        showButtonRef.current = next;
        setShowButton(next);
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {showButton && (
        <Fab
          onClick={scrollToTop}
          color="primary"
          aria-label="Scroll to top"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: tokens.primary,
            color: "white",
            "&:hover": {
              bgcolor: tokens.primaryDark,
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </>
  );
};

export default ScrollToTopButton;
