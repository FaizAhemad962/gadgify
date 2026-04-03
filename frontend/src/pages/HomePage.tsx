import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  TextField,
  InputAdornment,
  Avatar,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
  Rocket,
  ArrowForward,
  Email,
  Timer,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { productsApi } from "@/api/products";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { tokens } from "@/theme/theme";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/constants/categories";

// Fake testimonials (static — replace with real API data when available)
const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Mumbai",
    avatar: "P",
    rating: 5,
    text: "Best electronics store in Maharashtra! Fast delivery and authentic products. I've ordered 3 times and never been disappointed.",
  },
  {
    name: "Rahul M.",
    city: "Pune",
    avatar: "R",
    rating: 5,
    text: "The product quality is excellent and customer support is very responsive. GST invoices are provided for every order.",
  },
  {
    name: "Anita K.",
    city: "Nagpur",
    avatar: "A",
    rating: 4,
    text: "Great prices and easy returns. I love the variety of gadgets available. My go-to store for tech purchases!",
  },
];

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Deal countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const getEndOfDay = useCallback(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end;
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = getEndOfDay();
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [getEndOfDay]);

  // Fetch trending products (sort by popularity)
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: () => productsApi.getAll({ sortBy: "popularity", limit: 4 }),
  });

  // Fetch new arrivals (sort by newest)
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => productsApi.getAll({ sortBy: "newest", limit: 4 }),
  });

  // Fetch a "deal" product (highest-discounted product)
  const { data: dealData } = useQuery({
    queryKey: ["deal-of-day"],
    queryFn: () => productsApi.getAll({ sortBy: "price-low", limit: 1 }),
  });

  const trendingProducts = trendingData?.products || [];
  const newArrivals = newArrivalsData?.products || [];
  const dealProduct = dealData?.products?.[0];

  const categories = Object.keys(CATEGORY_ICONS);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addToCart({ productId, quantity: 1 });
  };

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addToCart({ productId, quantity: 1 });
    navigate("/checkout");
  };

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const productSkeletons = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
        gap: 3,
      }}
    >
      {[...Array(4)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={320}
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: tokens.gray50 }}>
      {/* ───── Hero Section ───── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${tokens.accent}18 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${tokens.accent}18 0%, transparent 50%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="900"
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, mb: 2 }}
          >
            {t("app.title")}
          </Typography>
          <Divider
            sx={{
              width: 80,
              height: 4,
              bgcolor: tokens.accent,
              mx: "auto",
              mb: 3,
              borderRadius: 2,
            }}
          />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 300, mb: 3 }}>
            {t("app.subtitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 3, mb: 5, fontSize: "1.1rem", opacity: 0.95 }}
          >
            {t("common.discoverLatest")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                bgcolor: tokens.accent,
                fontWeight: 700,
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: tokens.accentDark,
                  boxShadow: `0 6px 20px ${tokens.accent}44`,
                },
              }}
            >
              🛍️ {t("products.title")}
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "white",
                  fontWeight: 700,
                  py: 1.5,
                  px: 4,
                  "&:hover": {
                    borderColor: tokens.accent,
                    bgcolor: `${tokens.accent}18`,
                  },
                }}
                onClick={() => navigate("/signup")}
              >
                {t("nav.signup")}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* ───── Stats Section ───── */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {[
            { number: "10K+", label: t("common.happyCustomers") },
            { number: "5K+", label: t("common.products") },
            { number: "24/7", label: t("common.support") },
            { number: "100%", label: t("common.authentic") },
          ].map((stat, index) => (
            <Box key={index} sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: tokens.accent, mb: 1 }}
              >
                {stat.number}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ───── 1. SHOP BY CATEGORY ───── */}
      <Box sx={{ bgcolor: tokens.white, py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary", mb: 1 }}
            >
              {t("common.shopByCategory")}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {t("common.shopByCategoryDesc")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {categories.map((cat, i) => (
              <Box
                key={cat}
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat)}`)
                }
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  p: 3,
                  borderRadius: 3,
                  cursor: "pointer",
                  border: `1px solid ${tokens.gray200}`,
                  bgcolor: tokens.white,
                  transition: "all 0.25s",
                  "&:hover": {
                    borderColor: CATEGORY_COLORS[i],
                    boxShadow: `0 4px 16px ${CATEGORY_COLORS[i]}20`,
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    color: CATEGORY_COLORS[i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${CATEGORY_COLORS[i]}10`,
                    borderRadius: 2,
                    width: 64,
                    height: 64,
                  }}
                >
                  {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    textAlign: "center",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  }}
                >
                  {t(`categories.${cat}`)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ───── 2. TRENDING NOW ───── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              🔥 {t("common.trendingNow")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {t("common.trendingDesc")}
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate("/products?sortBy=popularity")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: tokens.primary,
            }}
          >
            {t("common.viewAll")}
          </Button>
        </Box>
        {trendingLoading ? (
          productSkeletons
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isInWishlist={isInWishlist}
                isToggling={isToggling}
                toggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onNavigate={(id) => navigate(`/products/${id}`)}
                t={t}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* ───── 3. DEAL OF THE DAY ───── */}
      {dealProduct && (
        <Box sx={{ bgcolor: tokens.white, py: 8 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: `linear-gradient(135deg, ${tokens.primaryDark} 0%, ${tokens.primary} 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                <Box
                  sx={{
                    bgcolor: tokens.accent,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Timer sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {t("common.limitedTimeOffer")}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={
                    dealProduct.media?.find((m) => m.isPrimary)?.url ||
                    dealProduct.media?.[0]?.url ||
                    ""
                  }
                  alt={dealProduct.name}
                  sx={{
                    width: { xs: 200, md: 280 },
                    height: { xs: 200, md: 280 },
                    objectFit: "contain",
                    borderRadius: 3,
                    bgcolor: "white",
                    p: 2,
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: tokens.accent,
                    fontWeight: 700,
                    letterSpacing: 2,
                  }}
                >
                  {t("common.dealOfTheDay")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                  {dealProduct.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.85, mb: 3, lineHeight: 1.7 }}
                >
                  {dealProduct.description?.substring(0, 150)}...
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: tokens.accent }}
                  >
                    ₹{dealProduct.price.toLocaleString()}
                  </Typography>
                </Box>
                {/* Countdown */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {t("common.dealEndsIn")}:
                  </Typography>
                  {[
                    { val: timeLeft.hours, label: t("common.hours") },
                    { val: timeLeft.minutes, label: t("common.minutes") },
                    { val: timeLeft.seconds, label: t("common.seconds") },
                  ].map((t, i) => (
                    <Box
                      key={i}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.15)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        textAlign: "center",
                        minWidth: 48,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {String(t.val).padStart(2, "0")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, fontSize: "0.65rem" }}
                      >
                        {t.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/products/${dealProduct.id}`)}
                  sx={{
                    bgcolor: tokens.accent,
                    fontWeight: 700,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: "flex-start",
                    "&:hover": { bgcolor: tokens.accentDark },
                  }}
                >
                  {t("products.buyNow")} →
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* ───── 4. NEW ARRIVALS ───── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              ✨ {t("common.newArrivals")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {t("common.newArrivalsDesc")}
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate("/products?sortBy=newest")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: tokens.primary,
            }}
          >
            {t("common.viewAll")}
          </Button>
        </Box>
        {newArrivalsLoading ? (
          productSkeletons
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
              gap: 3,
            }}
          >
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isInWishlist={isInWishlist}
                isToggling={isToggling}
                toggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onNavigate={(id) => navigate(`/products/${id}`)}
                t={t}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* ───── Features Section ───── */}
      <Box sx={{ bgcolor: tokens.white, py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="700"
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("common.whyChooseGadgify")}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: "text.secondary", mb: 6, maxWidth: 600, mx: "auto" }}
          >
            {t("common.commitmentMessage")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            {[
              {
                icon: <ShoppingCart sx={{ fontSize: 40 }} />,
                title: t("common.wideSelection"),
                desc: t("common.browseProducts"),
                color: tokens.primary,
              },
              {
                icon: <LocalShipping sx={{ fontSize: 40 }} />,
                title: t("common.fastDelivery"),
                desc: t("common.quickDelivery"),
                color: tokens.success,
              },
              {
                icon: <Security sx={{ fontSize: 40 }} />,
                title: t("common.securePayment"),
                desc: t("common.safeTransactions"),
                color: tokens.accent,
              },
              {
                icon: <Support sx={{ fontSize: 40 }} />,
                title: t("common.support247"),
                desc: t("common.alwaysHelp"),
                color: tokens.secondary,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 4,
                  border: `1px solid ${tokens.gray200}`,
                  transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ color: feature.color, mb: 3 }}>{feature.icon}</Box>
                <CardContent sx={{ p: 0 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ───── Recently Viewed Products ───── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <RecentlyViewed />
      </Container>

      {/* ───── 5. CUSTOMER TESTIMONIALS ───── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{ color: "text.primary", mb: 1 }}
          >
            💬 {t("common.customerStories")}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {t("common.customerStoriesDesc")}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {TESTIMONIALS.map((review, i) => (
            <Card
              key={i}
              sx={{
                p: 3,
                border: `1px solid ${tokens.gray200}`,
                height: "100%",
                transition: "all 0.25s",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar sx={{ bgcolor: CATEGORY_COLORS[i], fontWeight: 700 }}>
                  {review.avatar}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {review.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {review.city}
                  </Typography>
                </Box>
              </Box>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                sx={{ mb: 1.5 }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                "{review.text}"
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* ───── Satisfaction Guarantee ───── */}
      <Box sx={{ bgcolor: tokens.white, py: 6 }}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "3rem", mb: 2 }}>🛡️</Typography>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ color: "text.primary", mb: 1 }}
          >
            {t("common.satisfactionGuarantee")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            {t("common.satisfactionDesc")}
          </Typography>
        </Container>
      </Box>

      {/* ───── 6. NEWSLETTER SIGNUP ───── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Email sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
          <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
            {t("common.newsletterTitle")}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
            {t("common.newsletterDesc")}
          </Typography>
          {subscribed ? (
            <Typography
              variant="h6"
              sx={{ color: tokens.accentLight, fontWeight: 700 }}
            >
              ✅ {t("common.subscribed")}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 1, maxWidth: 440, mx: "auto" }}>
              <TextField
                size="small"
                fullWidth
                placeholder={t("common.emailPlaceholderShort")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: tokens.gray400 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubscribe}
                sx={{
                  bgcolor: tokens.accent,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: tokens.accentDark },
                }}
              >
                {t("common.subscribe")}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* ───── CTA Section ───── */}
      <Box sx={{ bgcolor: tokens.gray100, py: 10 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Rocket sx={{ fontSize: 50, color: tokens.accent, mb: 2 }} />
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="700"
            sx={{ color: "text.primary" }}
          >
            {t("common.readyToShop")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 5, fontSize: "1.05rem" }}
          >
            {t("common.startShopping")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              bgcolor: tokens.accent,
              fontWeight: 700,
              py: 1.8,
              px: 5,
              fontSize: "1.05rem",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                bgcolor: tokens.accentDark,
                boxShadow: `0 6px 20px ${tokens.accent}44`,
              },
            }}
          >
            {t("common.shopNow")} →
          </Button>
        </Container>
      </Box>

      {/* ───── Trust Section ───── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          fontWeight="700"
          sx={{ mb: 6, color: "text.primary" }}
        >
          {t("common.trustedByThousands")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {[
            {
              icon: "✓",
              title: t("common.wideSelection"),
              desc: t("common.latestGadgets"),
            },
            {
              icon: "⚡",
              title: t("common.easyReturns"),
              desc: t("common.sevenDayReturn"),
            },
            {
              icon: "🔒",
              title: t("common.safeToShop"),
              desc: t("common.sslEncrypted"),
            },
          ].map((trust, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                border: `1px solid ${tokens.gray200}`,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>
                {trust.icon}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
              >
                {trust.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trust.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
