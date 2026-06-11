import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@/mui/material";
import { Timer } from "@/mui/icons";
import { productsApi } from "../../api/products";
import { flashSaleApi } from "../../api/flashSales";
import ProductSection from "../products/ProductSection";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";

interface FlashSaleProps {
  title?: string;
  description?: string;
  limit?: number;
}

const FlashSale = ({
  title = "common.flashSale",
  description = "common.flashSaleDesc",
  limit = 6,
}: FlashSaleProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data: flashSalesData } = useQuery({
    queryKey: ["active-flash-sales"],
    queryFn: () => flashSaleApi.getAll({ limit: 1 }),
    staleTime: 2 * 60 * 1000,
  });

  const currentFlashSale = flashSalesData?.flashSales?.[0];

  useEffect(() => {
    if (!currentFlashSale) return;

    const tick = () => {
      const now = new Date();
      const endTime = new Date(currentFlashSale.endTime);
      const diff = Math.max(0, endTime.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [currentFlashSale]);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["flash-sale-products", limit],
    queryFn: () => productsApi.getAll({ limit }),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];

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

  const countdown = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
        px: 1.5,
        py: 1,
        borderRadius: "999px",
        bgcolor: "rgba(255, 107, 44, 0.08)",
        color: tokens.accent,
        border: "1px solid rgba(255, 107, 44, 0.18)",
      }}
    >
      <Timer sx={appIconSx.md} />
      <Typography variant="body2" fontWeight="700">
        {t("common.limitedTimeOffer")}
      </Typography>
      {[
        { val: timeLeft.hours, label: t("common.hours") },
        { val: timeLeft.minutes, label: t("common.minutes") },
        { val: timeLeft.seconds, label: t("common.seconds") },
      ].map((unit, index, items) => (
        <Box key={unit.label} sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            fontWeight="800"
            sx={{ minWidth: 24, textAlign: "center" }}
          >
            {String(unit.val).padStart(2, "0")}
          </Typography>
          {index < items.length - 1 && (
            <Typography variant="body2" sx={{ mx: 0.25, color: tokens.gray500 }}>
              :
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: tokens.white }}>
      <ProductSection
        title={t(title)}
        subtitle={t(description)}
        actionLabel={t("common.viewAll")}
        onActionClick={() => navigate("/products")}
        headerMeta={countdown}
        products={products}
        isLoading={productsLoading}
        skeletonCount={limit}
        emptyMessage={t("common.noProductsFound")}
        isInWishlist={isInWishlist}
        isToggling={isToggling}
        toggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onNavigate={(id) => navigate(`/products/${id}`)}
        t={t}
        containerSx={{ py: { xs: 3, md: 4 } }}
      />
    </Box>
  );
};

export default FlashSale;
