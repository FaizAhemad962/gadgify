import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
  LockReset,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { authApi } from "../api/auth";
import { ErrorHandler } from "../utils/errorHandler";
import { tokens } from "@/theme/theme";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: tokens.gray50,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: tokens.gray100,
    },
    "&.Mui-focused": {
      backgroundColor: tokens.white,
      boxShadow: `0 0 0 3px ${tokens.primary}1A`,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.gray200,
  },
};

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    } catch (err: any) {
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: tokens.primary, textTransform: "none", fontWeight: 600 }}
        >
          {t("common.back")}
        </Button>
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
          p: 4,
          borderRadius: 3,
          border: `1px solid ${tokens.gray200}`,
          background: tokens.white,
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
            borderBottom: `2px solid ${tokens.gray100}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${tokens.accent}1A`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockReset sx={{ fontSize: 40, color: tokens.accent }} />
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
            <TextField
              fullWidth
              label={t("common.currentPassword")}
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              variant="outlined"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showCurrentPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            {/* New Password */}
            <Box>
              <TextField
                fullWidth
                label={t("common.newPassword")}
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
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
                          sx={{ fontSize: 18, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ fontSize: 18, color: tokens.gray300 }} />
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
                          sx={{ fontSize: 18, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ fontSize: 18, color: tokens.gray300 }} />
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
                          sx={{ fontSize: 18, color: tokens.success }}
                        />
                      ) : (
                        <Cancel sx={{ fontSize: 18, color: tokens.gray300 }} />
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
            <TextField
              fullWidth
              label={t("auth.confirmPassword")}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
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
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
                background: tokens.accent,
                color: tokens.white,
                fontWeight: 700,
                py: 1.5,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: tokens.accentDark,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 16px ${tokens.accent}4D`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.Mui-disabled": {
                  background: tokens.gray300,
                  color: tokens.gray500,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t("common.profileChangePassword")
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;
