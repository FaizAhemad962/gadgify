import { useState } from "react";
import {
  useNavigate,
  Link as RouterLink,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  LockReset,
  CheckCircle,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { tokens } from "@/theme/theme";
import { authApi } from "@/api/auth";

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

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const schema = z
    .object({
      newPassword: z
        .string()
        .min(
          6,
          t("errors.passwordMin", "Password must be at least 6 characters"),
        ),
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
          : t(
              "errors.somethingWrong",
              "Something went wrong. Please try again.",
            );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Invalid / missing token state
  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              background: tokens.white,
              border: `1px solid ${tokens.gray200}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              color={tokens.gray900}
              mb={2}
            >
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.gray500, mb: 3 }}>
              This password reset link is invalid or has expired. Please request
              a new one.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/forgot-password")}
              sx={{
                background: tokens.accent,
                color: tokens.white,
                fontWeight: 700,
                "&:hover": { background: tokens.accentDark },
              }}
            >
              Request New Link
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          top: "-100px",
          right: "-100px",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          bottom: "-50px",
          left: "-50px",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: tokens.white,
            border: `1px solid ${tokens.gray200}`,
          }}
        >
          {success ? (
            /* ── Success state ── */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
                py: 3,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: tokens.successLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle sx={{ fontSize: 36, color: tokens.success }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={tokens.gray900}>
                Password Reset!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: tokens.gray500, maxWidth: 360 }}
              >
                Your password has been reset successfully. You can now log in
                with your new password.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  mt: 2,
                  background: tokens.accent,
                  color: tokens.white,
                  fontWeight: 700,
                  "&:hover": { background: tokens.accentDark },
                }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            /* ── Form state ── */
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: `${tokens.accent}1A`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <LockReset sx={{ fontSize: 36, color: tokens.accent }} />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={tokens.gray900}
                >
                  Reset Password
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: tokens.gray500, mt: 1, textAlign: "center" }}
                >
                  Enter your new password below.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: tokens.errorLight,
                    color: tokens.error,
                    border: `1px solid ${tokens.error}`,
                    borderRadius: 2,
                    "& .MuiAlert-icon": { color: tokens.error },
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    {...register("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    sx={inputSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((p) => !p)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={inputSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirm((p) => !p)}
                              edge="end"
                              size="small"
                            >
                              {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
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
                      "&:active": { transform: "translateY(0)" },
                    }}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </Box>
              </form>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: tokens.gray500,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    transition: "color 0.2s",
                    "&:hover": { color: tokens.primary },
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Back to Login
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
