import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from "@/mui/material";

import {
  ShoppingCart,
  ArrowBack,
  Share,
  NotificationsActive,
  LocalShipping,
  Security,
} from "@/mui/icons";
import { productsApi } from "../api/products";
import { ratingsApi } from "../api/ratings";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { StarRating } from "../components/common/StarRating";
import QuantityInput from "../components/common/QuantityInput";
import ProductGallery from "../components/product/ProductGallery";
import { RatingForm } from "../components/product/RatingForm";
import { RatingsList } from "../components/product/RatingsList";
import ProductGrid from "../components/products/ProductGrid";
import SectionHeader from "../components/sections/SectionHeader";
import RecentlyViewed from "../components/products/RecentlyViewed";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { tokens } from "@/theme/theme";
import { CustomButton } from "@/components/ui/CustomButton";
import { appIconSx } from "@/components/ui/navigationStyles";

const glassPanelSx = {
  borderRadius: `${tokens.radiusXl}px`,
  border: `1px solid rgba(231, 229, 228, 0.82)`,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,250,249,0.92))",
  boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
} as const;

const softCardSx = {
  borderRadius: `${tokens.radiusLg}px`,
  border: `1px solid rgba(231, 229, 228, 0.9)`,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(245,245,244,0.86))",
  boxShadow: "0 8px 22px rgba(15, 23, 42, 0.045)",
} as const;

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { addProduct: trackRecentlyViewed } = useRecentlyViewed();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [shareSnackbar, setShareSnackbar] = useState(false);
  const [stockNotifySnackbar, setStockNotifySnackbar] = useState(false);

  const isNotifySubscribed = (productId: string) => {
    try {
      const subscribed: string[] = JSON.parse(
        localStorage.getItem("gadgify_stock_notify") || "[]",
      );
      return subscribed.includes(productId);
    } catch {
      return false;
    }
  };

  const handleNotifyMe = (productId: string) => {
    try {
      const subscribed: string[] = JSON.parse(
        localStorage.getItem("gadgify_stock_notify") || "[]",
      );
      if (!subscribed.includes(productId)) {
        subscribed.push(productId);
        localStorage.setItem(
          "gadgify_stock_notify",
          JSON.stringify(subscribed),
        );
      }
      setStockNotifySnackbar(true);
    } catch {
      // silently fail
    }
  };

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  // Track this product as recently viewed
  useEffect(() => {
    if (product?.id) {
      trackRecentlyViewed(product.id);
    }
  }, [product?.id, trackRecentlyViewed]);

  const { data: ratingsData } = useQuery({
    queryKey: ["ratings", id],
    queryFn: () => ratingsApi.getRatings(id!),
    enabled: !!id,
  });

  // Fetch related products (same category)
  const { data: relatedData } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: () =>
      productsApi.getAll({ category: product!.category, limit: 4 }),
    enabled: !!product?.category,
  });
  const relatedProducts = (relatedData?.products || [])
    .filter((p: { id: string; name?: string }) => p.id !== id)
    .slice(0, 4);

  const handleAddToCart = async (productId?: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const targetId = productId || product?.id;
    if (targetId) {
      await addToCart({ productId: targetId, quantity: productId ? 1 : quantity });
    }
  };

  const handleBuyNow = async (productId?: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const targetId = productId || product?.id;
    if (targetId) {
      await addToCart({ productId: targetId, quantity: productId ? 1 : quantity });
      navigate("/checkout");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareSnackbar(true);
    } catch {
      // Fallback for older browsers
      setShareSnackbar(true);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t("errors.somethingWrong")}</Alert>
      </Container>
    );
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top left, rgba(255,107,44,0.11), transparent 34%), radial-gradient(circle at top right, rgba(27,42,74,0.1), transparent 32%), linear-gradient(180deg, #fff 0%, #fafafa 52%, #f5f5f4 100%)",
      }}
    >
    <Container maxWidth="xl">
      <CustomButton
        appVariant="ghost"
        startIcon={<ArrowBack sx={appIconSx.lg} />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
      >
        {t("common.backToProducts")}
      </CustomButton>
      <Box
        sx={{
          ...glassPanelSx,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 0.92fr) 1fr" },
          gap: 4,
          p: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(135deg, rgba(255,107,44,0.08), transparent 34%, rgba(14,165,233,0.06))",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <ProductGallery product={product} />
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box>
            <Chip
              label={product.category}
              size="small"
              sx={{
                mb: 1.5,
                bgcolor: "rgba(27, 42, 74, 0.08)",
                color: tokens.primary,
                fontWeight: 800,
              }}
            />
            <Typography
              variant="h3"
              gutterBottom
              fontWeight="900"
              sx={{
                color: tokens.gray900,
                mb: 2,
                letterSpacing: "-0.035em",
                fontSize: { xs: "1.8rem", md: "2.35rem" },
              }}
            >
              {product.name}
            </Typography>
            {ratingsData && ratingsData.totalRatings > 0 && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "999px",
                  bgcolor: "rgba(255, 255, 255, 0.72)",
                  border: `1px solid ${tokens.gray200}`,
                }}
              >
                <StarRating
                  rating={ratingsData.averageRating}
                  totalRatings={ratingsData.totalRatings}
                  size="medium"
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
          >
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{ color: tokens.accent, letterSpacing: "-0.03em" }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
            {product.stock > 0 ? (
              <Chip
                label={`${t("products.stock")}: ${product.stock}`}
                sx={{
                  bgcolor: `${tokens.success}18`,
                  color: tokens.success,
                  border: `1px solid ${tokens.success}35`,
                  fontWeight: 800,
                }}
              />
            ) : (
              <>
                <Chip
                  label={t("products.outOfStock")}
                  sx={{
                    bgcolor: tokens.error,
                    color: tokens.white,
                    fontWeight: 600,
                  }}
                />
                {!isNotifySubscribed(product.id) && (
                  <CustomButton
                    appVariant="secondary"
                    size="small"
                    startIcon={<NotificationsActive sx={appIconSx.md} />}
                    onClick={() => handleNotifyMe(product.id)}
                  >
                    {t("products.notifyMe")}
                  </CustomButton>
                )}
                {isNotifySubscribed(product.id) && (
                  <Chip
                    label={t("products.notifyMeSubscribed")}
                    color="info"
                    size="small"
                    icon={<NotificationsActive />}
                  />
                )}
              </>
            )}
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: tokens.gray600,
              lineHeight: 1.85,
              fontSize: "1rem",
              maxWidth: 760,
            }}
          >
            {product.description}
          </Typography>

          {/* Quantity Selector */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
            >
              {t("common.quantity")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <QuantityInput
                value={quantity}
                min={1}
                max={product.stock}
                onChange={setQuantity}
              />
              {product.stock <= 5 && product.stock > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: tokens.error, fontWeight: 600, ml: 1 }}
                >
                  {t("common.onlyXLeft", { count: product.stock })}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "stretch",
            }}
          >
            <CustomButton
              appVariant="secondary"
              size="large"
              startIcon={<ShoppingCart sx={appIconSx.lg} />}
              onClick={() => handleAddToCart()}
              disabled={product.stock === 0 || isAddingToCart(product.id)}
              sx={{ flex: 1, fontWeight: 600, minHeight: 48 }}
            >
              {isAddingToCart(product.id)
                ? "Adding..."
                : t("products.addToCart")}
            </CustomButton>
            <CustomButton
              appVariant="primary"
              size="large"
              onClick={() => handleBuyNow()}
              disabled={product.stock === 0}
              sx={{
                flex: 1,
                fontWeight: 600,
                minHeight: 48,
              }}
            >
              {t("products.buyNow")}
            </CustomButton>
            <Tooltip title={t("common.shareProduct")}>
              <IconButton
                onClick={handleShare}
                sx={{
                  width: 50,
                  height: 50,
                  border: `1px solid ${tokens.gray200}`,
                  borderRadius: "16px",
                  bgcolor: "rgba(255,255,255,0.72)",
                  boxShadow: tokens.shadowSm,
                  "&:hover": {
                    bgcolor: tokens.white,
                    color: tokens.accent,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Share sx={appIconSx.lg} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Product Info Sections */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                ...softCardSx,
                p: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocalShipping sx={{ ...appIconSx.lg, color: tokens.accent }} />
                {t("common.fastDelivery")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.9rem" }}
              >
                {t("products.freeDeliveryAbove")}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                ...softCardSx,
                p: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Security sx={{ ...appIconSx.lg, color: tokens.primary }} />
                {t("products.securePayment")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.9rem" }}
              >
                {t("products.safeCheckout")}
              </Typography>
            </Paper>
          </Box>

          {/* Color Selector */}
          {product.colors && product.colors.trim() && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "text.primary", mb: 1.5 }}
              >
                {t("products.availableColors")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {product.colors.split(",").map((color: string) => (
                  <Chip
                    key={color.trim()}
                    label={color.trim()}
                    onClick={() => setSelectedColor(color.trim())}
                    color={
                      selectedColor === color.trim() ? "primary" : "default"
                    }
                    variant={
                      selectedColor === color.trim() ? "filled" : "outlined"
                    }
                    sx={{ cursor: "pointer", fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Ratings Section */}
      <Box sx={{ mt: 8 }}>
        <Divider sx={{ mb: 6, borderColor: tokens.gray200 }} />
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="700"
          sx={{ color: "text.primary", mb: 4 }}
        >
          Customer Reviews
        </Typography>

        {isAuthenticated && (
          <Box sx={{ mb: 6 }}>
            <RatingForm productId={id!} />
          </Box>
        )}

        <RatingsList productId={id!} />
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Divider sx={{ mb: 6, borderColor: tokens.gray200 }} />
          <SectionHeader title={t("common.relatedProducts")} sx={{ mb: 4 }} />
          <ProductGrid
            products={relatedProducts}
            columns={{ xs: "1fr", md: "repeat(4, 1fr)" }}
            isInWishlist={isInWishlist}
            isToggling={isToggling}
            toggleWishlist={toggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onNavigate={(pid) => navigate(`/products/${pid}`)}
            t={t}
            sx={{ gap: 3 }}
          />
        </Box>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed excludeProductId={id} />

      <Snackbar
        open={shareSnackbar}
        autoHideDuration={2000}
        onClose={() => setShareSnackbar(false)}
        message={t("common.linkCopied")}
      />
      <Snackbar
        open={stockNotifySnackbar}
        autoHideDuration={3000}
        onClose={() => setStockNotifySnackbar(false)}
      >
        <Alert
          onClose={() => setStockNotifySnackbar(false)}
          severity="success"
          variant="filled"
        >
          {t("products.notifyMeSuccess")}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
};

export default ProductDetailPage;
