import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { Box } from "@/mui/material";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import ProductGrid from "./ProductGrid";
import SectionHeader from "../sections/SectionHeader";

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
      <SectionHeader title={t("common.recentlyViewed")} sx={{ mb: 4 }} />
      <ProductGrid
        products={products}
        columns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        isInWishlist={isInWishlist}
        isToggling={isToggling}
        toggleWishlist={toggleWishlist}
        onAddToCart={(pid) => addToCart({ productId: pid, quantity: 1 })}
        onBuyNow={(pid) => {
          void addToCart({ productId: pid, quantity: 1 });
          navigate("/cart");
        }}
        onNavigate={(pid) => navigate(`/products/${pid}`)}
        t={t}
        sx={{ gap: 3 }}
      />
    </Box>
  );
};

export default RecentlyViewed;
