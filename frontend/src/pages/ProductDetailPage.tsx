import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
      >
        {t("common.backToProducts")}
      </Button>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <ProductGallery product={product} />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="700"
              sx={{ color: "text.primary", mb: 2 }}
            >
              {product.name}
            </Typography>
            {ratingsData && ratingsData.totalRatings > 0 && (
              <Box sx={{ mb: 2 }}>
                <StarRating
                  rating={ratingsData.averageRating}
                  totalRatings={ratingsData.totalRatings}
                  size="medium"
                />
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" color="primary" fontWeight="700">
              ₹{product.price.toLocaleString()}
            </Typography>
            {product.stock > 0 ? (
              <Chip
                label={`${t("products.stock")}: ${product.stock}`}
                sx={{
                  bgcolor: tokens.success,
                  color: tokens.white,
                  fontWeight: 600,
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
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<NotificationsActive />}
                    onClick={() => handleNotifyMe(product.id)}
                    sx={{ textTransform: "none" }}
                  >
                    {t("products.notifyMe")}
                  </Button>
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
            sx={{ color: "text.secondary", lineHeight: 2, fontSize: "1rem" }}
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
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => handleAddToCart()}
              disabled={product.stock === 0 || isAddingToCart(product.id)}
              sx={{ flex: 1, fontWeight: 600, minHeight: 48 }}
            >
              {isAddingToCart(product.id)
                ? "Adding..."
                : t("products.addToCart")}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleBuyNow()}
              disabled={product.stock === 0}
              sx={{
                flex: 1,
                fontWeight: 600,
                minHeight: 48,
                bgcolor: tokens.accent,
                "&:hover": { bgcolor: tokens.accentDark },
              }}
            >
              {t("products.buyNow")}
            </Button>
            <Tooltip title={t("common.shareProduct")}>
              <IconButton
                onClick={handleShare}
                sx={{ border: `1px solid ${tokens.gray200}`, borderRadius: 2 }}
              >
                <Share />
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
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${tokens.gray200}`,
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
                ✓ {t("common.fastDelivery")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.9rem" }}
              >
                {t("products.freeDeliveryAbove")}
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${tokens.gray200}`,
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
                ✓ {t("products.securePayment")}
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
  );
};

export default ProductDetailPage;
