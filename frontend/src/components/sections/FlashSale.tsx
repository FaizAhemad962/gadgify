import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Box, Typography, Skeleton } from "@mui/material";
import { Timer } from "@mui/icons-material";
import { productsApi } from "../../api/products";
import { flashSaleApi } from "../../api/flashSales";
import ProductCard from "../ProductCard";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme/theme";

interface FlashSaleProps {
  title?: string;
  description?: string;
  limit?: number;
}

const FlashSale: React.FC<FlashSaleProps> = ({
  title = "common.flashSale",
  description = "common.flashSaleDesc",
  limit = 6,
}) => {
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

  // Fetch active flash sales
  const { data: flashSalesData, isLoading: flashLoading } = useQuery({
    queryKey: ["active-flash-sales"],
    queryFn: () => flashSaleApi.getAll({ limit: 1 }),
    staleTime: 2 * 60 * 1000,
  });

  const currentFlashSale = flashSalesData?.flashSales?.[0];

  // Update countdown timer based on current flash sale
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
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentFlashSale]);

  // Fetch products for flash sale
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["flash-sale-products"],
    queryFn: () => productsApi.getAll({ limit }),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];
  const isLoading = flashLoading || productsLoading;

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
    <Box sx={{ bgcolor: tokens.white, py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{ color: "text.primary", mb: 1 }}
          >
            ⚡ {t(title)}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
            {t(description)}
          </Typography>

          {/* Countdown Timer */}
          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: tokens.accent,
              }}
            >
              <Timer sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight="700">
                {t("common.limitedTimeOffer")}
              </Typography>
            </Box>
            {[
              { val: timeLeft.hours, label: t("common.hours") },
              { val: timeLeft.minutes, label: t("common.minutes") },
              { val: timeLeft.seconds, label: t("common.seconds") },
            ].map((t, i, arr) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight="700"
                  sx={{
                    color: tokens.accent,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {String(t.val).padStart(2, "0")}
                </Typography>
                {i < arr.length - 1 && (
                  <Typography
                    variant="body2"
                    sx={{ mx: 0.5, color: "text.secondary" }}
                  >
                    :
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <Box key={i}>
                <Skeleton variant="rounded" height={320} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
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
        )}
      </Container>
    </Box>
  );
};

export default FlashSale;
