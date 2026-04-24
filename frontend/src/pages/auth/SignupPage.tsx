import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
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
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { ErrorHandler } from "../../utils/errorHandler";
import { getMaharashtraCities } from "../../constants/location";
import LanguageSelector from "../../components/common/LanguageSelector";
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

const SignupPage = () => {
  const { t } = useTranslation();

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
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  type SignupFormData = z.infer<typeof signupSchema>;

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const MAHARASHTRA_CITIES = getMaharashtraCities();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

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
  if (isAuthenticated) {
    navigate("/");
  }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signupData } = data;
    try {
      await signupMutation.mutateAsync(signupData);
    } catch {
      // Error is handled in onError callback
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: tokens.white,
            backdropFilter: "blur(10px)",
            border: `1px solid ${tokens.gray200}`,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: tokens.primary,
                mb: 1,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              🛍️
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: tokens.gray900,
                mb: 1,
              }}
            >
              {t("auth.signup")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: tokens.gray500,
                fontSize: "0.95rem",
              }}
            >
              {t("common.availableOnly")}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Name */}
              <TextField
                fullWidth
                label={t("auth.name")}
                size="small"
                placeholder={t("common.enterFullName")}
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={inputSx}
              />

              {/* Email & Phone */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  label={t("auth.email")}
                  type="email"
                  size="small"
                  placeholder={t("common.emailPlaceholder")}
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label={t("auth.phone")}
                  size="small"
                  placeholder={t("common.tenDigitNumber")}
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  sx={inputSx}
                />
              </Box>

              {/* Password & Confirm Password */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  label={t("auth.password")}
                  type={showPassword ? "text" : "password"}
                  size="small"
                  placeholder={t("common.minSixCharacters")}
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
                            color: tokens.gray500,
                            "&:hover": { color: tokens.primary },
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
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label={t("auth.confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  size="small"
                  placeholder={t("common.reEnterPassword")}
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          size="small"
                          sx={{
                            color: tokens.gray500,
                            "&:hover": { color: tokens.primary },
                          }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>

              {/* Address */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t("auth.address")}
                size="small"
                placeholder={t("common.streetAddress")}
                {...register("address")}
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={inputSx}
              />

              {/* State, City, Pincode */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  label={t("auth.state")}
                  size="small"
                  {...register("state")}
                  error={!!errors.state}
                  helperText={
                    errors.state?.message || t("common.mustBeMaharashtra")
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: tokens.gray100,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: tokens.gray200,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  select
                  label={t("auth.city")}
                  size="small"
                  {...register("city")}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  sx={inputSx}
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
                  size="small"
                  placeholder={t("common.sixDigitCode")}
                  {...register("pincode")}
                  error={!!errors.pincode}
                  helperText={errors.pincode?.message}
                  sx={inputSx}
                />
              </Box>

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={signupMutation.isPending}
                sx={{
                  background: tokens.accent,
                  color: tokens.white,
                  fontWeight: 700,
                  fontSize: "1rem",
                  py: 1.5,
                  mt: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: tokens.accentDark,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 16px ${tokens.accent}4D`,
                  },
                  "&:active": { transform: "translateY(0)" },
                  "&.Mui-disabled": {
                    background: tokens.gray300,
                    color: tokens.gray600,
                  },
                }}
              >
                {signupMutation.isPending ? (
                  <Typography variant="body2" component="span">
                    {t("common.creatingAccount")}...
                  </Typography>
                ) : (
                  t("auth.signupButton")
                )}
              </Button>
            </Box>

            {/* Divider */}
            <Box sx={{ my: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{ flex: 1, height: "1px", background: tokens.gray200 }}
              />
              <Typography variant="caption" sx={{ color: tokens.gray400 }}>
                {t("common.or")}
              </Typography>
              <Box
                sx={{ flex: 1, height: "1px", background: tokens.gray200 }}
              />
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: tokens.gray500, mb: 1 }}>
                {t("auth.alreadyHaveAccount")}
              </Typography>
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: tokens.accent,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: tokens.accentDark,
                    textDecoration: "underline",
                  },
                }}
              >
                {t("auth.login")} →
              </Link>
            </Box>
          </form>

          {/* Trust Section */}
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${tokens.gray200}`,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>📍</Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.gray500, fontSize: "0.75rem" }}
              >
                {t("common.maharashtra")}
              </Typography>
            </Box>
            <Box
              sx={{ width: "1px", height: "30px", background: tokens.gray200 }}
            />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>🔒</Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.gray500, fontSize: "0.75rem" }}
              >
                {t("common.secure")}
              </Typography>
            </Box>
            <Box
              sx={{ width: "1px", height: "30px", background: tokens.gray200 }}
            />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>✓</Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.gray500, fontSize: "0.75rem" }}
              >
                {t("common.verified")}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ pt: 3 }}>
            <LanguageSelector color={tokens.primary} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
