import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Box, Typography, Button, Skeleton } from "@mui/material";
import { ArrowForward, TrendingUp } from "@mui/icons-material";
import { productsApi } from "../../api/products";
import ProductCard from "../ProductCard";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme/theme";

interface BestSellersProps {
  title?: string;
  description?: string;
  limit?: number;
  sortBy?: string;
}

const BestSellers: React.FC<BestSellersProps> = ({
  title = "common.bestSellers",
  description = "common.bestSellersDesc",
  limit = 8,
  sortBy = "sales",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const { data: bestSellersData, isLoading } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => productsApi.getAll({ sortBy, limit }),
    staleTime: 10 * 60 * 1000,
  });

  const products = bestSellersData?.products || [];

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addToCart({ productId, quantity: 1 });
  };

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addToCart({ productId, quantity: 1 });
    navigate("/checkout");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <TrendingUp sx={{ color: tokens.success, fontSize: 28 }} />
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              {t(title)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t(description)}
          </Typography>
        </Box>
        <Button
          endIcon={<ArrowForward />}
          onClick={() => navigate("/products?sortBy=sales")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: tokens.primary,
          }}
        >
          {t("common.viewAll")}
        </Button>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Box key={i}>
              <Skeleton variant="rounded" height={340} />
            </Box>
          ))}
        </Box>
      ) : products.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {products.map((product) => (
            <Box key={product.id}>
              <ProductCard
                product={product}
                isInWishlist={isInWishlist}
                isToggling={isToggling}
                toggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onNavigate={(id) => navigate(`/products/${id}`)}
                t={t}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            {t("common.noProductsFound")}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BestSellers;
