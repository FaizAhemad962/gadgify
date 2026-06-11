import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type AxiosError } from "axios";

import { Alert, Box, Link, TextField, Typography } from "@/mui/material";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import { authInputSx } from "@/components/auth/authStyles";
import { CustomButton } from "@/components/ui/CustomButton";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { ErrorHandler } from "@/utils/errorHandler";
import { tokens } from "@/theme/theme";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");

  const loginSchema = z.object({
    email: z.string().email(t("errors.invalidEmail")),
    password: z.string().min(6, t("errors.passwordTooShort")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setError("");
      login(data.user);
      navigate("/", { replace: true });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = ErrorHandler.getUserFriendlyMessage(
        error,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Login failed", error);
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <AuthLayout
      title={t("auth.login")}
      subtitle={t("app.subtitle")}
      footer={
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: tokens.gray500 }}>
            {t("auth.dontHaveAccount")}
          </Typography>
          <Link
            component={RouterLink}
            to="/signup"
            sx={{
              display: "inline-flex",
              mt: 1,
              color: tokens.accent,
              textDecoration: "none",
              fontWeight: 800,
              "&:hover": {
                color: tokens.accentDark,
                textDecoration: "underline",
              },
            }}
          >
            {t("auth.signup")}
          </Link>
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
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

        <TextField
          fullWidth
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={authInputSx}
        />

        <PasswordField
          fullWidth
          label={t("auth.password")}
          autoComplete="current-password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: -0.5,
          }}
        >
          <Link
            component="button"
            type="button"
            sx={{
              textDecoration: "none",
              color: tokens.primary,
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": { color: tokens.accent },
            }}
            onClick={() => navigate("/forgot-password")}
          >
            {t("auth.forgotPassword")}
          </Link>
        </Box>

        <CustomButton
          fullWidth
          variant="contained"
          appVariant="admin"
          size="large"
          type="submit"
          isLoading={loginMutation.isPending}
          disabled={loginMutation.isPending}
          sx={{ mt: 1, py: 1.35 }}
        >
          {loginMutation.isPending ? `${t("common.loggingIn")}...` : t("auth.loginButton")}
        </CustomButton>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
