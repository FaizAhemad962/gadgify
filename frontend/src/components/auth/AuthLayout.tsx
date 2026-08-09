import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@/mui/material";
import { LocalShipping, LocationOn, Security, Verified } from "@/mui/icons";
import BrandMark from "@/components/common/BrandMark";
import LanguageSelector from "@/components/common/LanguageSelector";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  maxFormWidth?: number;
};

const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
  maxFormWidth = 520,
}: AuthLayoutProps) => {
  const { t } = useTranslation();

  const trustItems = [
    {
      label: t("auth.maharashtraDelivery"),
      icon: LocationOn,
    },
    { label: t("auth.secureCheckout"), icon: Security },
    { label: t("auth.verifiedStore"), icon: Verified },
  ];

  const featureItems = [
    {
      title: t("auth.fastLocalDelivery"),
      description: t("auth.fastLocalDeliveryDescription"),
      icon: LocalShipping,
    },
    {
      title: t("auth.protectedAccount"),
      description: t("auth.protectedAccountDescription"),
      icon: Security,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          `radial-gradient(circle at 12% 18%, ${tokens.accent}1A 0, transparent 30%), ` +
          `radial-gradient(circle at 88% 12%, ${tokens.primary}24 0, transparent 32%), ` +
          `linear-gradient(135deg, ${tokens.gray50} 0%, ${tokens.white} 42%, ${tokens.primary}14 100%)`,
        display: "flex",
        alignItems: "center",
        py: { xs: 3, md: 6 },
        px: tokens.pagePaddingX,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: { xs: 260, md: 420 },
          height: { xs: 260, md: 420 },
          borderRadius: "50%",
          background: `${tokens.accent}1A`,
          top: { xs: -120, md: -160 },
          right: { xs: -120, md: -80 },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          borderRadius: "50%",
          background: `${tokens.primary}14`,
          bottom: { xs: -120, md: -140 },
          left: { xs: -120, md: -80 },
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: tokens.appMaxWidth,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              color: tokens.primary,
              display: { xs: "none", lg: "block" },
            }}
          >
            <BrandMark size={88} showText textColor={tokens.primary} />
            <Typography
              variant="h2"
              sx={{
                mt: 4,
                maxWidth: 520,
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 1.02,
                color: tokens.gray900,
              }}
            >
              {t("auth.authHeroTitle")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                maxWidth: 520,
                color: tokens.gray600,
                lineHeight: 1.65,
                fontWeight: 500,
              }}
            >
              {t("auth.authHeroSubtitle")}
            </Typography>

            <Stack spacing={2} sx={{ mt: 4, maxWidth: 520 }}>
              {featureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.title}
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 2,
                      border: `1px solid ${tokens.gray200}`,
                      borderRadius: `${tokens.radiusLg}px`,
                      background: `${tokens.white}CC`,
                      boxShadow: tokens.shadowSm,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "14px",
                        display: "grid",
                        placeItems: "center",
                        color: tokens.accent,
                        background: `${tokens.accent}14`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={appIconSx.lg} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: tokens.gray900 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: tokens.gray600 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", lg: maxFormWidth },
              justifySelf: { xs: "center", lg: "end" },
              p: { xs: 2.5, sm: 4 },
              borderRadius: `${tokens.radiusXl}px`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.72))",
              border: "1px solid rgba(255,255,255,0.78)",
              boxShadow: "0 28px 90px rgba(15, 23, 42, 0.14)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.12))",
              },
              "& > *": {
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  display: { xs: "flex", lg: "none" },
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <BrandMark size={72} showText textColor={tokens.primary} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: tokens.gray900,
                  letterSpacing: "-0.03em",
                }}
              >
                {title}
              </Typography>
              <Typography sx={{ mt: 1, color: tokens.gray500 }}>
                {subtitle}
              </Typography>
            </Box>

            {children}

            {footer && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" sx={{ color: tokens.gray400 }}>
                    {t("common.or").toLocaleUpperCase()}
                  </Typography>
                </Divider>
                {footer}
              </>
            )}

            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: `1px solid ${tokens.gray200}`,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
              }}
            >
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.label}
                    sx={{
                      textAlign: "center",
                      color: tokens.gray600,
                    }}
                  >
                    <Icon sx={{ ...appIconSx.lg, color: tokens.accent }} />
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        fontWeight: 700,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ pt: 3 }}>
              <LanguageSelector tone="surface" />
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
