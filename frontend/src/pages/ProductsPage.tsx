import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert

} from "@mui/material";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart, isAddingToCart } = useCart()

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClearCategory = () => {
    setDisplayCount(PRODUCTS_PER_PAGE);
    setSelectedCategory(null);
  };


  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          filteredProducts &&
          displayCount < filteredProducts.length
        ) {
          setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredProducts]);

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Check if item is already in cart
    const cartItem = cart?.items?.find((item) => item.productId === productId);
    if (!cartItem) {
      // Only add if not in cart
      await addToCart({ productId, quantity: 1 });
    }
    // Don't modify existing cart items, just navigate to cart
    navigate("/cart");
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {ErrorHandler.getUserFriendlyMessage(
            error,
            t("errors.somethingWrong")
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="700"
          sx={{ color: "text.primary" }}
        >
          {t("products.title")}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
          {t("products.description")}
        </Typography>

      </Box>


      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            {t("common.loading") || "Loading products..."}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3.5,
            }}
          >
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.slice(0, displayCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInWishlist={isInWishlist}
                    toggleWishlist={toggleWishlist}
                    isToggling={isToggling}
                  onAddToCart={(id) => addToCart({productId:id, quantity:1})}
                  onBuyNow={(id) => handleBuyNow(id)}
                  onNavigate={(id) => navigate(`/products/${id}`)}
                  t={t}
                  isAddingToCart={isAddingToCart(product.id)}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 12 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {t("common.noProductsFound")}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleClearCategory}
                  sx={{ fontWeight: 600 }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </Box>

          {/* Infinite scroll loader */}
          {filteredProducts && displayCount < filteredProducts.length && (
            <Box
              ref={loaderRef}
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage;
