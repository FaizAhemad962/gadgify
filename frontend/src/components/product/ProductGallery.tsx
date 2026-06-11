import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@/mui/material";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";
import type { Product } from "@/types";

type GalleryItem = {
  type: "image" | "video";
  url: string;
  alt: string;
};

type ProductGalleryProps = {
  product: Product;
};

const getGalleryItems = (product: Product): GalleryItem[] => {
  const images = product.media.filter((media) => media.type === "image");
  const videos = product.media.filter((media) => media.type === "video");
  const primary = images.find((media) => media.isPrimary);
  const otherImages = images.filter((media) => !media.isPrimary);

  return [
    ...(primary
      ? [{ type: "image" as const, url: primary.url, alt: product.name }]
      : []),
    ...otherImages.map((image) => ({
      type: "image" as const,
      url: image.url,
      alt: product.name,
    })),
    ...videos.map((video) => ({
      type: "video" as const,
      url: video.url,
      alt: "Product video",
    })),
  ];
};

const ProductGallery = ({ product }: ProductGalleryProps) => {
  const items = getGalleryItems(product);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomFrameRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<{ x: number; y: number } | null>(null);
  const activeItem = items[activeMediaIndex] || items[0];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = imgContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    pendingZoomRef.current = { x, y };

    if (zoomFrameRef.current != null) return;

    zoomFrameRef.current = window.requestAnimationFrame(() => {
      zoomFrameRef.current = null;
      const image = imgRef.current;
      const next = pendingZoomRef.current;
      if (!image || !next) return;

      image.style.transformOrigin = `${next.x}% ${next.y}%`;
      image.style.transform = "scale(1.85)";
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => {
    if (zoomFrameRef.current != null) {
      window.cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    }
    pendingZoomRef.current = null;
    if (imgRef.current) {
      imgRef.current.style.transformOrigin = "center center";
      imgRef.current.style.transform = "scale(1)";
    }
    setIsZooming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (zoomFrameRef.current != null) {
        window.cancelAnimationFrame(zoomFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    pendingZoomRef.current = null;
    if (imgRef.current) {
      imgRef.current.style.transformOrigin = "center center";
      imgRef.current.style.transform = "scale(1)";
    }
  }, [activeMediaIndex]);

  return (
    <Box
      sx={{
        maxWidth: 520,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        ref={imgContainerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: "100%",
          height: { xs: 300, sm: 400 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,245,244,0.9))",
          borderRadius: `${tokens.radiusXl}px`,
          border: `1px solid rgba(231, 229, 228, 0.86)`,
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
          overflow: "hidden",
          cursor: isZooming ? "crosshair" : "default",
          position: "relative",
        }}
      >
        {activeItem?.type === "video" ? (
          <video
            src={activeItem.url}
            controls
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <img
            ref={imgRef}
            src={activeItem?.url}
            alt={activeItem?.alt || "Product image"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transform: "scale(1)",
              transition: isZooming ? "none" : "transform 0.2s ease",
              willChange: isZooming ? "transform" : "auto",
            }}
            draggable={false}
          />
        )}
      </Box>

      {items.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            py: 0.5,
            px: 0.5,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: tokens.gray300,
              borderRadius: 2,
            },
          }}
        >
          {items.map((item, index) => (
            <Box
              key={`${item.type}-${item.url}`}
              onClick={() => setActiveMediaIndex(index)}
              sx={{
                width: 64,
                height: 64,
                minWidth: 64,
                borderRadius: 2,
                border:
                  index === activeMediaIndex
                    ? `2px solid ${tokens.accent}`
                    : `1px solid rgba(231, 229, 228, 0.88)`,
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255, 255, 255, 0.76)",
                boxShadow:
                  index === activeMediaIndex
                    ? "0 8px 18px rgba(255, 107, 44, 0.16)"
                    : "0 4px 12px rgba(15, 23, 42, 0.045)",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: tokens.accent,
                  transform: "translateY(-1px)",
                },
              }}
            >
              {item.type === "video" ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: tokens.gray100,
                    fontSize: appIconSx.xl.fontSize,
                  }}
                >
                  ▶
                </Box>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  draggable={false}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductGallery;
