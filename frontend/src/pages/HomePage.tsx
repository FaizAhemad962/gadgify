import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
  Rocket,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { tokens } from "@/theme/theme";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // const features = [
  //   { icon: <ShoppingCart fontSize="large" />, title: t('common.wideSelection'), desc: t('common.latestGadgets') },
  //   { icon: <LocalShipping fontSize="large" />, title: t('common.fastDelivery'), desc: t('common.quickDelivery') },
  //   { icon: <Security fontSize="large" />, title: t('common.securePayment'), desc: t('common.safeTransactions') },
  //   { icon: <Support fontSize="large" />, title: t('common.support247'), desc: t('common.alwaysHelp') },
  // ]

  return (
    <Box sx={{ bgcolor: tokens.gray50 }}>
      {/* Hero Section */}
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

      {/* Stats Section */}
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

      {/* Features Section */}
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

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* CTA Section */}
      <Box sx={{ bgcolor: tokens.gray100, py: 10 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Box sx={{ mb: 3 }}>
            <Rocket sx={{ fontSize: 50, color: tokens.accent, mb: 2 }} />
          </Box>
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

      {/* Trust Section */}
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
