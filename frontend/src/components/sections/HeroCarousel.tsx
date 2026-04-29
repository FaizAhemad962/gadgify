import { Box, Container, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomCarousel } from "@/components/ui";
import { tokens } from "@/theme/theme";

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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
              fontSize: { xs: "0.9rem", md: "1rem" },
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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}
        >
          🎉 Summer Sale
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2.5rem" },
            mb: 3,
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
          sx={{ mb: 5, fontSize: "1.1rem", opacity: 0.95 }}
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
            fontWeight: 700,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "3rem", md: "4rem" }, mb: 2 }}
        >
          📦
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}
        >
          Free Shipping
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 5, fontSize: "1.2rem", opacity: 0.95, fontWeight: 300 }}
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
            fontWeight: 700,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "3rem", md: "4rem" }, mb: 2 }}
        >
          ✨
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}
        >
          New Arrivals
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 5, fontSize: "1.2rem", opacity: 0.95, fontWeight: 300 }}
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
            fontWeight: 700,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "3rem", md: "4rem" }, mb: 2 }}
        >
          ⭐
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}
        >
          Quality Assured
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 5, fontSize: "1.2rem", opacity: 0.95, fontWeight: 300 }}
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
            fontWeight: 700,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
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
        color: "white",
        minHeight: { xs: "50vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            mb: 2,
            fontWeight: 600,
            background: "rgba(255,255,255,0.3)",
            padding: "8px 16px",
            borderRadius: "20px",
            display: "inline-block",
          }}
        >
          ⏰ Limited Time Offer
        </Typography>
        <Typography
          variant="h3"
          fontWeight="900"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2, mt: 3 }}
        >
          Flash Deal
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontSize: "1.3rem",
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
            fontWeight: 700,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
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
            bottom: { xs: 12, md: 20 },
          },
        }}
      />
    </Box>
  );
};

export default HeroCarousel;
