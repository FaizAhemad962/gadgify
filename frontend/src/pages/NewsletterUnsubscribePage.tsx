import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Mail,
  CheckCircle,
  Error as ErrorIcon,
  Home,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { newsletterApi } from "@/api/newsletters";
import { tokens } from "@/theme/theme";

export const NewsletterUnsubscribePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const unsubscribeEmail = searchParams.get("email");

    if (!unsubscribeEmail) {
      setError("Email parameter is missing");
      setLoading(false);
      return;
    }

    setEmail(unsubscribeEmail);

    const handleUnsubscribe = async () => {
      try {
        await newsletterApi.unsubscribe(unsubscribeEmail);
        setSuccess(true);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to unsubscribe from newsletter");
        }
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.gray50,
        py: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 6, textAlign: "center" }}>
            {loading ? (
              <Box>
                <CircularProgress
                  size={60}
                  sx={{ mb: 3, color: tokens.primary }}
                />
                <Typography variant="h5" sx={{ color: tokens.gray700, mb: 1 }}>
                  {t("newsletter.unsubscribing") || "Unsubscribing..."}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: tokens.gray500, mb: 3 }}
                >
                  {email && `Processing request for ${email}`}
                </Typography>
              </Box>
            ) : success ? (
              <Box>
                <CheckCircle
                  sx={{
                    fontSize: 80,
                    color: tokens.success,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: tokens.gray900,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {t("newsletter.unsubscribeSuccess") ||
                    "You've been unsubscribed"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: tokens.gray600,
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  {t("newsletter.unsubscribeMessage") ||
                    "You will no longer receive emails from Gadgify newsletter. You can resubscribe anytime on our website."}
                </Typography>
                <Alert severity="info" sx={{ mb: 4, textAlign: "left" }}>
                  <Typography variant="body2">
                    {email} has been removed from our newsletter list.
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => navigate("/")}
                  startIcon={<Home />}
                  sx={{
                    bgcolor: tokens.primary,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": { bgcolor: tokens.primaryDark },
                  }}
                >
                  {t("common.backToHome") || "Back to Home"}
                </Button>
              </Box>
            ) : error ? (
              <Box>
                <ErrorIcon
                  sx={{
                    fontSize: 80,
                    color: tokens.error,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: tokens.gray900,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {t("newsletter.unsubscribeFailed") || "Unsubscribe Failed"}
                </Typography>
                <Alert severity="error" sx={{ mb: 4, textAlign: "left" }}>
                  <Typography variant="body2">{error}</Typography>
                </Alert>
                <Typography
                  variant="body2"
                  sx={{
                    color: tokens.gray600,
                    mb: 3,
                  }}
                >
                  {t("newsletter.contactSupport") ||
                    "Please contact support if you continue to receive emails."}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      borderRadius: 2,
                      borderColor: tokens.primary,
                      color: tokens.primary,
                      "&:hover": {
                        borderColor: tokens.primaryDark,
                        bgcolor: `${tokens.primary}10`,
                      },
                    }}
                  >
                    {t("common.tryAgain") || "Try Again"}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{
                      bgcolor: tokens.primary,
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      borderRadius: 2,
                      "&:hover": { bgcolor: tokens.primaryDark },
                    }}
                  >
                    {t("common.backToHome") || "Back to Home"}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          sx={{
            color: tokens.gray500,
            display: "block",
            textAlign: "center",
            mt: 3,
          }}
        >
          <Mail
            sx={{
              fontSize: 16,
              verticalAlign: "middle",
              mr: 0.5,
            }}
          />
          {t("newsletter.unsubscribeInfo") ||
            "If you have questions, please contact support@gadgify.com"}
        </Typography>
      </Container>
    </Box>
  );
};

export default NewsletterUnsubscribePage;
