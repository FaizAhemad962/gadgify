import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Link } from "@/mui/material";
import { ArrowBack, CheckCircle, LockReset } from "@/mui/icons";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import { CustomButton } from "@/components/ui/CustomButton";
import { authApi } from "@/api/auth";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const schema = z
    .object({
      newPassword: z
        .string()
        .min(6, t("errors.passwordMin", "Password must be at least 6 characters")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("errors.passwordMismatch", "Passwords do not match"),
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : t("errors.somethingWrong", "Something went wrong. Please try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title={t("auth.invalidResetLinkTitle", "Invalid Reset Link")}
        subtitle={t(
          "auth.invalidResetLinkSubtitle",
          "This password reset link is invalid or has expired. Request a new one to continue.",
        )}
        maxFormWidth={500}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "center" }}>
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: "28px",
              mx: "auto",
              background: `${tokens.error}12`,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${tokens.error}22`,
            }}
          >
            <LockReset sx={{ ...appIconSx.category, color: tokens.error }} />
          </Box>
          <CustomButton
            variant="contained"
            appVariant="primary"
            onClick={() => navigate("/forgot-password")}
          >
            {t("auth.requestNewLink", "Request New Link")}
          </CustomButton>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={
        success
          ? t("auth.resetPasswordSuccessTitle", "Password Reset")
          : t("auth.resetPasswordTitle", "Reset Password")
      }
      subtitle={
        success
          ? t("auth.resetPasswordSuccessSubtitle", "You can now sign in with your new password.")
          : t("auth.resetPasswordSubtitle", "Choose a new secure password for your Gadgify account.")
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
              "&:hover": { color: tokens.primaryDark },
            }}
          >
            <ArrowBack fontSize="small" />
            {t("auth.backToLogin")}
          </Link>
        </Box>
      }
    >
      {success ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: "28px",
              background: tokens.successLight,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CheckCircle sx={{ ...appIconSx.category, color: tokens.success }} />
          </Box>
          <CustomButton variant="contained" appVariant="primary" onClick={() => navigate("/login")}>
            {t("auth.backToLogin")}
          </CustomButton>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
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
              <LockReset sx={{ ...appIconSx.category, color: tokens.primary }} />
            </Box>
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
            <PasswordField
              fullWidth
              label={t("common.newPassword")}
              autoComplete="new-password"
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <PasswordField
              fullWidth
              label={t("auth.confirmPassword")}
              autoComplete="new-password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
            <CustomButton
              fullWidth
              variant="contained"
              appVariant="primary"
              size="large"
              type="submit"
              isLoading={loading}
              disabled={loading}
              sx={{ py: 1.35 }}
            >
              {t("auth.resetPasswordTitle", "Reset Password")}
            </CustomButton>
          </Box>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
