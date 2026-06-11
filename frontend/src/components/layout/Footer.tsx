import { memo } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
} from "@/mui/material";
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  AccessTime,
  LocalShipping,
  Security,
  Verified,
} from "@/mui/icons";
import BrandMark from "../common/BrandMark";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";

const footerLinks = [
  { href: "/", key: "nav.home" },
  { href: "/products", key: "nav.products" },
  { href: "/orders", key: "nav.orders" },
  { href: "/cart", key: "nav.cart" },
];

const policyLinks = [
  { href: "/privacy-policy", key: "footer.privacyPolicy" },
  { href: "/terms-conditions", key: "footer.termsOfService" },
  { href: "/refund-policy", key: "footer.returnPolicy" },
  { href: "/shipping-policy", key: "footer.shippingPolicy" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: <Facebook sx={appIconSx.lg} /> },
  { label: "Twitter", href: "#", icon: <Twitter sx={appIconSx.lg} /> },
  { label: "Instagram", href: "#", icon: <Instagram sx={appIconSx.lg} /> },
  { label: "LinkedIn", href: "#", icon: <LinkedIn sx={appIconSx.lg} /> },
];

const trustItems = [
  { icon: <Verified sx={appIconSx.lg} />, key: "common.authentic" },
  { icon: <Security sx={appIconSx.lg} />, key: "common.securePayment" },
  { icon: <LocalShipping sx={appIconSx.lg} />, key: "common.fastDelivery" },
];

const Footer = memo(() => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const linkSx = {
    color: "rgba(255,255,255,0.72)",
    textDecoration: "none",
    fontSize: "0.92rem",
    lineHeight: 1.8,
    transition: "color 0.2s ease",
    "&:hover": {
      color: tokens.accentLight,
    },
  };

  const sectionTitleSx = {
    color: tokens.white,
    fontWeight: 800,
    mb: 2,
    fontSize: "0.95rem",
    letterSpacing: "0.01em",
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        color: tokens.white,
        background: `linear-gradient(180deg, ${tokens.primaryDark} 0%, #08111f 100%)`,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          px: tokens.pagePaddingX,
          maxWidth: tokens.appMaxWidth,
          py: { xs: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.35fr 0.8fr 1fr 1fr",
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <BrandMark showText textColor={tokens.white} sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.8,
                maxWidth: 360,
                mb: 2,
              }}
            >
              {t("footer.aboutDesc")}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {trustItems.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: "999px",
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  <Box sx={{ color: tokens.accentLight, display: "flex" }}>
                    {item.icon}
                  </Box>
                  <Typography variant="caption" fontWeight={700}>
                    {t(item.key)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={sectionTitleSx}>
              {t("footer.quickNavigation")}
            </Typography>
            <Stack spacing={0.75}>
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} sx={linkSx}>
                  {t(link.key)}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={sectionTitleSx}>{t("footer.support")}</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" gap={1.25} alignItems="flex-start">
                <Email sx={{ ...appIconSx.lg, color: tokens.accentLight, mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    {t("footer.email")}
                  </Typography>
                  <Link href="mailto:support@gadgify.com" sx={linkSx}>
                    support@gadgify.com
                  </Link>
                </Box>
              </Stack>
              <Stack direction="row" gap={1.25} alignItems="flex-start">
                <Phone sx={{ ...appIconSx.lg, color: tokens.accentLight, mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    {t("footer.phone")}
                  </Typography>
                  <Link href="tel:18008004255" sx={linkSx}>
                    1-800-GADGIFY
                  </Link>
                </Box>
              </Stack>
              <Stack direction="row" gap={1.25} alignItems="flex-start">
                <AccessTime sx={{ ...appIconSx.lg, color: tokens.accentLight, mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    {t("footer.availability")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
                    {t("footer.available247")}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography sx={sectionTitleSx}>{t("footer.connect")}</Typography>
            <Stack direction="row" gap={1} sx={{ mb: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 42,
                    height: 42,
                    color: tokens.white,
                    bgcolor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    transition:
                      "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                    "&:hover": {
                      color: tokens.accentLight,
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.24)",
                    },
                    "&:focus-visible": {
                      color: tokens.accentLight,
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: tokens.accentLight,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}
            >
              {t("footer.servingMaharashtra")}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.5)", display: "block", mt: 0.75 }}
            >
              {t("common.availableInMaharashtra")}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: { xs: 3, md: 4 } }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.58)", textAlign: { xs: "center", md: "left" } }}
          >
            © {year} {t("app.title")}. {t("footer.allRightsReserved")}.
          </Typography>
          <Stack
            direction="row"
            gap={{ xs: 1.5, md: 2 }}
            flexWrap="wrap"
            justifyContent="center"
          >
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} sx={linkSx}>
                {t(link.key)}
              </Link>
            ))}
          </Stack>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.5)", textAlign: { xs: "center", md: "right" } }}
          >
            {t("footer.madeWith")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
});

Footer.displayName = "Footer";

export default Footer;
