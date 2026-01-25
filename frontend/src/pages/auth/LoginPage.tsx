import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type AxiosError } from "axios";
import BrandIcon from "../../assets/brand-icon.png";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Language, Visibility, VisibilityOff } from "@mui/icons-material";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { ErrorHandler } from "../../utils/errorHandler";
import LanguageSelector from "../../components/common/LanguageSelector";
import { theme } from "@/theme/theme";

const LoginPage = () => {
  const { t } = useTranslation();
  const loginSchema = z.object({
    email: z.string().email(t("errors.invalidEmail")),
    password: z.string().min(6, t("errors.passwordTooShort")),
  });
  type LoginFormData = z.infer<typeof loginSchema>;
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  if (isAuthenticated) {
    navigate("/");
  }

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setError("");
      login(data.token, data.user);
      navigate("/");
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
      // Error is handled by mutation error callback
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
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
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            background: "#ffffff",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ textAlign: "center" }}>
                <IconButton disableRipple onClick={() => navigate("/")}>
                  <img alt="gadgify" height={130} width={120} src={BrandIcon} />
                </IconButton>{" "}
                <Typography
                  sx={{
                    color: "#707070",
                  }}
                >
                  {t("app.subtitle")}
                </Typography>
              </Box>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    background: "#ffebee",
                    color: "#c62828",
                    border: "1px solid #ef5350",
                    borderRadius: 1,
                    "& .MuiAlert-icon": {
                      color: "#c62828",
                    },
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
                size="small"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9f9f9",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      borderColor: "#1976d2",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#ffffff",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                }}
              />
              <TextField
                fullWidth
                label={t("auth.password")}
                type={showPassword ? "text" : "password"}
                size="small"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: "#707070",
                          "&:hover": {
                            color: "#1976d2",
                          },
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9f9f9",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      borderColor: "#1976d2",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#ffffff",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loginMutation.isPending}
                sx={{
                  background: "#ff9800",
                  color: "#ffffff",
                  fontWeight: 700,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: "#f57c00",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px rgba(255, 152, 0, 0.3)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&.Mui-disabled": {
                    background: "#ccc",
                    color: "#666",
                  },
                }}
              >
                {loginMutation.isPending ? (
                  <>
                    <Typography variant="body2" component="span">
                      {t("common.loggingIn")}...
                    </Typography>
                  </>
                ) : (
                  `🔓 ${t("auth.loginButton")}`
                )}
              </Button>
              <Link
                textTransform={"capitalize"}
                sx={{ textDecoration: "none" }}
                color="error"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </Link>
            </Box>

            <Box sx={{ my: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
              <Typography variant="caption" sx={{ color: "#a0a0a0" }}>
                {t("common.or").toLocaleUpperCase()}
              </Typography>
              <Box sx={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
            </Box>

            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "#707070", mb: 1 }}>
                {t("auth.dontHaveAccount")} click
              </Typography>

              <Typography variant="body2" sx={{ color: "#707070", mb: 1 }}>
                <Link
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    color: "#ff9800",
                    textDecoration: "none",
                    fontWeight: 700,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#f57c00",
                      textDecoration: "underline",
                    },
                  }}
                >
                  here
                </Link>
              </Typography>

              <Typography variant="body2" sx={{ color: "#707070", mb: 1 }}>
                to sign up.
              </Typography>
            </Box>
          </form>

          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>🔒</Typography>
              <Typography
                variant="caption"
                sx={{ color: "#707070", fontSize: "0.75rem" }}
              >
                {t("common.secure")}
              </Typography>
            </Box>
            <Box sx={{ width: "1px", height: "30px", background: "#e0e0e0" }} />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>✓</Typography>
              <Typography
                variant="caption"
                sx={{ color: "#707070", fontSize: "0.75rem" }}
              >
                {t("common.verified")}
              </Typography>
            </Box>
            <Box sx={{ width: "1px", height: "30px", background: "#e0e0e0" }} />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>🛡️</Typography>
              <Typography
                variant="caption"
                sx={{ color: "#707070", fontSize: "0.75rem" }}
              >
                {t("common.protected")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ pt: 3, display: "flex", alignItems: "center" }}>
            <LanguageSelector color={theme.palette.primary.main} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
