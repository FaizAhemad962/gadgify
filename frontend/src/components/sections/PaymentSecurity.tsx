import { useTranslation } from "react-i18next";
import { Container, Box, Typography } from "@mui/material";
import {
  Lock,
  CreditCard,
  VerifiedUser,
  PrivacyTip,
  Gavel,
  Support,
} from "@mui/icons-material";
import { tokens } from "../../theme/theme";

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface PaymentSecurityProps {
  title?: string;
  description?: string;
  features?: SecurityFeature[];
}

const DEFAULT_FEATURES: SecurityFeature[] = [
  {
    icon: <Lock sx={{ fontSize: 40 }} />,
    title: "common.security.ssltitle",
    description: "common.security.ssldesc",
    color: tokens.success,
  },
  {
    icon: <CreditCard sx={{ fontSize: 40 }} />,
    title: "common.security.paymenttitle",
    description: "common.security.paymentdesc",
    color: tokens.primary,
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 40 }} />,
    title: "common.security.authentictitle",
    description: "common.security.authenticdesc",
    color: tokens.accent,
  },
  {
    icon: <PrivacyTip sx={{ fontSize: 40 }} />,
    title: "common.security.privacytitle",
    description: "common.security.privacydesc",
    color: tokens.secondary,
  },
  {
    icon: <Gavel sx={{ fontSize: 40 }} />,
    title: "common.security.complytitle",
    description: "common.security.complydesc",
    color: tokens.info,
  },
  {
    icon: <Support sx={{ fontSize: 40 }} />,
    title: "common.security.supporttitle",
    description: "common.security.supportdesc",
    color: tokens.primary,
  },
];

const PaymentSecurity: React.FC<PaymentSecurityProps> = ({
  title = "common.security.title",
  description = "common.security.description",
  features = DEFAULT_FEATURES,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ bgcolor: tokens.white, py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{ color: "text.primary", mb: 1 }}
          >
            🔐 {t(title)}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
          >
            {t(description)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 3,
                border: `1px solid ${tokens.gray200}`,
                borderTop: `4px solid ${feature.color}`,
                borderRadius: 2,
                transition: "all 0.25s",
                "&:hover": {
                  boxShadow: `0 8px 24px ${feature.color}22`,
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Box sx={{ p: 0 }}>
                <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{ color: "text.primary", mb: 1 }}
                >
                  {t(feature.title)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6 }}
                >
                  {t(feature.description)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Trust Badges */}
        <Box
          sx={{
            mt: 8,
            pt: 6,
            textAlign: "center",
            borderTop: `2px solid ${tokens.gray200}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}
          >
            {t("common.trustedPaymentPartners")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {["Razorpay", "Stripe"].map((partner) => (
              <Box
                key={partner}
                sx={{
                  px: 3,
                  py: 2,
                  border: `1px solid ${tokens.gray300}`,
                  borderRadius: 2,
                  color: "text.secondary",
                  fontWeight: 600,
                  bgcolor: tokens.gray50,
                }}
              >
                {partner}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentSecurity;
