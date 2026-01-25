import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  useMediaQuery,
  Stack,
} from "@mui/material";

import BrandIcon from "../../assets/brand-icon.png";

import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  Favorite,
  Home,
  ShoppingBagSharp,
  ShoppingBag,
  Settings,
  ExitToApp,
  Language,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import LanguageSelector from "../common/LanguageSelector";
import { theme } from "@/theme/theme";
import { AppDrawer, type DrawerItem } from "../ui/Drawer";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  // check width using mui breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorElNav] = useState<null | HTMLElement>(null);
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
    navigate("/login");
  };

  const drawerItems: DrawerItem[] = [
    {
      id: "home",
      label: t("nav.home"),
      icon: (
        <IconButton>
          <Home />
        </IconButton>
      ),
      position: "center",
      onClick: () => navigate("/"),
    } satisfies DrawerItem,

    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Dashboard",
            icon: (
              <IconButton>
                <Settings />
              </IconButton>
            ),
            position: "center",
            onClick: () => navigate("/admin"),
          } satisfies DrawerItem,
        ]
      : []),

    {
      id: "products",
      label: t("nav.products"),
      icon: (
        <IconButton>
          <ShoppingBag />
        </IconButton>
      ),
      position: "center",
      onClick: () => navigate("/products"),
    } satisfies DrawerItem,

    ...(isAuthenticated
      ? [
          {
            id: "orders",
            label: "My Orders",
            icon: (
              <IconButton>
                <ShoppingBagSharp />
              </IconButton>
            ),
            position: "center",
            onClick: () => navigate("/orders"),
          } satisfies DrawerItem,
          {
            id: "wishlist",
            label: "My Wishlist",
            icon: (
              <IconButton>
                <Favorite sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" } }} />
              </IconButton>
            ),
            position: "center",
            onClick: () => navigate("/wishlist"),
          } satisfies DrawerItem,
          {
            id: "cart",
            label: "My Cart",
            icon: (
              <IconButton>
                <ShoppingCart
                  sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" } }}
                />
              </IconButton>
            ),
            position: "center",
            onClick: () => navigate("/cart"),
          } satisfies DrawerItem,
        ]
      : [
          {
            id: "login",
            label: t("nav.login"),
            icon: (
              <IconButton>
                <ExitToApp />
              </IconButton>
            ),
            position: "end",
            onClick: () => navigate("/login"),
          } satisfies DrawerItem,
        ]),
    {
      id: "language",
      label: "",
      icon: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <LanguageSelector bgcolor="" />
        </Box>
      ),
      position: "end",
      onClick: () => {},
    },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        zIndex: 1100,
        ...(isMobile ? { padding: "8px" } : {}),
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 2 } }}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, md: 64 },
            gap: { xs: 0.5, md: 1 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 3,
              display: { xs: "none", md: "flex", alignItems: "center" },
              fontWeight: 900,
              fontSize: "1.5rem",
              color: "inherit",
              textDecoration: "none",
              letterSpacing: "0.5px",
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            <img alt="gadgify" height={130} width={100} src={BrandIcon} />{" "}
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <AppDrawer
              items={drawerItems}
              trigger={
                <IconButton size="small" aria-label="menu">
                  <MenuIcon sx={{ fontSize: "1.5rem", color: "white" }} />
                </IconButton>
              }
            />
            <Menu
              disableScrollLock
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              sx={{ display: { xs: "block", md: "none" } }}
            />
          </Box>

          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 0.5 }}
          >
            <Button
              onClick={() => navigate("/")}
              sx={{
                py: 2,
                color: "white",
                display: "block",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.3s",
                position: "relative",
                "&:hover": {
                  color: "#fff",
                  "&::after": {
                    width: "100%",
                  },
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 10,
                  left: 0,
                  width: 0,
                  height: 3,
                  bgcolor: "#ff9800",
                  borderRadius: "2px",
                  transition: "width 0.3s",
                },
              }}
            >
              {t("nav.home")}
            </Button>
            <Button
              onClick={() => navigate("/products")}
              sx={{
                py: 2,
                color: "white",
                display: "block",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.3s",
                position: "relative",
                "&:hover": {
                  color: "#fff",
                  "&::after": {
                    width: "100%",
                  },
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 10,
                  left: 0,
                  width: 0,
                  height: 3,
                  bgcolor: "#ff9800",
                  borderRadius: "2px",
                  transition: "width 0.3s",
                },
              }}
            >
              {t("nav.products")}
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => navigate("/orders")}
                sx={{
                  py: 2,
                  color: "white",
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                  position: "relative",
                  "&:hover": {
                    color: "#fff",
                    "&::after": {
                      width: "100%",
                    },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    width: 0,
                    height: 3,
                    bgcolor: "#ff9800",
                    borderRadius: "2px",
                    transition: "width 0.3s",
                  },
                }}
              >
                {t("nav.orders")}
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                sx={{
                  py: 2,
                  color: "#ff9800",
                  display: "block",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(255, 152, 0, 0.2)",
                  },
                }}
              >
                ⚙️ {t("nav.admin")}
              </Button>
            )}
          </Box>
          <Box
            sx={{
              gap: 1,
              color: "#fff",
              fontWeight: 100,
              display: { xs: "none", md: "flex" },
            }}
          >
            <LanguageSelector color="white" bgcolor="" />
          </Box>

          {isAuthenticated && (
            <Stack direction="row" gap={2}>
              <IconButton
                size="small"
                onClick={() => navigate("/wishlist")}
                color="inherit"
                sx={{
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Badge
                  badgeContent={wishlistItems.length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 700,
                      fontSize: "0.65rem",
                    },
                  }}
                >
                  <Favorite sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" } }} />
                </Badge>
              </IconButton>

              <IconButton
                size="small"
                onClick={() => navigate("/cart")}
                color="inherit"
                sx={{
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Badge
                  badgeContent={itemCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 700,
                      fontSize: "0.65rem",
                    },
                  }}
                >
                  <ShoppingCart
                    sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" } }}
                  />
                </Badge>
              </IconButton>
              <Box>
                <IconButton
                  size="small"
                  onClick={handleOpenUserMenu}
                  color="inherit"
                  sx={{
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <AccountCircle
                    sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" } }}
                  />
                </IconButton>
                <Menu
                  disableScrollLock
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  sx={{
                    "& .MuiPaper-root": {
                      borderRadius: 1.5,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                      mt: 0.5,
                      zIndex: 1301,
                    },
                  }}
                >
                  <MenuItem disabled sx={{ bgcolor: "#f5f5f5" }}>
                    <Typography
                      textAlign="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: "0.9rem",
                      }}
                    >
                      👤 {user?.name}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile");
                    }}
                    sx={{ fontWeight: 600, py: 1 }}
                  >
                    <Typography textAlign="center" sx={{ fontSize: "0.9rem" }}>
                      👁️ {t("nav.profile")}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ fontWeight: 600, color: "#d32f2f", py: 1 }}
                  >
                    <Typography textAlign="center" sx={{ fontSize: "0.9rem" }}>
                      🚪 {t("nav.logout")}
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Stack>
          )}
          {!isAuthenticated && (
            <>
              <Button
                onClick={() => navigate("/login")}
                size="small"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  px: { xs: 0.75, md: 1.5 },
                  py: { xs: 0.5, md: 1 },
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {t("nav.login")}
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                size="small"
                sx={{
                  color: "white",
                  bgcolor: "#ff9800",
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  borderRadius: 1,
                  px: { xs: 0.75, md: 2 },
                  py: { xs: 0.5, md: 1 },
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "#f57c00",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t("nav.signup")}
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
