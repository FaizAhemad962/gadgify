import React, { memo } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  CompareArrows,
} from "@mui/icons-material";
import LazyImage from "../components/common/LazyImage";
import { StarRating } from "../components/common/StarRating";
import { useCompare } from "../context/CompareContext";
import { tokens } from "@/theme/theme";
import type { Product, ProductMedia } from "../types";

interface ProductCardProps {
  product: Product;
  isInWishlist: (id: string) => boolean;
  isToggling: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  onAddToCart: (id: string) => void;
  onBuyNow: (id: string) => void;
  onNavigate: (id: string) => void;
  t: (key: string) => string;
  isAddingToCart?: boolean;
  viewMode?: "grid" | "list";
}

const ProductCard: React.FC<ProductCardProps> = memo(
  ({
    product,
    isInWishlist,
    isToggling,
    toggleWishlist,
    onAddToCart,
    onBuyNow,
    onNavigate,
    t,
    isAddingToCart = false,
    viewMode = "grid",
  }) => {
    const isList = viewMode === "list";
    const { isInCompare, addToCompare, removeFromCompare, isFull } =
      useCompare();

    return (
      <Card
        sx={{
          display: "flex",
          flexDirection: isList ? "row" : "column",
          overflow: "hidden",
          height: "100%", // Always take full height of grid cell
          border: `1px solid ${tokens.gray200}`,
          borderRadius: isList ? 3 : 4,
          transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
          position: "relative",
          bgcolor: tokens.white,
          "&:hover": {
            boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
            transform: isList ? "none" : "translateY(-6px)",
            borderColor: tokens.gray300,
          },
        }}
      >
        {/* Product Image Container */}
        <Box
          sx={{
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: tokens.gray50,
            width: "100%",
            height: isList ? 200 : 280, // Fixed height for consistency
            ...(isList && {
              width: 220,
              minWidth: 220,
            }),
          }}
          onClick={() => onNavigate(product.id)}
        >
          <LazyImage
            src={
              (product.media &&
                product.media.find(
                  (m: ProductMedia) => m.type === "image" && m.isPrimary,
                )?.url) ||
              (product.media &&
                product.media.find((m: ProductMedia) => m.type === "image")
                  ?.url) ||
              ""
            }
            alt={product.name}
            height="100%"
            objectFit="cover"
          />

          {/* Wishlist toggle */}
          <IconButton
            aria-label={
              isInWishlist(product.id)
                ? t("products.removeFromWishlist")
                : t("products.addToWishlist")
            }
            onClick={async (e) => {
              e.stopPropagation();
              await toggleWishlist(product.id);
            }}
            disabled={isToggling(product.id)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              p: 1,
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#fff", transform: "scale(1.1)" },
            }}
          >
            {isToggling(product.id) ? (
              <CircularProgress size={18} color="inherit" />
            ) : isInWishlist(product.id) ? (
              <Favorite sx={{ fontSize: 20, color: tokens.error }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 20, color: tokens.gray500 }} />
            )}
          </IconButton>

          {/* Compare toggle */}
          <IconButton
            aria-label={t("products.compare")}
            onClick={(e) => {
              e.stopPropagation();
              if (isInCompare(product.id)) {
                removeFromCompare(product.id);
              } else {
                addToCompare(product.id);
              }
            }}
            disabled={!isInCompare(product.id) && isFull}
            sx={{
              position: "absolute",
              top: 50,
              right: 10,
              bgcolor: isInCompare(product.id)
                ? tokens.accent
                : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              p: 1,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: isInCompare(product.id) ? tokens.accentDark : "#fff",
                transform: "scale(1.1)",
              },
            }}
          >
            <CompareArrows
              sx={{
                fontSize: 20,
                color: isInCompare(product.id) ? "#fff" : tokens.gray500,
              }}
            />
          </IconButton>
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
            ...(isList && { justifyContent: "center" }),
          }}
        >
          {/* Title */}
          <Typography
            onClick={() => onNavigate(product.id)}
            sx={{
              fontWeight: 600,
              fontSize: isList ? "1.1rem" : "0.95rem",
              color: tokens.primary,
              cursor: "pointer",
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              height: "2.6rem", // Strict height for title consistency
              "&:hover": { color: tokens.accent },
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1,
              height: "1.25rem", // Fixed height for rating row
            }}
          >
            <StarRating rating={product.averageRating || 0} size="small" />
            <Typography variant="caption" color="text.secondary">
              ({product.totalRatings || 0})
            </Typography>
          </Box>

          {/* Stock Status */}
          <Box sx={{ mb: 1, height: "1.25rem" }}>
            {product.stock > 0 ? (
              <Typography
                variant="caption"
                sx={{
                  color: product.stock > 10 ? tokens.success : tokens.warning,
                  fontWeight: 600,
                }}
              >
                {product.stock > 10
                  ? t("products.inStock")
                  : `${t("products.only")} ${product.stock} ${t("products.left")}`}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: tokens.error, fontWeight: 700 }}
              >
                {t("products.outOfStock")}
              </Typography>
            )}
          </Box>

          {/* Price */}
          <Box
            sx={{
              mt: "auto",
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: tokens.accent,
                fontWeight: 700,
                fontSize: isList ? "1.5rem" : "1.25rem",
              }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
            {/* Original price removed - not available */}
          </Box>

          {/* Action buttons (only for list view) */}
          {isList && (
            <CardActions sx={{ p: 0, mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                startIcon={
                  isAddingToCart ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ShoppingCart />
                  )
                }
                onClick={() => onAddToCart(product.id)}
                disabled={isAddingToCart}
                sx={{
                  bgcolor: tokens.primary,
                  "&:hover": { bgcolor: tokens.primaryDark },
                  px: 3,
                  borderRadius: 2,
                }}
              >
                {t("common.addToCart")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => onBuyNow(product.id)}
                sx={{
                  color: tokens.primary,
                  borderColor: tokens.primary,
                  "&:hover": {
                    borderColor: tokens.primaryDark,
                    bgcolor: "rgba(27,42,74,0.04)",
                  },
                  px: 3,
                  borderRadius: 2,
                }}
              >
                {t("common.buyNow")}
              </Button>
            </CardActions>
          )}
        </CardContent>

        {/* Grid view actions (hover overlay or bottom bar) */}
        {!isList && (
          <CardActions
            sx={{
              p: 1.5,
              pt: 0,
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={
                isAddingToCart ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ShoppingCart sx={{ fontSize: 16 }} />
                )
              }
              onClick={() => onAddToCart(product.id)}
              disabled={isAddingToCart}
              sx={{
                bgcolor: tokens.primary,
                "&:hover": { bgcolor: tokens.primaryDark },
                borderRadius: 2,
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {t("common.add")}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => onBuyNow(product.id)}
              sx={{
                color: tokens.primary,
                borderColor: tokens.primary,
                "&:hover": {
                  borderColor: tokens.primaryDark,
                  bgcolor: "rgba(27,42,74,0.04)",
                },
                borderRadius: 2,
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {t("common.buy")}
            </Button>
          </CardActions>
        )}
      </Card>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
