import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Paper,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@/mui/material";
import {
  ArrowBack,
  LockReset,
  CheckCircle,
  Cancel,
} from "@/mui/icons";
import { authApi } from "../api/auth";
import { ErrorHandler } from "../utils/errorHandler";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";
import PasswordField from "@/components/auth/PasswordField";
import { CustomButton } from "@/components/ui/CustomButton";

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "error";
    if (passwordStrength < 70) return "warning";
    return "success";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return t("common.passwordWeak");
    if (passwordStrength < 70) return t("common.passwordMedium");
    return t("common.passwordStrong");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.currentPassword) {
        setError(t("errors.required"));
        return;
      }

      if (!formData.newPassword) {
        setError(t("errors.required"));
        return;
      }

      if (formData.newPassword.length < 6) {
        setError(t("common.minSixCharacters"));
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError(t("errors.passwordMismatch"));
        return;
      }

      // Make API call to change password
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(t("common.passwordChangeSuccess"));
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err: unknown) {
      const message = ErrorHandler.getUserFriendlyMessage(
        err,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Change password failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tokens.gray50} 0%, ${tokens.white} 45%, ${tokens.primary}14 100%)`,
        py: { xs: 3, md: 6 },
        px: tokens.pagePaddingX,
      }}
    >
      <Container maxWidth="sm">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <CustomButton
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          appVariant="secondary"
          variant="outlined"
        >
          {t("common.back")}
        </CustomButton>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 3,
            background: tokens.errorLight,
            color: tokens.error,
            border: `1px solid ${tokens.error}`,
            borderRadius: 2,
            "& .MuiAlert-icon": { color: tokens.error },
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{
            mb: 3,
            background: tokens.successLight,
            color: tokens.success,
            border: `1px solid ${tokens.success}`,
            borderRadius: 2,
            "& .MuiAlert-icon": { color: tokens.success },
          }}
        >
          {success}
        </Alert>
      )}

      {/* Change Password Form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: `${tokens.radiusXl}px`,
          border: `1px solid ${tokens.gray200}`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98))",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.10)",
          overflow: "hidden",
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            pb: 3,
            mx: { xs: -2.5, sm: -4 },
            mt: { xs: -2.5, sm: -4 },
            px: { xs: 2.5, sm: 4 },
            pt: { xs: 3, sm: 4 },
            borderBottom: `1px solid ${tokens.gray200}`,
            background: `linear-gradient(135deg, ${tokens.primary}0F, ${tokens.accent}12)`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "26px",
              background: tokens.primary,
              display: "grid",
              placeItems: "center",
              mb: 2,
              boxShadow: "0 18px 38px rgba(27, 42, 74, 0.24)",
            }}
          >
            <LockReset sx={{ ...appIconSx.feature, color: tokens.white }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight="700"
            color={tokens.gray900}
            sx={{ mb: 1 }}
          >
            {t("common.profileChangePassword")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: tokens.gray500 }}
            textAlign="center"
          >
            {t("common.passwordChangeInfo")}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Current Password */}
            <PasswordField
              fullWidth
              label={t("common.currentPassword")}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              variant="outlined"
              autoComplete="current-password"
            />

            {/* New Password */}
            <Box>
              <PasswordField
                fullWidth
                label={t("common.newPassword")}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: tokens.gray500 }}
                    >
                      {t("common.passwordStrength")}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight="600"
                      sx={{
                        color:
                          passwordStrength < 40
                            ? tokens.error
                            : passwordStrength < 70
                              ? tokens.warning
                              : tokens.success,
                      }}
                    >
                      {getPasswordStrengthLabel()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={getPasswordStrengthColor()}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: tokens.gray200,
                    }}
                  />
                </Box>
              )}

              {/* Password Requirements */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: tokens.gray50,
                  borderRadius: 2,
                  border: `1px solid ${tokens.gray200}`,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="600"
                  sx={{ color: tokens.gray600, mb: 1, display: "block" }}
                >
                  {t("common.passwordRequirements")}
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {formData.newPassword.length >= 6 ? (
                        <CheckCircle
                          sx={{ ...appIconSx.md, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ ...appIconSx.md, color: tokens.gray300 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t("common.minSixCharacters")}
                      primaryTypographyProps={{
                        variant: "caption",
                        sx: { color: tokens.gray500 },
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {/[A-Z]/.test(formData.newPassword) ? (
                        <CheckCircle
                          sx={{ ...appIconSx.md, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ ...appIconSx.md, color: tokens.gray300 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t("common.oneUppercase")}
                      primaryTypographyProps={{
                        variant: "caption",
                        sx: { color: tokens.gray500 },
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {/[0-9]/.test(formData.newPassword) ? (
                        <CheckCircle
                          sx={{ ...appIconSx.md, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ ...appIconSx.md, color: tokens.gray300 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t("common.oneNumber")}
                      primaryTypographyProps={{
                        variant: "caption",
                        sx: { color: tokens.gray500 },
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>

            {/* Confirm Password */}
            <PasswordField
              fullWidth
              label={t("auth.confirmPassword")}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              variant="outlined"
              error={
                formData.confirmPassword !== "" &&
                formData.newPassword !== formData.confirmPassword
              }
              helperText={
                formData.confirmPassword !== "" &&
                formData.newPassword !== formData.confirmPassword
                  ? t("errors.passwordMismatch")
                  : ""
              }
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <CustomButton
              type="submit"
              variant="contained"
              appVariant="admin"
              size="large"
              isLoading={isLoading}
              disabled={isLoading}
              sx={{ mt: 2, py: 1.35 }}
            >
              {t("common.profileChangePassword")}
            </CustomButton>
          </Box>
        </form>
      </Paper>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
