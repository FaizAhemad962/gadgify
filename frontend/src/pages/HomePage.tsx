import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
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
import { useNewsletterSubscribe } from "@/hooks/useNewsletter";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryIcon } from "@/utils/categoryIconMapper";
import { getCategoryColor } from "@/utils/categoryColorMapper";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import InView from "@/components/InView";
import HeroCarousel from "@/components/sections/HeroCarousel";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { tokens } from "@/theme/theme";
import {
  FlashSale,
  BestSellers,
  // FeaturedBrands,
  // FAQ,
  // HowItWorks,
  // PaymentSecurity,
  // CustomerHighlights,
} from "@/components/sections";

// Fake testimonials (static — replace with real API data when available)
// Using translation keys now
const TESTIMONIALS = [
  {
    nameKey: "common.testimonial1Name",
    cityKey: "common.testimonial1City",
    avatarInitial: "P",
    rating: 5,
    textKey: "common.testimonial1Text",
  },
  {
    nameKey: "common.testimonial2Name",
    cityKey: "common.testimonial2City",
    avatarInitial: "R",
    rating: 5,
    textKey: "common.testimonial2Text",
  },
  {
    nameKey: "common.testimonial3Name",
    cityKey: "common.testimonial3City",
    avatarInitial: "A",
    rating: 4,
    textKey: "common.testimonial3Text",
  },
];

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  // Color palette for testimonials and other features
  const featureColors = [
    tokens.primary,
    tokens.accent,
    tokens.secondary,
    tokens.success,
    tokens.warning,
    tokens.error,
  ];

  // Newsletter subscription
  const { subscribe, isPending, error, message, clearError, clearMessage } =
    useNewsletterSubscribe();
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

  // Fetch categories from database
  const { data: categoriesData = [] } = useCategories();

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

  const handleSubscribe = async () => {
    if (!email.trim()) return;

    try {
      clearError();
      clearMessage();
      await subscribe(email);
      setSubscribed(true);
      setEmail("");
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <Box sx={{ bgcolor: tokens.gray50 }}>
      {/* ───── Hero Carousel Section ───── */}
      <HeroCarousel />

      {/* ───── Stats Section ───── */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
            gap: { xs: 2, md: 3 },
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
                sx={{
                  fontWeight: 900,
                  color: tokens.accent,
                  mb: 0.5,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                }}
              >
                {stat.number}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ───── 1. SHOP BY CATEGORY ───── */}
      <Box sx={{ bgcolor: tokens.white, py: { xs: 2, md: 3 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {t("common.shopByCategory")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {t("common.shopByCategoryDesc")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {categoriesData.map((category, i) => (
              <Card
                key={category.id}
                onClick={() =>
                  navigate(
                    `/products?category=${encodeURIComponent(category.name)}`,
                  )
                }
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  p: { xs: 2, md: 3 },
                  cursor: "pointer",
                  border: `1px solid ${tokens.gray200}`,
                  height: "100%",
                  transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                  minHeight: { xs: 120, md: 160 },
                  justifyContent: "center",
                  bgcolor: tokens.white,
                  borderRadius: 4,
                  "&:hover": {
                    borderColor: getCategoryColor(category.name, i),
                    boxShadow: `0 8px 24px ${getCategoryColor(category.name, i)}30`,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box
                  sx={{
                    color: getCategoryColor(category.name, i),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${getCategoryColor(category.name, i)}10`,
                    borderRadius: 2,
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    fontSize: { xs: "1.75rem", md: "2rem" },
                  }}
                >
                  {getCategoryIcon(category.name)}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    textAlign: "center",
                    fontSize: { xs: "0.8rem", sm: "0.9rem", md: "0.95rem" },
                  }}
                >
                  {category.name}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ───── 2. TRENDING NOW ───── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mb: 1,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              🔥 {t("common.trendingNow")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
              }}
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
              minHeight: 44,
              px: 2,
            }}
          >
            {t("common.viewAll")}
          </Button>
        </Box>
        {!trendingLoading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)", // 2 columns on mobile for consistency
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gridAutoRows: "1fr", // Force rows to have equal height
              gap: 2,
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

      {/* ───── FLASH SALE ───── */}
      <FlashSale />

      {/* ───── 3. DEAL OF THE DAY ───── */}
      {dealProduct && (
        <Box sx={{ bgcolor: tokens.white, py: { xs: 2, md: 3 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 3 },
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                background: `linear-gradient(135deg, ${tokens.primaryDark} 0%, ${tokens.primary} 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 1,
                  right: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: tokens.accent,
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Timer sx={{ fontSize: 16 }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: "0.8rem" }}
                  >
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
                    width: { xs: 160, sm: 200, md: 280 },
                    height: { xs: 160, sm: 200, md: 280 },
                    objectFit: "contain",
                    borderRadius: 3,
                    bgcolor: "white",
                    p: 1,
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
                    fontSize: "0.8rem",
                  }}
                >
                  {t("common.dealOfTheDay")}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mt: 0.5,
                    mb: 1,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {dealProduct.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.85,
                    mb: 2,
                    lineHeight: 1.7,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                >
                  {dealProduct.description?.substring(0, 150)}...
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: tokens.accent,
                      fontSize: { xs: "1.75rem", md: "2.25rem" },
                    }}
                  >
                    ₹{dealProduct.price.toLocaleString()}
                  </Typography>
                </Box>
                {/* Countdown */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {[
                    { label: "Hrs", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Sec", value: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        textAlign: "center",
                        minWidth: 50,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, lineHeight: 1 }}
                      >
                        {unit.value.toString().padStart(2, "0")}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {unit.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/products/${dealProduct.id}`)}
                  sx={{
                    bgcolor: "white",
                    color: tokens.primary,
                    fontWeight: 700,
                    alignSelf: "flex-start",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: tokens.accent,
                      color: "white",
                    },
                  }}
                >
                  {t("common.grabDealNow")} →
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* ───── 4. NEW ARRIVALS ───── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mb: 1,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              ✨ {t("common.newArrivals")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
              }}
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
              minHeight: 44,
              px: 2,
            }}
          >
            {t("common.viewAll")}
          </Button>
        </Box>
        {!newArrivalsLoading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)", // 2 columns on mobile
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gridAutoRows: "1fr",
              gap: 2,
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

        {/* ───── BEST SELLERS ───── */}
        <BestSellers />

        {/* ───── Features Section ───── */}
        <Box sx={{ bgcolor: tokens.white, py: { xs: 2, md: 3 } }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              fontWeight="700"
              sx={{
                mb: 1,
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {t("common.whyChooseGadgify")}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                color: "text.secondary",
                mb: 2,
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
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
                gap: 2,
              }}
            >
              {[
                {
                  icon: <ShoppingCart sx={{ fontSize: { xs: 32, md: 40 } }} />,
                  title: t("common.wideSelection"),
                  desc: t("common.browseProducts"),
                  color: tokens.primary,
                },
                {
                  icon: <LocalShipping sx={{ fontSize: { xs: 32, md: 40 } }} />,
                  title: t("common.fastDelivery"),
                  desc: t("common.quickDelivery"),
                  color: tokens.success,
                },
                {
                  icon: <Security sx={{ fontSize: { xs: 32, md: 40 } }} />,
                  title: t("common.securePayment"),
                  desc: t("common.safeTransactions"),
                  color: tokens.accent,
                },
                {
                  icon: <Support sx={{ fontSize: { xs: 32, md: 40 } }} />,
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
                    p: { xs: 1, md: 2 },
                    border: `1px solid ${tokens.gray200}`,
                    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: { xs: "0.95rem", md: "1.1rem" },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                      }}
                    >
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

      {/* ───── FEATURED BRANDS ───── */}
      {/* <FeaturedBrands /> */}

      {/* ───── Recently Viewed Products ───── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <RecentlyViewed />
      </Container>

      {/* ───── 5. CUSTOMER TESTIMONIALS ───── */}
      <InView animationType="slideUp">
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              💬 {t("common.customerStories")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {t("common.customerStoriesDesc")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            {TESTIMONIALS.map((review, i) => (
              <Card
                key={i}
                sx={{
                  p: { xs: 1, md: 2 },
                  border: `1px solid ${tokens.gray200}`,
                  height: "100%",
                  transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: featureColors[i % featureColors.length],
                      fontWeight: 700,
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      fontSize: "1rem",
                    }}
                  >
                    {review.avatarInitial}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.9rem", md: "0.95rem" },
                      }}
                    >
                      {t(review.nameKey)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t(review.cityKey)}
                    </Typography>
                  </Box>
                </Box>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                  }}
                >
                  "{t(review.textKey)}"
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>

        {/* ───── CUSTOMER HIGHLIGHTS (Real Reviews from Ratings) ───── */}

        {/* <CustomerHighlights /> */}

        {/* ───── HOW IT WORKS ───── */}

        {/* <HowItWorks /> */}

        {/* ───── PAYMENT SECURITY ───── */}

        {/* <PaymentSecurity /> */}

        {/* ───── Satisfaction Guarantee ───── */}
        <Box sx={{ bgcolor: tokens.white, py: { xs: 2, md: 3 } }}>
          <Container maxWidth="sm" sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: "2.5rem", md: "3rem" }, mb: 1 }}>
              🛡️
            </Typography>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {t("common.satisfactionGuarantee")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {t("common.satisfactionDesc")}
            </Typography>
          </Container>
        </Box>
      </InView>

      {/* ───── FAQ ───── */}

      {/* <FAQ /> */}

      {/* ───── 6. NEWSLETTER SIGNUP ───── */}
      <InView animationType="slideUp">
        <Box
          sx={{
            background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
            color: "white",
            py: { xs: 2, md: 3 },
          }}
        >
          <Container maxWidth="sm" sx={{ textAlign: "center" }}>
            <Email
              sx={{
                fontSize: { xs: 40, md: 48 },
                mb: 1,
                opacity: 0.8,
              }}
            />
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                mb: 1,
                fontSize: { xs: "1.5rem", md: "1.75rem" },
              }}
            >
              {t("common.newsletterTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.85,
                mb: 4,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {t("common.newsletterDesc")}
            </Typography>

            {subscribed && message ? (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: tokens.accentLight,
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: "0.95rem", md: "1.1rem" },
                  }}
                >
                  ✅ {message}
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    maxWidth: 500,
                    mx: "auto",
                    alignItems: "flex-start",
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    placeholder={t("common.emailPlaceholderShort")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    error={!!error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: tokens.gray400, ml: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        height: 48,
                      },
                      "& .MuiOutlinedInput-input": {
                        paddingLeft: 0.5,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none !important",
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubscribe}
                    disabled={isPending || !email.trim()}
                    sx={{
                      bgcolor: tokens.accent,
                      color: "white",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                      height: 48,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        bgcolor: tokens.accentDark,
                      },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(255, 255, 255, 0.12)",
                        color: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    {isPending ? t("common.loading") : t("common.subscribe")}
                  </Button>
                </Box>
                {error && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#ffcdd2", // Lighter red for dark background
                      mt: 1,
                      fontSize: "0.85rem",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </Typography>
                )}
              </>
            )}
          </Container>
        </Box>

        {/* ───── CTA Section ───── */}
        <Box
          sx={{
            bgcolor: tokens.gray100,
            py: { xs: 2, md: 3 },
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Rocket
              sx={{
                fontSize: { xs: 40, md: 50 },
                color: tokens.accent,
                mb: 1,
              }}
            />
            <Typography
              variant="h3"
              gutterBottom
              fontWeight="700"
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {t("common.readyToShop")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 5,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
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
                py: 2,
                px: 4,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                borderRadius: 2,
                textTransform: "none",
                minHeight: 44,
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
      </InView>

      {/* ───── Trust Section ───── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          fontWeight="700"
          sx={{
            mb: 2,
            color: "text.primary",
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          {t("common.trustedByThousands")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 1,
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
            <Card
              key={index}
              sx={{
                p: { xs: 1, md: 2 },
                border: `1px solid ${tokens.gray200}`,
                height: "100%",
                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 0.5,
                }}
              >
                {trust.icon}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: "text.primary",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                {trust.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
              >
                {trust.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
