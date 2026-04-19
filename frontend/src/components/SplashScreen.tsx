import { Box, Typography, keyframes } from "@mui/material";
import { tokens } from "@/theme/theme";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0px);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1200px 0;
  }
  100% {
    background-position: 1200px 0;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

interface SplashScreenProps {
  isVisible?: boolean;
  onComplete?: () => void;
}

export const SplashScreen = ({ isVisible = true }: SplashScreenProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
        zIndex: 9999,
        animation: isVisible
          ? `${fadeIn} 0.6s ease-out`
          : `${fadeOut} 0.4s ease-in`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${tokens.accent}20 0%, transparent 70%)`,
          top: "-100px",
          right: "-100px",
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 60% 70%, ${tokens.secondary}15 0%, transparent 70%)`,
          bottom: "-80px",
          left: "-80px",
          animation: `${pulse} 5s ease-in-out infinite 0.5s`,
        }}
      />

      {/* Logo/Brand */}
      <Box sx={{ position: "relative", zIndex: 1, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentDark} 100%)`,
            boxShadow: `0 8px 24px ${tokens.accent}40`,
            mb: 3,
            animation: `${bounce} 2s ease-in-out infinite`,
          }}
        >
          <Typography
            sx={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.05em",
            }}
          >
            G
          </Typography>
        </Box>

        {/* Brand Text */}
        <Typography
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem" },
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            letterSpacing: "-0.02em",
            mb: 1,
            animation: `${fadeIn} 0.8s ease-out 0.2s backwards`,
          }}
        >
          Gadgify
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            color: `${tokens.gray100}dd`,
            textAlign: "center",
            fontWeight: 400,
            letterSpacing: "0.05em",
            animation: `${fadeIn} 0.8s ease-out 0.4s backwards`,
          }}
        >
          YOUR TRUSTED ELECTRONICS STORE
        </Typography>
      </Box>

      {/* Loading Animation */}
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          mt: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: tokens.accent,
              animation: `${bounce} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: `0 0 12px ${tokens.accent}80`,
            }}
          />
        ))}
      </Box>

      {/* Loading Bar */}
      <Box
        sx={{
          width: "200px",
          height: "3px",
          background: `${tokens.gray100}20`,
          borderRadius: "2px",
          mt: 4,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            height: "100%",
            background: `linear-gradient(90deg, transparent 0%, ${tokens.accent} 50%, transparent 100%)`,
            animation: `${shimmer} 2s infinite`,
            backgroundSize: "1200px 100%",
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: `${tokens.gray100}99`,
          mt: 4,
          textAlign: "center",
          fontWeight: 500,
          letterSpacing: "0.08em",
          animation: `${fadeIn} 0.8s ease-out 0.6s backwards`,
        }}
      >
        Loading amazing products...
      </Typography>
    </Box>
  );
};

export default SplashScreen;
