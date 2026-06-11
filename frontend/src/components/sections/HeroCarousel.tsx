import { Box, Container, Typography, Button, Divider } from "@/mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomCarousel } from "@/components/ui";
import { tokens } from "@/theme/theme";

const heroSlideSx = {
  color: "white",
  minHeight: { xs: 360, sm: 390, md: 430 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  textAlign: "center",
};

const heroContainerSx = {
  position: "relative",
  zIndex: 1,
  py: { xs: 5, md: 6 },
};

const primaryCtaSx = {
  fontWeight: 700,
  py: { xs: 1.1, md: 1.25 },
  px: { xs: 3, md: 3.5 },
  borderRadius: "14px",
  textTransform: "none",
  fontSize: { xs: "0.9rem", md: "0.95rem" },
};

/**
 * Hero Carousel Component
 * Displays a rotating hero section with multiple slides including:
 * - Welcome/Hero slide
 * - Promotional offer slide
 * - Feature highlight slide
 * - Limited time offer slide
 * - Brand story slide
 * - Call-to-action slide
 */
const HeroCarousel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Hero slide content
  const heroSlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
        ...heroSlideSx,
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
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", sm: "2.4rem", md: "3rem" }, mb: 1.5 }}
        >
          {t("app.title")}
        </Typography>
        <Divider
          sx={{
            width: 80,
            height: 3,
            bgcolor: tokens.accent,
            mx: "auto",
            mb: 2,
            borderRadius: 2,
          }}
        />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}>
          {t("app.subtitle")}
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2, mb: 3, fontSize: { xs: "0.95rem", md: "1.05rem" }, opacity: 0.92 }}
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
              ...primaryCtaSx,
              "&:hover": {
                bgcolor: tokens.accentDark,
                boxShadow: `0 6px 20px ${tokens.accent}44`,
              },
            }}
          >
            🛍️ {t("products.title")}
          </Button>
        </Box>
      </Container>
    </Box>
  );

  // Summer Sale / Promo Slide
  const promoSlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%)`,
        ...heroSlideSx,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "1.8rem", md: "2.6rem" }, mb: 1.5 }}
        >
          🎉 Summer Sale
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.35rem", md: "2.1rem" },
            mb: 2,
            fontWeight: 700,
            background: "linear-gradient(90deg, #FFE66D, #FFFFFF)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Up to 50% OFF
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontSize: { xs: "0.95rem", md: "1.05rem" }, opacity: 0.95 }}
        >
          Don't miss our biggest sale of the year!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            bgcolor: "white",
            color: "#FF6B6B",
            ...primaryCtaSx,
            "&:hover": {
              bgcolor: "#FFE66D",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          Shop Now →
        </Button>
      </Container>
    </Box>
  );

  // Free Shipping Slide
  const freeShippingSlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)`,
        ...heroSlideSx,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 1.5 }}
        >
          📦
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5 }}
        >
          Free Shipping
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontSize: { xs: "0.95rem", md: "1.05rem" }, opacity: 0.95, fontWeight: 400 }}
        >
          On orders above ₹500 | Across Maharashtra
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            bgcolor: "white",
            color: "#4ECDC4",
            ...primaryCtaSx,
            "&:hover": {
              bgcolor: "#E0F7F6",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          Start Shopping →
        </Button>
      </Container>
    </Box>
  );

  // New Arrivals Slide
  const newArrivalsSlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        ...heroSlideSx,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 1.5 }}
        >
          ✨
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5 }}
        >
          New Arrivals
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontSize: { xs: "0.95rem", md: "1.05rem" }, opacity: 0.95, fontWeight: 400 }}
        >
          Discover the latest gadgets and products from top brands
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            bgcolor: "white",
            color: "#667eea",
            ...primaryCtaSx,
            "&:hover": {
              bgcolor: "#F0E6FF",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          Explore →
        </Button>
      </Container>
    </Box>
  );

  // Premium Quality Slide
  const qualitySlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`,
        ...heroSlideSx,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 1.5 }}
        >
          ⭐
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5 }}
        >
          Quality Assured
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            opacity: 0.95,
            fontWeight: 400,
          }}
        >
          100% Original Products | 30-Day Money Back Guarantee | 24/7 Customer
          Support
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            bgcolor: "white",
            color: "#f5576c",
            ...primaryCtaSx,
            "&:hover": {
              bgcolor: "#FFE5E9",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          Shop With Confidence →
        </Button>
      </Container>
    </Box>
  );

  // Limited Time Offer Slide
  const limitedOfferSlide = (
    <Box
      sx={{
        background: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`,
        ...heroSlideSx,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={heroContainerSx}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            mb: 1.5,
            fontWeight: 600,
            background: "rgba(255,255,255,0.3)",
            padding: "7px 14px",
            borderRadius: "20px",
            display: "inline-block",
          }}
        >
          ⏰ Limited Time Offer
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5, mt: 2 }}
        >
          Flash Deal
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontSize: { xs: "1rem", md: "1.15rem" },
            opacity: 0.95,
            fontWeight: 600,
          }}
        >
          Selected Items: Flat 40% Off for Next 24 Hours Only!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            bgcolor: "white",
            color: "#fa709a",
            ...primaryCtaSx,
            "&:hover": {
              bgcolor: "#FFF8E1",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          Grab Deal Before It Ends →
        </Button>
      </Container>
    </Box>
  );

  const slides = [
    heroSlide,
    promoSlide,
    freeShippingSlide,
    newArrivalsSlide,
    qualitySlide,
    limitedOfferSlide,
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <CustomCarousel
        items={slides}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={true}
        autoplayDelay={4000}
        showNavigation={true}
        showPagination={true}
        loop={true}
        hidePaginationOnMobile={false}
        pauseOnHover={true}
        sx={{
          "& .swiper-pagination": {
            bottom: { xs: 10, md: 14 },
          },
        }}
      />
    </Box>
  );
};

export default HeroCarousel;
