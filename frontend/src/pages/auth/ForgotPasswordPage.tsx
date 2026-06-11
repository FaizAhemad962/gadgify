import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Link, TextField, Typography } from "@/mui/material";
import { ArrowBack, Email } from "@/mui/icons";
import AuthLayout from "@/components/auth/AuthLayout";
import { authInputSx } from "@/components/auth/authStyles";
import { CustomButton } from "@/components/ui/CustomButton";
import { authApi } from "@/api/auth";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    email: z.string().email(t("errors.invalidEmail")),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch {
      setError(t("errors.somethingWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        submitted
          ? t("auth.forgotPasswordSuccessTitle")
          : t("auth.forgotPasswordTitle")
      }
      subtitle={
        submitted
          ? t("auth.forgotPasswordSuccessSubtitle")
          : t("auth.forgotPasswordSubtitle")
      }
      maxFormWidth={500}
      footer={
        <Box sx={{ textAlign: "center" }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: tokens.primary,
              textDecoration: "none",
              fontWeight: 800,
              "&:hover": { color: tokens.accent },
            }}
          >
            <ArrowBack fontSize="small" />
            {t("auth.backToLogin")}
          </Link>
        </Box>
      }
    >
      {submitted ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: "24px",
              background: tokens.successLight,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Email sx={{ ...appIconSx.category, color: tokens.success }} />
          </Box>
          <Typography variant="body2" sx={{ color: tokens.gray600, maxWidth: 380 }}>
            {t("auth.forgotPasswordSuccessMessage", {
              email: getValues("email"),
            })}
          </Typography>
          <CustomButton
            variant="contained"
            appVariant="admin"
            onClick={() => navigate("/login")}
            sx={{ mt: 1 }}
          >
            {t("auth.backToLogin")}
          </CustomButton>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: "28px",
                background: `linear-gradient(135deg, ${tokens.primary}14, ${tokens.accent}18)`,
                border: `1px solid ${tokens.gray200}`,
                boxShadow: "0 18px 44px rgba(27, 42, 74, 0.10)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Email sx={{ ...appIconSx.category, color: tokens.primary }} />
            </Box>
          </Box>

          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: `${tokens.radiusLg}px`,
              bgcolor: `${tokens.primary}08`,
              border: `1px solid ${tokens.gray200}`,
              color: tokens.gray700,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t("auth.forgotPasswordSubtitle")}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: tokens.errorLight,
                color: tokens.error,
                border: `1px solid ${tokens.error}33`,
                borderRadius: `${tokens.radiusMd}px`,
                "& .MuiAlert-icon": { color: tokens.error },
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              fullWidth
              label={t("auth.email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={authInputSx}
            />

            <CustomButton
              fullWidth
              variant="contained"
              appVariant="admin"
              size="large"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              sx={{ py: 1.35 }}
            >
              {t("auth.sendResetLink")}
            </CustomButton>
          </Box>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
