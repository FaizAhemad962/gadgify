import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Slider,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from "@mui/material";
import { Close as CloseIcon, Tune as FilterIcon } from "@mui/icons-material";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearch } from "../context/SearchContext";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { tokens } from "@/theme/theme";

const PRODUCTS_PER_PAGE = 12;

type SortOption =
  | "popularity"
  | "price-low"
  | "price-high"
  | "newest"
  | "rating";

const ProductsPage = () => {
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams] = useSearchParams();

  // State for filters and sorting
  const { searchQuery, setSearchQuery } = useSearch();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Separate states for price range dragging vs committed
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 100000,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setDisplayCount(PRODUCTS_PER_PAGE); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart, isAddingToCart } = useCart();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "products",
      debouncedSearchQuery,
      priceRange,
      selectedRating,
      selectedCategory,
      sortBy,
      displayCount,
    ],
    queryFn: () =>
      productsApi.getAll({
        search: debouncedSearchQuery,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: selectedRating || 0,
        category: selectedCategory || "",
        sortBy,
        page: Math.ceil(displayCount / PRODUCTS_PER_PAGE),
        limit: PRODUCTS_PER_PAGE,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: true,
  });

  // Handle both array (old format) and object (new format) responses
  const products = Array.isArray(response)
    ? response
    : typeof response === "object" && response?.products
      ? response.products
      : [];
  const total =
    typeof response === "object" ? response?.total || 0 : products.length;

  // Get unique categories from products (for filter sidebar)
  const categories = products
    ? [...new Set(products.map((p: any) => p.category))].sort()
    : [];

  const handleClearFilters = () => {
    setDisplayCount(PRODUCTS_PER_PAGE);
    setSelectedCategory(null);
    setPriceRange([0, 100000]);
    setTempPriceRange([0, 100000]);
    setSelectedRating(null);
    setSortBy("popularity");
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Check if any filters are active
  const isFiltersActive =
    debouncedSearchQuery !== "" ||
    selectedCategory !== null ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 100000 ||
    selectedRating !== null ||
    sortBy !== "popularity";

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < total) {
          setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, total]);

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const cartItem = cart?.items?.find((item) => item.productId === productId);
    if (!cartItem) {
      await addToCart({ productId, quantity: 1 });
    }
    navigate("/cart");
  };

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
        backgroundColor: tokens.white,
        borderRadius: "8px",
        border: `1px solid ${tokens.gray200}`,
        height: "fit-content",
      }}
    >
      <Typography variant="h6" fontWeight={700} fontSize="16px">
        Filters
      </Typography>

      {/* Sort Dropdown */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Sort By
        </Typography>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          fullWidth
          size="small"
          sx={{
            borderRadius: 2,
            // backgroundColor: "#F5F5F5",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.gray200,
            },
          }}
        >
          <MenuItem value="popularity">Popularity</MenuItem>
          <MenuItem value="price-low">Price: Low to High</MenuItem>
          <MenuItem value="price-high">Price: High to Low</MenuItem>
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="rating">Best Ratings</MenuItem>
        </Select>
      </Box>

      <Divider />

      {/* Price Range Filter */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
          Price Range
        </Typography>
        <Slider
          value={tempPriceRange}
          onChange={(_, newValue) =>
            setTempPriceRange(newValue as [number, number])
          }
          onChangeCommitted={(_, newValue) => {
            setPriceRange(newValue as [number, number]);
            setDisplayCount(PRODUCTS_PER_PAGE); // Reset to first page
          }}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          marks={[
            { value: 0, label: "₹0" },
            { value: 10000, label: "₹10K" },
          ]}
          sx={{
            "& .MuiSlider-thumb": {
              backgroundColor: tokens.accent,
            },
            "& .MuiSlider-track": {
              backgroundColor: tokens.accent,
            },
            "& .MuiSlider-rail": {
              backgroundColor: tokens.gray200,
            },
          }}
        />
        <Box sx={{ display: "flex", gap: 1, mt: 2, fontSize: "12px" }}>
          <Typography variant="body2">
            ₹{tempPriceRange[0].toLocaleString()}
          </Typography>
          <Typography variant="body2">-</Typography>
          <Typography variant="body2">
            ₹{tempPriceRange[1].toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Rating Filter */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
          Rating
        </Typography>
        {[5, 4, 3, 2, 1].map((rating) => (
          <FormControlLabel
            key={rating}
            control={
              <Checkbox
                checked={selectedRating === rating}
                onChange={(e) =>
                  setSelectedRating(e.target.checked ? rating : null)
                }
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2">
                  {rating} Star{rating > 1 ? "s" : ""} & above
                </Typography>
              </Box>
            }
          />
        ))}
      </Box>

      <Divider />

      {/* Category Filter */}
      {categories.length > 0 && (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
            Category
          </Typography>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategory === category}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.checked ? (category as string) : null,
                    )
                  }
                  size="small"
                />
              }
              label={<Typography variant="body2">{category}</Typography>}
            />
          ))}
        </Box>
      )}

      <Divider />

      {/* Clear Filters Button */}
      {isFiltersActive && (
        <Button
          variant="outlined"
          fullWidth
          onClick={handleClearFilters}
          sx={{
            borderColor: tokens.accent,
            color: tokens.accent,
            fontWeight: 600,
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#FFF3E0",
              borderColor: tokens.accent,
            },
          }}
        >
          Clear All Filters
        </Button>
      )}
    </Box>
  );

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {ErrorHandler.getUserFriendlyMessage(
            error,
            t("errors.somethingWrong"),
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              {t("products.title")}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
              {t("products.description")}
            </Typography>
          </Box>

          {/* Mobile Filter Button */}
          {isMobile && (
            <IconButton
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                backgroundColor: tokens.accent,
                color: tokens.white,
                padding: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: tokens.accentDark,
                },
              }}
            >
              <FilterIcon />
            </IconButton>
          )}
        </Box>

        {/* Active Filters Display */}
        {isFiltersActive && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            {debouncedSearchQuery && (
              <Chip
                label={`Search: "${debouncedSearchQuery}"`}
                onDelete={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                }}
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            )}
            {selectedCategory && (
              <Chip
                label={`Category: ${selectedCategory}`}
                onDelete={() => setSelectedCategory(null)}
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            )}
            {selectedRating && (
              <Chip
                label={`Rating: ${selectedRating}+`}
                onDelete={() => setSelectedRating(null)}
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            )}
            {(priceRange[0] !== 0 || priceRange[1] !== 100000) && (
              <Chip
                label={`₹${priceRange[0].toLocaleString()} - ₹${priceRange[1].toLocaleString()}`}
                onDelete={() => {
                  setPriceRange([0, 100000]);
                  setTempPriceRange([0, 100000]);
                }}
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            )}
          </Box>
        )}
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
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: tokens.accent }}
          />
          <Typography variant="body1" color="text.secondary">
            {t("common.loading") || "Loading products..."}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Main Layout: Sidebar + Products Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr" },
              gap: 3,
            }}
          >
            {/* Desktop Filter Sidebar */}
            {/* {!isMobile && <FilterSidebar />} */}

            {/* Mobile Filter Drawer */}
            <Drawer
              anchor="left"
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              sx={{
                "& .MuiDrawer-paper": {
                  width: 280,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  borderBottom: `1px solid ${tokens.gray200}`,
                }}
              >
                <Typography fontWeight={700} fontSize="18px">
                  Filters
                </Typography>
                <IconButton
                  onClick={() => setFilterDrawerOpen(false)}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {/* <FilterSidebar /> */}
            </Drawer>

            {/* Products Grid */}
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 5,
                }}
              >
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInWishlist={isInWishlist}
                      toggleWishlist={toggleWishlist}
                      isToggling={isToggling}
                      onAddToCart={(id) =>
                        addToCart({ productId: id, quantity: 1 })
                      }
                      onBuyNow={(id) => handleBuyNow(id)}
                      onNavigate={(id) => navigate(`/products/${id}`)}
                      t={t}
                      isAddingToCart={isAddingToCart(product.id)}
                    />
                  ))
                ) : (
                  <Box
                    sx={{ gridColumn: "1 / -1", textAlign: "center", py: 12 }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {t("common.noProductsFound")}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleClearFilters}
                      sx={{
                        backgroundColor: tokens.accent,
                        color: tokens.white,
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: tokens.accentDark,
                        },
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Infinite scroll loader */}
              {products && products.length > 0 && displayCount < total && (
                <Box
                  ref={loaderRef}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 5,
                  }}
                >
                  <CircularProgress sx={{ color: tokens.accent }} />
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProductsPage;
