import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Link,
  MenuItem,
  TextField,
  Typography,
} from "@/mui/material";

import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import { authInputSx } from "@/components/auth/authStyles";
import { CustomButton } from "@/components/ui/CustomButton";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { getMaharashtraCities } from "@/constants/location";
import { ErrorHandler } from "@/utils/errorHandler";
import { tokens } from "@/theme/theme";

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");

  const signupSchema = z
    .object({
      email: z.string().email(t("errors.invalidEmail")),
      password: z.string().min(6, t("errors.passwordTooShort")),
      confirmPassword: z.string(),
      name: z.string().min(2, t("common.nameRequired")),
      phone: z.string().min(10, t("common.invalidPhone")),
      state: z.string().min(2, t("common.stateRequired")),
      city: z.string().min(2, t("common.cityRequired")),
      address: z.string().min(5, t("common.addressRequired")),
      pincode: z.string().regex(/^\d{6}$/, t("common.invalidPincode")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.passwordMismatch", "Passwords do not match"),
      path: ["confirmPassword"],
    });

  type SignupFormData = z.infer<typeof signupSchema>;

  const MAHARASHTRA_CITIES = getMaharashtraCities();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      state: t("states.maharashtra"),
      city: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      login(data.user);
      navigate("/");
    },
    onError: (error: Error | unknown) => {
      const message = ErrorHandler.getUserFriendlyMessage(
        error,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Signup failed", error);
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (data.state.toLowerCase() !== "maharashtra") {
      setError(t("errors.maharashtraOnly"));
      return;
    }

    setError("");
    const { confirmPassword, ...signupData } = data;
    void confirmPassword;

    try {
      await signupMutation.mutateAsync(signupData);
    } catch {
      // Error is handled in the mutation callback.
    }
  };

  return (
    <AuthLayout
      title={t("auth.signup")}
      subtitle={t("common.availableOnly")}
      maxFormWidth={720}
      footer={
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: tokens.gray500 }}>
            {t("auth.alreadyHaveAccount")}
          </Typography>
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              display: "inline-flex",
              mt: 1,
              color: tokens.primary,
              textDecoration: "none",
              fontWeight: 800,
              "&:hover": {
                color: tokens.primaryDark,
                textDecoration: "underline",
              },
            }}
          >
            {t("auth.login")}
          </Link>
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(onSubmit)(event);
        }}
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
          label={t("auth.name")}
          placeholder={t("common.enterFullName")}
          autoComplete="name"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={authInputSx}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label={t("auth.email")}
            type="email"
            placeholder={t("common.emailPlaceholder")}
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={authInputSx}
          />

          <TextField
            fullWidth
            label={t("auth.phone")}
            placeholder={t("common.tenDigitNumber")}
            autoComplete="tel"
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={authInputSx}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <PasswordField
            fullWidth
            label={t("auth.password")}
            placeholder={t("common.minSixCharacters")}
            autoComplete="new-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <PasswordField
            fullWidth
            label={t("auth.confirmPassword")}
            placeholder={t("common.reEnterPassword")}
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={2}
          label={t("auth.address")}
          placeholder={t("common.streetAddress")}
          autoComplete="street-address"
          {...register("address")}
          error={!!errors.address}
          helperText={errors.address?.message}
          sx={authInputSx}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label={t("auth.state")}
            {...register("state")}
            error={!!errors.state}
            helperText={errors.state?.message || t("common.mustBeMaharashtra")}
            InputProps={{ readOnly: true }}
            sx={{
              ...authInputSx,
              "& .MuiOutlinedInput-root": {
                ...authInputSx["& .MuiOutlinedInput-root"],
                backgroundColor: tokens.gray100,
              },
            }}
          />

          <TextField
            fullWidth
            select
            label={t("auth.city")}
            {...register("city")}
            error={!!errors.city}
            helperText={errors.city?.message}
            SelectProps={{ displayEmpty: true }}
            sx={authInputSx}
          >
            <MenuItem value="" disabled>
              {t("common.selectCity")}
            </MenuItem>
            {MAHARASHTRA_CITIES.map((city) => (
              <MenuItem key={city.key} value={city.label}>
                {city.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label={t("auth.pincode")}
            placeholder={t("common.sixDigitCode")}
            autoComplete="postal-code"
            {...register("pincode")}
            error={!!errors.pincode}
            helperText={errors.pincode?.message}
            sx={authInputSx}
          />
        </Box>

        <CustomButton
          fullWidth
          variant="contained"
          appVariant="success"
          size="large"
          type="submit"
          isLoading={signupMutation.isPending}
          disabled={signupMutation.isPending}
          sx={{ mt: 1, py: 1.35 }}
        >
          {signupMutation.isPending
            ? `${t("common.creatingAccount")}...`
            : t("auth.signupButton")}
        </CustomButton>
      </Box>
    </AuthLayout>
  );
};

export default SignupPage;
