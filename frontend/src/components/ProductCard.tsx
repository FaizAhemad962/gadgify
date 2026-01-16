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
import { ShoppingCart, Favorite, FavoriteBorder } from "@mui/icons-material";
import LazyImage from "../components/common/LazyImage";
import { StarRating } from "../components/common/StarRating";

interface ProductMedia {
  url: string;
  type: string;
  isPrimary?: boolean;
}

interface ProductCardProps {
  product: any;
  isInWishlist: (id: string) => boolean;
  isToggling: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  onAddToCart: (id: string) => void;
  onBuyNow: (id: string) => void;
  onNavigate: (id: string) => void;
  t: (key: string) => string;
  isAddingToCart?: boolean;
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
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
        border: "1px solid #eee",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Product Image */}
      <Box
        sx={{
          cursor: "pointer",
          m: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        onClick={() => onNavigate(product.id)}
      >
        <LazyImage
          src={
            (product.media &&
              product.media.find(
                (m: ProductMedia) => m.type === "image" && m.isPrimary
              )?.url) ||
            (product.media &&
              product.media.find((m: ProductMedia) => m.type === "image")
                ?.url) ||
            ""
          }
          alt={product.name}
          height={320}
          objectFit="cover"
        />
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          onClick={() => onNavigate(product.id)}
          sx={{
            cursor: "pointer",
            transition: "opacity 0.2s",
            "&:hover": { opacity: 0.7 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.4,
            }}
          >
            {product.name}
          </Typography>
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
            color={isInWishlist(product.id) ? "error" : "default"}
            size="large"
          >
            {isToggling(product.id) ? (
              <CircularProgress size={24} color="inherit" />
            ) : isInWishlist(product.id) ? (
              <Favorite />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.6,
            fontSize: "0.9rem",
          }}
        >
          {product.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <StarRating
            rating={product.averageRating || 0}
            totalRatings={product.totalRatings}
            size="small"
          />
          {product.stock > 0 ? (
            <Chip
              label={t("products.stock")}
              sx={{
                bgcolor: "#4caf50",
                color: "white",
                fontWeight: 600,
                height: 28,
                width: 100,
              }}
              size="small"
            />
          ) : (
            <Chip
              label={t("products.outOfStock")}
              sx={{
                bgcolor: "#f44336",
                color: "white",
                fontWeight: 600,
                height: 28,
                width: 100,
              }}
              size="small"
            />
          )}
        </Box>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Typography
              variant="body1"
              sx={{ fontSize: "2.5rem", fontWeight: 100 }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
            {product.originalPrice && product.originalPrice > product.price ? (
              <Typography variant="caption">
                M.R.P:{" "}
                <Typography
                  variant="caption"
                  sx={{ textDecoration: "line-through", flex: 1 }}
                >
                  ₹{product.originalPrice.toLocaleString()}
                </Typography>{" "}
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#f44336' }}>
                  ( {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% ) OFF
                </Typography>
              </Typography>
            ) : null}
          </Box>
        </Box>
      </CardContent>
      {/* Action Buttons */}
      <CardActions sx={{ display: "flex", flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0 || isAddingToCart}
          startIcon={<ShoppingCart />}
          sx={{
            fontWeight: 600,
            py: 1,
            flex: 1,
          }}
        >
          {isAddingToCart ? "Adding..." : t("products.addToCart")}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => onBuyNow(product.id)}
          disabled={product.stock === 0}
          sx={{
            fontWeight: 600,
            py: 1,
            flex: 1,
            bgcolor: "#ff9800",
            "&:hover": {
              bgcolor: "#f57c00",
            },
          }}
        >
          {t("products.buyNow")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
