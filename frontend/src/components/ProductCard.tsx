import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
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

interface ProductMedia {
  url: string;
  type: string;
  isPrimary?: boolean;
}

import type { Product } from "../types";

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

const ProductCard: React.FC<ProductCardProps> = ({
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
  const { isInCompare, addToCompare, removeFromCompare, isFull } = useCompare();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: isList ? "row" : "column",
        overflow: "hidden",
        height: isList ? "auto" : "100%",
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
          ...(isList && {
            width: 220,
            minWidth: 220,
            height: 200,
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
          height={isList ? 200 : 320}
          objectFit="cover"
        />

        {/* Discount badge removed - not available */}

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
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: tokens.gray900,
            lineHeight: 1.4,
            cursor: "pointer",
            transition: "color 0.15s",
            "&:hover": { color: tokens.accent },
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StarRating
            rating={product.averageRating || 0}
            totalRatings={product.totalRatings}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {product.totalRatings && product.totalRatings > 0
              ? `(${product.totalRatings})`
              : "No reviews"}
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
          <Typography
            sx={{ fontSize: "1.25rem", fontWeight: 800, color: tokens.gray900 }}
          >
            ₹{product.price.toLocaleString()}
          </Typography>
          {/* Discount price display removed - not available in Product type */}
        </Box>

        {/* Stock chip */}
        <Box sx={{ mt: "auto", pt: 0.5 }}>
          {product.stock > 0 ? (
            <Chip
              label={
                product.stock > 10 ? "In Stock" : `Only ${product.stock} left`
              }
              size="small"
              sx={{
                bgcolor:
                  product.stock > 10
                    ? tokens.successLight
                    : tokens.warningLight,
                color: product.stock > 10 ? tokens.success : tokens.warning,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          ) : (
            <Chip
              label="Out of Stock"
              size="small"
              sx={{
                bgcolor: tokens.errorLight,
                color: tokens.error,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          display: "flex",
          flexDirection: isList ? "row" : "column",
          gap: 1,
          px: 2,
          pb: 2,
          pt: isList ? 2 : 0,
          "& > :not(style) + :not(style)": { ml: 0 },
          ...(isList && {
            minWidth: 200,
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }),
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={() => onBuyNow(product.id)}
          disabled={product.stock === 0}
          sx={{
            fontWeight: 700,
            fontSize: "0.8125rem",
            bgcolor: tokens.accent,
            color: "#fff",
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: tokens.accentDark,
              transform: "translateY(-1px)",
              boxShadow: `0 4px 14px ${tokens.accent}44`,
            },
          }}
        >
          {t("products.buyNow")}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0 || isAddingToCart}
          startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
          sx={{
            fontWeight: 600,
            fontSize: "0.8125rem",
            borderColor: tokens.accent,
            color: tokens.accent,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: `${tokens.accent}0A`,
              borderColor: tokens.accent,
            },
          }}
        >
          {isAddingToCart ? "Adding..." : t("products.addToCart")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
