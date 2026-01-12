import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip


} from "@mui/material";
// Dummy wishlist state for demonstration. Replace with real wishlist logic/context as needed.
const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  return { wishlist, isInWishlist, toggleWishlist };
};
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, cart, updateQuantity } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

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
    setSelectedCategory(null);
    setSearchParams({});
  };

  // Get unique categories from products
  const categories = Array.from(
    new Set(products?.map((p) => p.category) || [])
  );

  // Read category from URL on mount
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

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

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToCart({ productId, quantity });
      // Toast notification would go here
    } catch (error) {
      ErrorHandler.logError("Add to cart failed", error);
      console.error("Failed to add to cart:", error);
    }
  };

  const handleBuyNow = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Check if item is already in cart
    const cartItem = cart?.items?.find((item) => item.productId === productId);
    if (cartItem) {
      // If quantity is different, update it
      if (cartItem.quantity !== quantity) {
        await updateQuantity(cartItem.id, quantity);
      }
    } else {
      await addToCart({ productId, quantity });
    }
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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

        {/* Categories Filter */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 3 }}>
          <Chip
            label={t("products.allProducts")}
            onClick={handleClearCategory}
            variant={!selectedCategory ? "filled" : "outlined"}
            color={!selectedCategory ? "primary" : "default"}
            sx={{ cursor: "pointer", fontWeight: 600 }}
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={t(`categories.${category}`)}
              onClick={() => {
                setSelectedCategory(category);
                setSearchParams({ category });
              }}
              variant={selectedCategory === category ? "filled" : "outlined"}
              color={selectedCategory === category ? "primary" : "default"}
              sx={{ cursor: "pointer", fontWeight: 500 }}
            />
          ))}
        </Box>
      </Box>

      {/* Active Category Badge */}
      {selectedCategory && (
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`📁 ${t(`categories.${selectedCategory}`)}`}
            onDelete={handleClearCategory}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

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
                xs: "1fr",
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
                  onAddToCart={(id) => handleAddToCart(id, 1)}
                  onBuyNow={(id) => handleBuyNow(id, 1)}
                  onNavigate={(id) => navigate(`/products/${id}`)}
                  t={t}
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
