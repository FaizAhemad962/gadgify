import React, { memo, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
} from "@/mui/material";
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  CompareArrows,
  MoreVert,
  Share,
  ContentCopy,
} from "@/mui/icons";
import LazyImage from "../components/common/LazyImage";
import { StarRating } from "../components/common/StarRating";
import { useCompare } from "../context/CompareContext";
import { tokens } from "@/theme/theme";
import { productCardLayout } from "@/components/products/productLayout";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";
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
    const [shareAnchor, setShareAnchor] = useState<HTMLElement | null>(null);
    const [shareSnackbar, setShareSnackbar] = useState(false);
    const { isInCompare, addToCompare, removeFromCompare, isFull } =
      useCompare();
    const label = (key: string, fallback: string) => {
      const translated = t(key);
      return !translated || translated === key ? fallback : translated;
    };

    const productUrl = `${window.location.origin}/products/${product.id}`;
    const copyProductLink = async () => {
      try {
        await navigator.clipboard.writeText(productUrl);
      } catch {
        const input = document.createElement("textarea");
        input.value = productUrl;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(input);
        if (!copied) return;
      }
      setShareAnchor(null);
      setShareSnackbar(true);
    };

    const shareWithApps = async () => {
      setShareAnchor(null);
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: product.name,
            text: `${product.name} on Gadgify`,
            url: productUrl,
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      await copyProductLink();
    };

    const shareToFacebook = () => {
      setShareAnchor(null);
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
    };

    // The API filters pending offers; keep the card defensive if stale cached
    // data or another caller passes one through.
    if (product.offerStatus === "PENDING") return null;

    return (
      <Card
        sx={{
          display: "flex",
          flexDirection: isList ? "row" : "column",
          overflow: "hidden",
          height: "100%",
          border: `1px solid ${tokens.gray200}`,
          borderRadius: isList
            ? productCardLayout.listRadius
            : productCardLayout.radius,
          transition: "border-color 0.16s ease, background-color 0.16s ease",
          position: "relative",
          bgcolor: tokens.white,
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
          "&:hover": {
            borderColor: tokens.gray300,
            bgcolor: "#fff",
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
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            width: "100%",
            height: isList
              ? productCardLayout.listImageHeight
              : productCardLayout.imageHeight,
            ...(isList && {
              width: productCardLayout.listImageWidth,
              minWidth: productCardLayout.listImageWidth,
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
              boxShadow: "0 1px 6px rgba(15, 23, 42, 0.08)",
              p: 1,
              transition: "background-color 0.2s ease, color 0.2s ease",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            {isToggling(product.id) ? (
              <CircularProgress size={18} color="inherit" />
            ) : isInWishlist(product.id) ? (
              <Favorite sx={{ ...appIconSx.lg, color: tokens.error }} />
            ) : (
              <FavoriteBorder sx={{ ...appIconSx.lg, color: tokens.gray500 }} />
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
                ? tokens.primary
                : "rgba(255,255,255,0.9)",
              boxShadow: "0 1px 6px rgba(15, 23, 42, 0.08)",
              p: 1,
              transition: "background-color 0.2s ease, color 0.2s ease",
              "&:hover": {
                bgcolor: isInCompare(product.id) ? tokens.primaryDark : "#fff",
              },
            }}
          >
            <CompareArrows
              sx={{
                ...appIconSx.lg,
                color: isInCompare(product.id) ? "#fff" : tokens.gray500,
              }}
            />
          </IconButton>

          {/* Product sharing menu */}
          <IconButton
            aria-label={label("common.shareProduct", "Share product")}
            aria-haspopup="menu"
            onClick={(event) => {
              event.stopPropagation();
              setShareAnchor(event.currentTarget);
            }}
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              bgcolor: "rgba(255,255,255,0.94)",
              boxShadow: "0 1px 6px rgba(15, 23, 42, 0.08)",
              p: 1,
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <MoreVert sx={{ ...appIconSx.lg, color: tokens.gray600 }} />
          </IconButton>
          <Menu
            anchorEl={shareAnchor}
            open={Boolean(shareAnchor)}
            onClose={() => setShareAnchor(null)}
            onClick={(event) => event.stopPropagation()}
          >
            <MenuItem onClick={shareToFacebook} sx={{ minHeight: 48, fontSize: "0.95rem" }}>
              {label("common.shareFacebook", "Share on Facebook")}
            </MenuItem>
            <MenuItem onClick={copyProductLink} sx={{ minHeight: 48, fontSize: "0.95rem" }}>
              {label("common.copyForInstagram", "Copy link for Instagram")}
            </MenuItem>
            <MenuItem onClick={copyProductLink} sx={{ minHeight: 48, fontSize: "0.95rem" }}>
              {label("common.copyForYoutube", "Copy link for YouTube")}
            </MenuItem>
            <MenuItem onClick={shareWithApps} sx={{ minHeight: 48, fontSize: "0.95rem" }}>
              <Share sx={{ mr: 1.25, fontSize: 20 }} />
              {label("common.moreShareOptions", "More sharing options")}
            </MenuItem>
            <MenuItem onClick={copyProductLink} sx={{ minHeight: 48, fontSize: "0.95rem" }}>
              <ContentCopy sx={{ mr: 1.25, fontSize: 20 }} />
              {label("common.copyLink", "Copy link")}
            </MenuItem>
          </Menu>
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.9,
            p: isList ? 2.5 : 2,
            ...(isList && { justifyContent: "center" }),
          }}
        >
          {/* Title */}
          <Typography
            onClick={() => onNavigate(product.id)}
            sx={{
              fontWeight: 600,
              fontSize: isList ? "1.0625rem" : { xs: "1rem", sm: "1.0625rem" },
              color: tokens.primary,
              cursor: "pointer",
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              minHeight: isList ? "auto" : productCardLayout.titleMinHeight,
              "&:hover": { color: tokens.primaryDark },
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
              minHeight: "1.5rem",
            }}
          >
            <StarRating rating={product.averageRating || 0} size="small" />
            <Typography variant="caption" color="text.secondary">
              ({product.totalRatings || 0})
            </Typography>
          </Box>

          {/* Stock Status */}
          <Box sx={{ mb: 1, minHeight: "1.5rem" }}>
            {product.stock > 0 ? (
              <Typography
                variant="caption"
                sx={{
                  color: product.stock > 10 ? tokens.success : tokens.warning,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {product.stock > 10
                  ? label("products.inStock", "In stock")
                  : label("products.onlyXLeft", `Only ${product.stock} left`)
                      .replace("{{count}}", String(product.stock))
                      .replace("{{stock}}", String(product.stock))}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: tokens.error, fontWeight: 700, fontSize: "0.875rem" }}
              >
                {label("products.outOfStock", "Out of stock")}
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
                fontSize: isList ? "1.5rem" : { xs: "1.375rem", sm: "1.5rem" },
              }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
            {/* Original price removed - not available */}
          </Box>

          {/* Action buttons (only for list view) */}
          {isList && (
            <CardActions sx={{ p: 0, mt: 2, gap: 2 }}>
              <CustomButton
                variant="contained"
                appVariant="commerce"
                startIcon={
                  isAddingToCart ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ShoppingCart sx={appIconSx.lg} />
                  )
                }
                onClick={() => onAddToCart(product.id)}
                disabled={isAddingToCart}
                sx={{
                  px: 3,
                  borderRadius: productCardLayout.actionRadius,
                }}
              >
                {label("common.addToCart", "Add to Cart")}
              </CustomButton>
              <CustomButton
                variant="outlined"
                appVariant="secondary"
                onClick={() => onBuyNow(product.id)}
                sx={{
                  px: 3,
                  borderRadius: productCardLayout.actionRadius,
                }}
              >
                {label("common.buyNow", "Buy Now")}
              </CustomButton>
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
            <CustomButton
              fullWidth
              variant="contained"
              appVariant="commerce"
              size="small"
              startIcon={
                isAddingToCart ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ShoppingCart sx={appIconSx.sm} />
                )
              }
              onClick={() => onAddToCart(product.id)}
              disabled={isAddingToCart}
              sx={{
                borderRadius: productCardLayout.actionRadius,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {label("common.add", "Add")}
            </CustomButton>
            <CustomButton
              fullWidth
              variant="outlined"
              appVariant="secondary"
              size="small"
              onClick={() => onBuyNow(product.id)}
              sx={{
                borderRadius: productCardLayout.actionRadius,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {label("common.buy", "Buy")}
            </CustomButton>
          </CardActions>
        )}
        <Snackbar
          open={shareSnackbar}
          autoHideDuration={2200}
          onClose={() => setShareSnackbar(false)}
          message={label("common.linkCopied", "Link copied!")}
        />
      </Card>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
