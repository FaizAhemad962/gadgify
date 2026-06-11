import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductSection from "../products/ProductSection";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

interface BestSellersProps {
  title?: string;
  description?: string;
  limit?: number;
  sortBy?: string;
}

const BestSellers = ({
  title = "common.bestSellers",
  description = "common.bestSellersDesc",
  limit = 8,
  sortBy = "sales",
}: BestSellersProps) => {
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
    <ProductSection
      title={`📈 ${t(title)}`}
      subtitle={t(description)}
      actionLabel={t("common.viewAll")}
      onActionClick={() => navigate("/products?sortBy=sales")}
      products={products}
      isLoading={isLoading}
      skeletonCount={limit}
      emptyMessage={t("common.noProductsFound")}
      isInWishlist={isInWishlist}
      isToggling={isToggling}
      toggleWishlist={toggleWishlist}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      onNavigate={(id) => navigate(`/products/${id}`)}
      t={t}
    />
  );
};

export default BestSellers;
