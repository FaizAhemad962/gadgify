import { useState } from "react";
import { Box, Skeleton } from "@mui/material";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fallbackSrc?: string;
}

const LazyImage = ({
  src,
  alt,
  width = "100%",
  height = "100%",
  style,
  className,
  objectFit = "cover",
  fallbackSrc = "https://via.placeholder.com/400x300?text=No+Image",
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const displaySrc = error || !src ? fallbackSrc : src;

  return (
    <Box sx={{ position: "relative", width, height, overflow: "hidden" }}>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ position: "absolute", top: 0, left: 0 }}
        />
      )}
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          ...style,
        }}
        className={className}
      />
    </Box>
  );
};

export default LazyImage;
