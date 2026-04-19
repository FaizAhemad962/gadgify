import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { Box, Typography, Divider } from "@mui/material";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import ProductCard from "../ProductCard";
import { tokens } from "@/theme/theme";

interface RecentlyViewedProps {
  excludeProductId?: string;
}

const RecentlyViewed = ({ excludeProductId }: RecentlyViewedProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { recentIds } = useRecentlyViewed();

  const idsToShow = recentIds
    .filter((id) => id !== excludeProductId)
    .slice(0, 6);

  const productQueries = useQueries({
    queries: idsToShow.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productsApi.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const products = productQueries
    .filter((q) => q.isSuccess && q.data)
    .map((q) => q.data!);

  if (products.length === 0) return null;

  return (
    <Box sx={{ my: 4 }}>
      {/* <Divider sx={{ mb: 6, borderColor: tokens.gray200 }} /> */}
      <Typography
        variant="h5"
        gutterBottom
        fontWeight="700"
        sx={{ color: "text.primary", mb: 4 }}
      >
        {t("common.recentlyViewed")}
      </Typography>
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
          <ProductCard
            key={product.id}
            product={product}
            isInWishlist={isInWishlist}
            isToggling={isToggling}
            toggleWishlist={toggleWishlist}
            onAddToCart={(pid) => addToCart({ productId: pid, quantity: 1 })}
            onBuyNow={(pid) => {
              addToCart({ productId: pid, quantity: 1 });
              navigate("/cart");
            }}
            onNavigate={(pid) => navigate(`/products/${pid}`)}
            t={t}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RecentlyViewed;
