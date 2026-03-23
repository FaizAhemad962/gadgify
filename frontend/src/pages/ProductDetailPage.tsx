import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import {
  ShoppingCart,
  ArrowBack,
  Share,
  Add,
  Remove,
} from "@mui/icons-material";
import { productsApi } from "../api/products";
import { ratingsApi } from "../api/ratings";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { StarRating } from "../components/common/StarRating";
import { RatingForm } from "../components/product/RatingForm";
import { RatingsList } from "../components/product/RatingsList";
import ProductCard from "../components/ProductCard";
import { tokens } from "@/theme/theme";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [shareSnackbar, setShareSnackbar] = useState(false);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

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
    .filter((p: any) => p.id !== id)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product) {
      await addToCart({ productId: product.id, quantity });
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await handleAddToCart();
    navigate("/cart");
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
  const images = product.media.filter((m: any) => m.type === "image");
  const videos = product.media.filter((m: any) => m.type === "video");
  const primary = images.find((m: any) => m.isPrimary);
  const otherImages = images.filter((m: any) => !m.isPrimary);
  const items = [
    ...(primary
      ? [
          {
            type: "image" as const,
            url: primary.url,
            alt: product.name,
          },
        ]
      : []),
    ...otherImages.map((img: any) => ({
      type: "image" as const,
      url: img.url,
      alt: product.name,
    })),
    ...videos.map((vid: any) => ({
      type: "video" as const,
      url: vid.url,
      alt: "Product Video",
    })),
  ];
  console.log(items);
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
        <Box
          sx={{
            maxWidth: 630,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 420, // 🔥 FIXED HEIGHT
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#fafafa",
              borderRadius: 4,
            }}
          >
            <img
              src={primary?.url}
              alt={"Product image"}
              style={{
                borderRadius: 8,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
        </Box>

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
                sx={{ bgcolor: "#4caf50", color: "#fff", fontWeight: 600 }}
              />
            ) : (
              <Chip
                label={t("products.outOfStock")}
                sx={{ bgcolor: "#f44336", color: "#fff", fontWeight: 600 }}
              />
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
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                sx={{ border: `1px solid ${tokens.gray200}` }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography
                sx={{ minWidth: 40, textAlign: "center", fontWeight: 700 }}
              >
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock}
                sx={{ border: `1px solid ${tokens.gray200}` }}
              >
                <Add fontSize="small" />
              </IconButton>
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
              onClick={handleAddToCart}
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
              onClick={handleBuyNow}
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
            <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #eee" }}>
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
            <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #eee" }}>
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

          {/* Color Selection */}
          {product.colors && (
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                fontWeight="600"
                sx={{ color: "text.primary", mb: 2 }}
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
      <Box sx={{ maxWidth: 630, my: 4, position: "relative" }}>
        <Swiper
          slidesPerView={2}
          navigation
          pagination
          modules={[Pagination, Navigation]}
        >
          {items.map((item) => (
            <SwiperSlide key={item.url}>
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.alt || "Product image"}
                  style={{
                    borderRadius: 8,
                    objectFit: "contain",
                    maxHeight: "130px",
                    maxWidth: "160px",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  style={{
                    objectFit: "contain",
                    maxHeight: "130px",
                    maxWidth: "160px",
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                  }}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Ratings Section */}
      <Box sx={{ mt: 8 }}>
        <Divider sx={{ mb: 6, borderColor: "#ddd" }} />
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
          <Divider sx={{ mb: 6, borderColor: "#ddd" }} />
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="700"
            sx={{ color: "text.primary", mb: 4 }}
          >
            {t("common.relatedProducts")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {relatedProducts.map((rp: any) => (
              <ProductCard
                key={rp.id}
                product={rp}
                isInWishlist={isInWishlist}
                isToggling={isToggling}
                toggleWishlist={toggleWishlist}
                onAddToCart={(pid) =>
                  addToCart({ productId: pid, quantity: 1 })
                }
                onBuyNow={(pid) => {
                  addToCart({ productId: pid, quantity: 1 });
                  navigate("/cart");
                }}
                onNavigate={(pid) => navigate(`/products/${pid}`)}
                t={t}
              />
            ))}
          </Box>
        </Box>
      )}

      <Snackbar
        open={shareSnackbar}
        autoHideDuration={2000}
        onClose={() => setShareSnackbar(false)}
        message={t("common.linkCopied")}
      />
    </Container>
  );
};

export default ProductDetailPage;
