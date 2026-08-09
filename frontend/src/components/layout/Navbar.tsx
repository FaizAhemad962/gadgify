import { useCallback, useMemo, useState, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Badge,
  Stack,
  Avatar,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@/mui/material";

import {
  Menu as MenuIcon,
  ShoppingCart,
  Favorite,
  Home,
  ShoppingBagSharp,
  ShoppingBag,
  Settings,
  Dashboard,
  AdminPanelSettings,
  ExpandMore,
  Person,
  Logout,
} from "@/mui/icons";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import LanguageSelector from "../common/LanguageSelector";
import BrandMark from "../common/BrandMark";
import { AppDrawer } from "../ui/Drawer";
import { CustomMenu, CustomMenuItem } from "../ui/CustomMenu";
import {
  navActionIconSx,
  navLinkIconSx,
  navMenuIconSx,
  navIconSizes,
} from "../ui/navigationStyles";
import { tokens } from "@/theme/theme";
import { getRoleLabel, getRoleColor } from "../../utils/roleHelper";
import { CustomButton } from "@/components/ui/CustomButton";

const Navbar = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, isSuperAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElAdmin, setAnchorElAdmin] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAdmin(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseAdminMenu = () => {
    setAnchorElAdmin(null);
  };

  const handleLogout = () => {
    void logout();
    handleCloseUserMenu();
  };

  const handleNavClick = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  const isSelected = useCallback(
    (to: string) =>
      to === "/"
        ? location.pathname === "/"
        : location.pathname === to || location.pathname.startsWith(`${to}/`),
    [location.pathname],
  );

  const primaryItems = useMemo(
    () => [
      {
        id: "home",
        label: t("nav.home"),
        to: "/",
        icon: <Home sx={navLinkIconSx} />,
      },
      {
        id: "products",
        label: t("nav.products"),
        to: "/products",
        icon: <ShoppingBag sx={navLinkIconSx} />,
      },
      ...(isAuthenticated && !isAdmin
        ? [
            {
              id: "orders",
              label: t("nav.orders"),
              to: "/orders",
              icon: <ShoppingBagSharp sx={navLinkIconSx} />,
            },
          ]
        : []),
    ],
    [isAdmin, isAuthenticated, t],
  );

  const adminItems = useMemo(
    () =>
      isAdmin
        ? [
            {
              id: "adminDashboard",
              label: t("nav.adminDashboard"),
              to: "/admin",
              icon: <Dashboard sx={navMenuIconSx} />,
            },
            {
              id: "adminProducts",
              label: t("nav.adminProducts"),
              to: "/admin/products",
              icon: <Settings sx={navMenuIconSx} />,
            },
            {
              id: "adminOrders",
              label: t("nav.adminOrders"),
              to: "/admin/orders",
              icon: <Settings sx={navMenuIconSx} />,
            },
            {
              id: "adminCoupons",
              label: t("nav.adminCoupons"),
              to: "/admin/coupons",
              icon: <Settings sx={navMenuIconSx} />,
            },
            {
              id: "adminCategories",
              label: t("nav.adminCategories"),
              to: "/admin/categories",
              icon: <Settings sx={navMenuIconSx} />,
            },
            ...(isSuperAdmin
              ? [
                  {
                    id: "adminUsers",
                    label: t("nav.adminUsers"),
                    to: "/admin/users",
                    icon: <Settings sx={navMenuIconSx} />,
                  },
                ]
              : []),
          ]
        : [],
    [isAdmin, isSuperAdmin, t],
  );

  const drawerItems = useMemo(() => {
    const accountItems = isAuthenticated
      ? [
          {
            id: "wishlist",
            label: t("nav.wishlist"),
            to: "/wishlist",
            icon: (
              <Badge badgeContent={wishlistItems.length} color="error">
                <Favorite sx={navActionIconSx} />
              </Badge>
            ),
            position: "end" as const,
          },
          {
            id: "cart",
            label: t("nav.cart"),
            to: "/cart",
            icon: (
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart sx={navActionIconSx} />
              </Badge>
            ),
            position: "end" as const,
          },
          {
            id: "profile",
            label: t("nav.profile"),
            to: "/profile",
            icon: <Person sx={navActionIconSx} />,
            position: "end" as const,
          },
        ]
      : [
          {
            id: "login",
            label: t("nav.login"),
            to: "/login",
            icon: <Person sx={navActionIconSx} />,
            position: "end" as const,
          },
          {
            id: "signup",
            label: t("nav.signup"),
            to: "/signup",
            icon: <Person sx={navActionIconSx} />,
            position: "end" as const,
          },
        ];

    return [...primaryItems, ...adminItems, ...accountItems].map((item) => ({
      ...item,
      selected: isSelected(item.to),
      onClick: () => handleNavClick(item.to),
    }));
  }, [
    adminItems,
    handleNavClick,
    isAuthenticated,
    isSelected,
    itemCount,
    primaryItems,
    t,
    wishlistItems.length,
  ]);

  // Common button styles for nav links
  const navBtnSx = {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    fontSize: "0.875rem",
    borderRadius: "999px",
    px: 1.6,
    py: 0.9,
    minWidth: 0,
    transition:
      "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.12)",
      color: "#fff",
    },
    "& .MuiButton-startIcon": {
      mr: 0.75,
      "& svg": navLinkIconSx,
    },
  };

  const adminBtnSx = {
    ...navBtnSx,
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.2)",
      color: "#fff",
    },
  };

  const isAdminSectionSelected = adminItems.some((item) => isSelected(item.to));
  const currentAdminItem = adminItems.find((item) => isSelected(item.to));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(27, 42, 74, 0.96)",
        color: "#fff",
        zIndex: 1100,
        borderBottom: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
        backgroundImage:
          "linear-gradient(90deg, rgba(15,27,48,0.98), rgba(27,42,74,0.96), rgba(15,27,48,0.98))",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          px: tokens.pagePaddingX,
          width: "100%",
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: {
              xs: tokens.navbarHeightMobile,
              md: tokens.navbarHeightDesktop + 8,
            },
            gap: { xs: 1, md: 2 },
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {/* ── Brand ── */}
          <BrandMark
            showText
            textColor="#fff"
            onClick={() => handleNavClick("/")}
            sx={{
              mr: { xs: 0, md: 2 },
              flexShrink: 0,
              "& > span": { display: { xs: "none", sm: "block" } },
            }}
          />

          {/* ── Search Bar ── */}
          {/* <Box sx={{ display: { xs: "none", md: "flex" }, mx: 2 }}>
            <SearchAutocomplete />
          </Box> */}

          {/* ── Mobile menu ── */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <AppDrawer
              width={`min(${tokens.drawerWidth}px, 100vw)`}
              items={[
                ...drawerItems,
                ...(isAuthenticated
                  ? [
                      {
                        id: "logout",
                        label: t("nav.logout"),
                        icon: <Logout />,
                        onClick: handleLogout,
                        position: "end" as const,
                      },
                    ]
                  : []),
              ]}
              endContent={
                <Box
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 0.5,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <LanguageSelector tone="dark" />
                </Box>
              }
              trigger={
                <IconButton
                  size="small"
                  aria-label="Open navigation menu"
                  sx={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                  }}
                >
                  <MenuIcon
                    sx={{
                      fontSize: navIconSizes.mobileTrigger,
                      color: "white",
                    }}
                  />
                </IconButton>
              }
            />
          </Box>

          {/* ── Desktop nav links ── */}
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
              overflow: "hidden",
            }}
          >
            {primaryItems.map((item) => (
                <CustomButton
                  appVariant="ghost"
                  key={item.id}
                  onClick={() => handleNavClick(item.to)}
                  aria-label={item.label}
                  startIcon={item.icon}
                  sx={{
                    ...navBtnSx,
                    ...(isSelected(item.to) && {
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
                    }),
                  }}
                >
                  {item.label}
                </CustomButton>
              ))}

            {/* Admin links with visual distinction */}
            {isAdmin && (
              <Box
                sx={{
                  display: "flex",
                  ml: 1.5,
                  pl: 1.5,
                  borderLeft: "1px solid rgba(255,255,255,0.15)",
                  flexShrink: 0,
                }}
              >
                <CustomButton
                  appVariant="ghost"
                  onClick={handleOpenAdminMenu}
                  aria-label={t("nav.admin")}
                  startIcon={<AdminPanelSettings sx={navLinkIconSx} />}
                  endIcon={<ExpandMore sx={navLinkIconSx} />}
                  size="small"
                  sx={{
                    ...adminBtnSx,
                    maxWidth: { md: 170, lg: 220 },
                    "& .MuiButton-endIcon": { ml: 0.5 },
                    ...(isAdminSectionSelected && {
                      bgcolor: "rgba(255,255,255,0.95)",
                      color: tokens.primary,
                      boxShadow: "0 10px 26px rgba(0,0,0,0.16)",
                    }),
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentAdminItem?.label || t("nav.admin")}
                  </Box>
                </CustomButton>
                <CustomMenu
                  anchorEl={anchorElAdmin}
                  open={Boolean(anchorElAdmin)}
                  onClose={handleCloseAdminMenu}
                  transformOrigin={{ horizontal: "left", vertical: "top" }}
                  anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: {
                        minWidth: 230,
                      },
                    },
                  }}
                >
                  {adminItems.map((item) => (
                    <CustomMenuItem
                      key={item.id}
                      selected={isSelected(item.to)}
                      onClick={() => {
                        handleCloseAdminMenu();
                        handleNavClick(item.to);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isSelected(item.to) ? 800 : 600,
                        }}
                      />
                    </CustomMenuItem>
                  ))}
                </CustomMenu>
              </Box>
            )}
          </Box>

          {/* ── Right actions ── */}
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{ flexShrink: 0, ml: "auto" }}
          >
            {/* Language selector — desktop only */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <LanguageSelector tone="dark" />
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
                <LightMode sx={navActionIconSx} />
              ) : (
                <DarkMode sx={navActionIconSx} />
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
                    border: "1px solid transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderColor: "rgba(255,255,255,0.16)",
                    },
                  }}
                >
                  <Badge badgeContent={wishlistItems.length} color="error">
                    <Favorite sx={navActionIconSx} />
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
                    border: "1px solid transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderColor: "rgba(255,255,255,0.16)",
                    },
                  }}
                >
                  <Badge badgeContent={itemCount} color="error">
                    <ShoppingCart sx={navActionIconSx} />
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
                    border: "1px solid transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderColor: "rgba(255,255,255,0.16)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: tokens.primary,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>

                {/* User dropdown menu */}
                <CustomMenu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.25,
                        minWidth: 292,
                        maxWidth: 320,
                        borderRadius: "28px",
                        overflow: "hidden",
                        border: `1px solid ${tokens.gray200}`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
                        boxShadow:
                          "0 24px 70px rgba(15, 23, 42, 0.22), 0 2px 12px rgba(15, 23, 42, 0.08)",
                        backdropFilter: "blur(18px)",
                      },
                    },
                    list: {
                      sx: {
                        py: 1,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2.25,
                      py: 2,
                      borderBottom: `1px solid ${tokens.gray200}`,
                      background:
                        "linear-gradient(135deg, rgba(30,49,89,0.06), rgba(255,108,45,0.08))",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: tokens.primary,
                          color: "white",
                          fontWeight: 800,
                          boxShadow: "0 10px 22px rgba(255,108,45,0.28)",
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          color={tokens.gray900}
                          noWrap
                        >
                          {user?.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={tokens.gray600}
                          noWrap
                          sx={{ mt: 0.25 }}
                        >
                          {user?.email || ""}
                        </Typography>
                        {user?.role && (
                          <Chip
                            icon={<AdminPanelSettings sx={navMenuIconSx} />}
                            label={getRoleLabel(user.role)}
                            size="small"
                            sx={{
                              mt: 1,
                              height: 24,
                              borderRadius: 999,
                              px: 0.25,
                              bgcolor: getRoleColor(user.role),
                              color: "white",
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              "& .MuiChip-icon": {
                                color: "white",
                                fontSize: `${navIconSizes.menu - 4}px`,
                                ml: 0.75,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  <CustomMenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleNavClick("/profile");
                    }}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2.5,
                      color: tokens.gray800,
                      "&:hover": {
                        bgcolor: "rgba(30,49,89,0.08)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "10px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(30,49,89,0.10)",
                          color: tokens.primary,
                        }}
                      >
                        <Person sx={navMenuIconSx} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={t("nav.profile")}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </CustomMenuItem>
                  <CustomMenuItem
                    onClick={handleLogout}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2.5,
                      color: tokens.error,
                      "&:hover": {
                        bgcolor: "rgba(239,68,68,0.08)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "10px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(239,68,68,0.10)",
                          color: tokens.error,
                        }}
                      >
                        <Logout sx={navMenuIconSx} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={t("nav.logout")}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </CustomMenuItem>
                </CustomMenu>
              </>
            ) : (
              /* ── Logged-out CTA buttons ── */
              <Stack direction="row" gap={1} sx={{ ml: 1 }}>
                <CustomButton
                  appVariant="ghost"
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
                </CustomButton>
                <CustomButton
                  appVariant="success"
                  onClick={() => navigate("/signup")}
                  size="small"
                  variant="contained"
                  sx={{
                    fontSize: "0.8125rem",
                    borderRadius: 2,
                    px: 2.5,
                  }}
                >
                  {t("nav.signup")}
                </CustomButton>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
