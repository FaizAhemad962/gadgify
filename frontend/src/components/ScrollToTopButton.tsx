import { useState, useEffect } from "react";
import { Fab } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import { tokens } from "@/theme/theme";

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  const handleScroll = () => {
    setShowButton(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
