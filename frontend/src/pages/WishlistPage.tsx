import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@/mui/material";
import { FavoriteBorder, ShoppingBag } from "@/mui/icons";
import ProductGrid from "@/components/products/ProductGrid";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";
import type { Product } from "@/types";

const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    wishlistItems,
    isLoading,
    isError,
    isInWishlist,
    isToggling,
    toggleWishlist,
  } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();

  const products = wishlistItems.map((item) => item.product as Product);

  const handleAddToCart = async (productId: string) => {
    await addToCart({ productId, quantity: 1 });
  };

  const emptyState = (
    <Paper
      elevation={0}
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        border: `1px solid ${tokens.gray200}`,
        borderRadius: `${tokens.radiusXl}px`,
        textAlign: "center",
        background:
          "linear-gradient(135deg, rgba(27,42,74,0.04), rgba(255,107,44,0.06))",
      }}
    >
      <Box
        sx={{
          width: 84,
          height: 84,
          mx: "auto",
          mb: 2,
          borderRadius: "28px",
          display: "grid",
          placeItems: "center",
          color: tokens.accent,
          bgcolor: `${tokens.accent}14`,
        }}
      >
        <FavoriteBorder sx={appIconSx.feature} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: tokens.gray900 }}>
        {t("wishlist.empty")}
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: tokens.gray600 }}>
        Save products you like and come back to them anytime.
      </Typography>
      <Button
        variant="contained"
        startIcon={<ShoppingBag sx={appIconSx.lg} />}
        onClick={() => navigate("/products")}
        sx={{
          bgcolor: tokens.accent,
          borderRadius: "999px",
          px: 3,
          fontWeight: 800,
          "&:hover": { bgcolor: tokens.accentDark },
        }}
      >
        {t("wishlist.browseProducts")}
      </Button>
    </Paper>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: tokens.appMaxWidth,
        py: { xs: 3, md: 5 },
        px: tokens.pagePaddingX,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: tokens.gray900 }}
          >
            {t("wishlist.title")}
          </Typography>
          <Typography sx={{ mt: 0.75, color: tokens.gray600 }}>
            {wishlistItems.length} saved item
            {wishlistItems.length === 1 ? "" : "s"}
          </Typography>
        </Box>
        {wishlistItems.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<ShoppingBag />}
            onClick={() => navigate("/products")}
            sx={{
              borderRadius: "999px",
              borderColor: tokens.gray300,
              color: tokens.primary,
              fontWeight: 800,
            }}
          >
            {t("cart.continueShopping")}
          </Button>
        )}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("wishlist.error")}
        </Alert>
      )}

      <ProductGrid
        products={products}
        isLoading={isLoading}
        skeletonCount={6}
        emptyMessage={emptyState}
        isInWishlist={isInWishlist}
        isToggling={isToggling}
        toggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={async (productId) => {
          await handleAddToCart(productId);
          navigate("/checkout");
        }}
        onNavigate={(productId) => navigate(`/products/${productId}`)}
        t={t}
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      />

      {products.some((product) => isAddingToCart(product.id)) && (
        <Typography sx={{ mt: 2, color: tokens.gray500 }}>
          {t("common.loading")}
        </Typography>
      )}
    </Container>
  );
};

export default WishlistPage;
