import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@/mui/material";
import {
  AdminPanelSettings,
  ArrowBack,
  CameraAlt,
  Cancel,
  Edit,
  LocalShipping,
  Logout,
  Person,
  Save,
  Security,
  SupportAgent,
} from "@/mui/icons";
import { useAuth } from "@/context/AuthContext";
import { tokens } from "@/theme/theme";
import { ErrorHandler } from "@/utils/errorHandler";
import { appIconSx } from "@/components/ui/navigationStyles";
import {
  findCityKey,
  getCurrentCityLabel,
  getMaharashtraCities,
} from "@/constants/location";
import { authApi } from "@/api/auth";

const profileInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: `${tokens.radiusMd}px`,
    backgroundColor: tokens.gray50,
    "&.Mui-focused": {
      backgroundColor: tokens.white,
    },
  },
  "& .MuiFilledInput-root": {
    backgroundColor: tokens.gray50,
    borderRadius: `${tokens.radiusMd}px`,
    "&:before, &:after": { display: "none" },
    "&:hover": { backgroundColor: tokens.gray50 },
    "&.Mui-disabled": {
      backgroundColor: tokens.gray50,
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: tokens.gray600,
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: tokens.gray500,
  },
};

const getRoleMeta = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        icon: <Security sx={appIconSx.lg} />,
        color: tokens.error,
        labelKey: "common.profileRoleSuperAdmin",
      };
    case "ADMIN":
      return {
        icon: <AdminPanelSettings sx={appIconSx.lg} />,
        color: tokens.accent,
        labelKey: "common.profileRoleAdmin",
      };
    case "DELIVERY_STAFF":
      return {
        icon: <LocalShipping sx={appIconSx.lg} />,
        color: tokens.info,
        labelKey: "common.profileRoleDeliveryStaff",
      };
    case "SUPPORT_STAFF":
      return {
        icon: <SupportAgent sx={appIconSx.lg} />,
        color: tokens.secondary,
        labelKey: "common.profileRoleSupportStaff",
      };
    default:
      return {
        icon: <Person sx={appIconSx.lg} />,
        color: tokens.primary,
        labelKey: "common.profileRoleUser",
      };
  }
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    state: user?.state || "",
    city: user?.city || "",
    address: user?.address || "",
    pincode: user?.pincode || "",
  });

  if (!user) {
    return (
      <Container
        maxWidth={false}
        sx={{
          maxWidth: tokens.appMaxWidth,
          py: 5,
          px: tokens.pagePaddingX,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const roleMeta = getRoleMeta(user.role);
  const cities = getMaharashtraCities();
  const currentCityLabel = getCurrentCityLabel(formData.city);

  const resetForm = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      state: user.state || "",
      city: user.city || "",
      address: user.address || "",
      pincode: user.pincode || "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (!formData.name.trim()) return setError(t("common.nameRequired"));
      if (!/^\d{10}$/.test(formData.phone)) {
        return setError(t("common.invalidPhone"));
      }
      if (!formData.city.trim()) return setError(t("common.cityRequired"));
      if (!formData.address.trim()) return setError(t("common.addressRequired"));
      if (!/^\d{6}$/.test(formData.pincode)) {
        return setError(t("common.invalidPincode"));
      }

      const cityValue = findCityKey(formData.city) || formData.city;
      const response = await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        city: cityValue,
        address: formData.address,
        pincode: formData.pincode,
      });

      if (response.user) {
        updateUser(response.user);
        setFormData({
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          state: response.user.state,
          city: response.user.city,
          address: response.user.address,
          pincode: response.user.pincode,
        });
      }

      setSuccess(t("common.profileUpdateSuccess"));
      setIsEditing(false);
    } catch (err) {
      const message = ErrorHandler.getUserFriendlyMessage(
        err,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Profile update failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("errors.invalidFileType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("errors.fileTooLarge"));
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setError(null);
      const response = await authApi.uploadProfilePhoto(file);
      if (response.user) updateUser(response.user);
      setSuccess(t("common.profilePhotoUpdated"));
    } catch (err) {
      const message = ErrorHandler.getUserFriendlyMessage(
        err,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Photo upload failed", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: tokens.appMaxWidth,
        py: { xs: 3, md: 5 },
        px: tokens.pagePaddingX,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: tokens.primary, fontWeight: 800, mb: 1 }}
        >
          {t("common.back")}
        </Button>
        <Typography variant="h3" sx={{ fontWeight: 900, color: tokens.gray900 }}>
          {t("common.profileTitle")}
        </Typography>
        <Typography sx={{ mt: 0.75, color: tokens.gray600 }}>
          Manage your profile, delivery details, and account security.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: `${tokens.radiusXl}px`,
          border: `1px solid ${tokens.gray200}`,
          boxShadow: tokens.shadowMd,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            pb: 3,
            mb: 3,
            borderBottom: `1px solid ${tokens.gray200}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    backgroundColor: tokens.accent,
                    color: tokens.white,
                    width: 34,
                    height: 34,
                    border: `2px solid ${tokens.white}`,
                    "&:hover": { backgroundColor: tokens.accentDark },
                  }}
                >
                  {isUploadingPhoto ? (
                    <CircularProgress size={16} sx={{ color: tokens.white }} />
                  ) : (
                    <CameraAlt sx={appIconSx.sm} />
                  )}
                </IconButton>
              }
            >
              <Avatar
                src={user.profilePhoto}
                alt={user.name}
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: "2rem",
                  fontWeight: 900,
                  bgcolor: tokens.primary,
                  border: `3px solid ${tokens.white}`,
                  boxShadow: tokens.shadowMd,
                }}
              >
                {!user.profilePhoto && user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {user.name}
              </Typography>
              <Typography sx={{ color: tokens.gray600 }}>{user.email}</Typography>
              <Chip
                icon={roleMeta.icon}
                label={t(roleMeta.labelKey)}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: roleMeta.color,
                  color: tokens.white,
                  fontWeight: 800,
                  "& .MuiChip-icon": { color: tokens.white },
                }}
              />
            </Box>
          </Box>

          <Button
            variant={isEditing ? "outlined" : "contained"}
            startIcon={isEditing ? <Cancel /> : <Edit />}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            sx={{
              borderRadius: "999px",
              fontWeight: 800,
              bgcolor: isEditing ? "transparent" : tokens.accent,
              "&:hover": {
                bgcolor: isEditing ? `${tokens.error}10` : tokens.accentDark,
              },
            }}
          >
            {isEditing ? t("common.cancel") : t("common.edit")}
          </Button>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
          {t("common.profilePersonalInfo")}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            label={t("auth.name")}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            sx={profileInputSx}
          />
          <TextField
            label={t("auth.email")}
            name="email"
            value={formData.email}
            disabled
            variant="filled"
            helperText={isEditing ? t("common.emailUpdateInfo") : ""}
            sx={profileInputSx}
          />
          <TextField
            label={t("auth.phone")}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            placeholder={t("common.tenDigitNumber")}
            sx={profileInputSx}
          />
          <TextField
            label={t("auth.state")}
            value={t("states.maharashtra")}
            disabled
            variant="filled"
            sx={profileInputSx}
          />
          <TextField
            select
            label={t("auth.city")}
            name="city"
            value={currentCityLabel}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            sx={profileInputSx}
          >
            {cities.map((city) => (
              <MenuItem key={city.key} value={city.label}>
                {city.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t("auth.pincode")}
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            placeholder={t("common.sixDigitCode")}
            sx={profileInputSx}
          />
        </Box>

        <TextField
          fullWidth
          label={t("auth.address")}
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant={isEditing ? "outlined" : "filled"}
          multiline
          rows={3}
          sx={profileInputSx}
        />

        {isEditing && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
              sx={{ borderRadius: "999px", fontWeight: 800 }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                borderRadius: "999px",
                fontWeight: 800,
                bgcolor: tokens.accent,
                "&:hover": { bgcolor: tokens.accentDark },
              }}
            >
              {isLoading ? <CircularProgress size={22} /> : t("common.save")}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {t("common.profileAccountSettings")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: tokens.gray600 }}>
              {t("common.profileAccountCreated")}:{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/change-password")}
              sx={{ borderRadius: "999px", fontWeight: 800 }}
            >
              {t("common.profileChangePassword")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={() => {
                if (window.confirm(t("common.profileConfirmLogout"))) {
                  void logout();
                  navigate("/login");
                }
              }}
              sx={{ borderRadius: "999px", fontWeight: 800 }}
            >
              {t("nav.logout")}
            </Button>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 3, color: tokens.gray500 }}
        >
          {t("common.profileUserID")}: {user.id}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
