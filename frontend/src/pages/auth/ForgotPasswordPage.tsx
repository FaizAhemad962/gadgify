import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import { ArrowBack, Email } from "@mui/icons-material";
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

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
    try {
      await authApi.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch {
      setError(t("errors.somethingWrong"));
    }
  };

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
          {submitted ? (
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
                <Email sx={{ fontSize: 36, color: tokens.success }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={tokens.gray900}>
                Check your email
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: tokens.gray500, maxWidth: 360 }}
              >
                If an account exists for <strong>{getValues("email")}</strong>,
                you will receive a password reset link shortly.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  mt: 2,
                  background: tokens.accent,
                  color: tokens.white,
                  fontWeight: 700,
                  "&:hover": {
                    background: tokens.accentDark,
                  },
                }}
              >
                Back to Login
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
                  <Email sx={{ fontSize: 36, color: tokens.accent }} />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={tokens.gray900}
                >
                  Forgot Password?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: tokens.gray500, mt: 1, textAlign: "center" }}
                >
                  Enter your email address and we'll send you a link to reset
                  your password.
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
                    label={t("auth.email")}
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={inputSx}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
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
                    Send Reset Link
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

export default ForgotPasswordPage;
