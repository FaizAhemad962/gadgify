import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button,
  Badge,
  Stack,
  Avatar,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";

import BrandIcon from "../../assets/brand-icon.png";

import {
  Menu as MenuIcon,
  ShoppingCart,
  Favorite,
  Home,
  ShoppingBagSharp,
  ShoppingBag,
  Settings,
  Dashboard,
  Person,
  Logout,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import LanguageSelector from "../common/LanguageSelector";
import { AppDrawer } from "../ui/Drawer";
import { tokens } from "@/theme/theme";
import {
  getRoleIcon,
  getRoleLabel,
  getRoleColor,
} from "../../utils/roleHelper";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    handleNavClick("/login");
  };

  const handleNavClick = (to: string) => {
    window.scrollTo(0, 0);
    navigate(to);
  };

  // Unified navigation items
  const navItems = [
    { id: "home", label: t("nav.home"), to: "/", icon: <Home /> },
    {
      id: "products",
      label: t("nav.products"),
      to: "/products",
      icon: <ShoppingBag />,
    },
    ...(isAuthenticated
      ? [
          {
            id: "orders",
            label: t("nav.orders"),
            to: "/orders",
            icon: <ShoppingBagSharp />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "adminDashboard",
            label: t("nav.adminDashboard", "Dashboard"),
            to: "/admin",
            icon: <Dashboard />,
          },
          {
            id: "adminProducts",
            label: t("nav.adminProducts", "Products"),
            to: "/admin/products",
            icon: <Settings />,
          },
          {
            id: "adminOrders",
            label: t("nav.adminOrders", "Orders"),
            to: "/admin/orders",
            icon: <Settings />,
          },
          {
            id: "adminCoupons",
            label: t("nav.adminCoupons", "Coupons"),
            to: "/admin/coupons",
            icon: <Settings />,
          },
          {
            id: "adminCategories",
            label: t("nav.adminCategories", "Categories"),
            to: "/admin/categories",
            icon: <Settings />,
          },
          {
            id: "adminUsers",
            label: t("nav.adminUsers", "Users"),
            to: "/admin/users",
            icon: <Settings />,
          },
        ]
      : []),
  ];

  // Common button styles for nav links
  const navBtnSx = {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 500,
    fontSize: "0.875rem",
    borderRadius: 2,
    px: 1.5,
    py: 1,
    transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.1)",
      color: "#fff",
    },
  };

  const adminBtnSx = {
    ...navBtnSx,
    color: tokens.accent,
    bgcolor: "rgba(255,255,255,0.95)",
    fontWeight: 600,
    "&:hover": {
      bgcolor: "#fff",
      color: tokens.accentDark,
    },
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: tokens.primary,
        color: "#fff",
        zIndex: 1100,
      }}
    >
      <Container
        maxWidth={false}
        sx={{ px: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, md: 64 },
            gap: 3,
            display: "flex",
            alignItems: "center",
            // justifyContent: "space-between",
          }}
        >
          {/* ── Brand ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: { xs: 0, md: 3 },
              cursor: "pointer",
            }}
            onClick={() => handleNavClick("/")}
          >
            <img
              alt="Gadgify"
              height={40}
              width={40}
              src={BrandIcon}
              className={styles.navbarImg}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "#fff",
                letterSpacing: "-0.02em",
                display: { xs: "none", sm: "block" },
              }}
            >
              Gadgify
            </Typography>
          </Box>

          {/* ── Search Bar ── */}
          {/* <Box sx={{ display: { xs: "none", md: "flex" }, mx: 2 }}>
            <SearchAutocomplete />
          </Box> */}

          {/* ── Mobile menu ── */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <AppDrawer
              items={navItems.map((item) => ({
                ...item,
                onClick: () => handleNavClick(item.to),
              }))}
              trigger={
                <IconButton size="small" aria-label="Open navigation menu">
                  <MenuIcon sx={{ fontSize: "1.5rem", color: "white" }} />
                </IconButton>
              }
            />
          </Box>

          {/* ── Desktop nav links ── */}
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 0.5 }}
          >
            {navItems
              .filter((item) => !item.id.startsWith("admin"))
              .map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleNavClick(item.to)}
                  aria-label={item.label}
                  startIcon={item.icon}
                  sx={navBtnSx}
                >
                  {item.label}
                </Button>
              ))}

            {/* Admin links with visual distinction */}
            {isAdmin && (
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  ml: 1.5,
                  pl: 1.5,
                  borderLeft: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {navItems
                  .filter((item) => item.id.startsWith("admin"))
                  .map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => handleNavClick(item.to)}
                      aria-label={item.label}
                      startIcon={item.icon}
                      size="small"
                      sx={adminBtnSx}
                    >
                      {item.label}
                    </Button>
                  ))}
              </Box>
            )}
          </Box>

          {/* ── Right actions ── */}
          <Stack direction="row" alignItems="center" gap={0.5}>
            {/* Language selector — desktop only */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <LanguageSelector color="#fff" bgcolor={tokens.primary} />
            </Box>

            {/* Dark mode toggle */}
            {/* <IconButton
              size="small"
              onClick={toggleTheme}
              color="inherit"
              aria-label="Toggle dark mode"
              sx={{ ml: 0.5 }}
            >
              {mode === "dark" ? (
                <LightMode sx={{ fontSize: 20 }} />
              ) : (
                <DarkMode sx={{ fontSize: 20 }} />
              )}
            </IconButton> */}

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <IconButton
                  size="small"
                  onClick={() => handleNavClick("/wishlist")}
                  color="inherit"
                  aria-label="Wishlist"
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  <Badge badgeContent={wishlistItems.length} color="error">
                    <Favorite sx={{ fontSize: "1.35rem" }} />
                  </Badge>
                </IconButton>

                {/* Cart */}
                <IconButton
                  size="small"
                  onClick={() => handleNavClick("/cart")}
                  color="inherit"
                  aria-label="Shopping cart"
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  <Badge badgeContent={itemCount} color="error">
                    <ShoppingCart sx={{ fontSize: "1.35rem" }} />
                  </Badge>
                </IconButton>

                {/* User avatar / menu trigger */}
                <IconButton
                  size="small"
                  onClick={handleOpenUserMenu}
                  aria-label="Account menu"
                  sx={{
                    ml: 0.5,
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: tokens.accent,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>

                {/* User dropdown menu */}
                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                        mt: 1,
                        minWidth: 200,
                        border: `1px solid ${tokens.gray200}`,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${tokens.gray200}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="text.primary"
                    >
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email || ""}
                    </Typography>
                    {user?.role && (
                      <Stack direction="row" gap={0.5} sx={{ mt: 0.75 }}>
                        <Chip
                          label={`${getRoleIcon(user.role)} ${getRoleLabel(user.role)}`}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleNavClick("/profile");
                    }}
                    sx={{ py: 1.25 }}
                  >
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("nav.profile")}</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.25, color: tokens.error }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" sx={{ color: tokens.error }} />
                    </ListItemIcon>
                    <ListItemText>{t("nav.logout")}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* ── Logged-out CTA buttons ── */
              <Stack direction="row" gap={1} sx={{ ml: 1 }}>
                <Button
                  onClick={() => navigate("/login")}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    },
                  }}
                >
                  {t("nav.login")}
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  size="small"
                  variant="contained"
                  sx={{
                    bgcolor: tokens.accent,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    borderRadius: 2,
                    px: 2.5,
                    "&:hover": {
                      bgcolor: tokens.accentDark,
                      boxShadow: "0 4px 14px rgba(255,107,44,0.35)",
                    },
                  }}
                >
                  {t("nav.signup")}
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
