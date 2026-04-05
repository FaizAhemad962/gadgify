import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Tune as FilterIcon,
  ViewModule,
  ViewList,
} from "@mui/icons-material";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearch } from "../context/SearchContext";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import type { SortOption } from "../components/FilterSidebar";
import { tokens } from "@/theme/theme";

const PRODUCTS_PER_PAGE = 12;

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Separate states for price range dragging vs committed
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 100000,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Read category from URL query params (e.g. from HomePage category tiles)
  useEffect(() => {
    const cat = searchParams.get("category");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  useEffect(() => {
    const sort = searchParams.get("sortBy");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sort) setSortBy(sort as SortOption);
  }, [searchParams]);

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

  // Track all accumulated products as user scrolls
  const [accumulatedProducts, setAccumulatedProducts] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      media?: Array<{ isPrimary: boolean }>;
      [key: string]: any;
    }>
  >([]);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "products",
      debouncedSearchQuery,
      priceRange,
      selectedRatings,
      selectedCategories,
      sortBy,
      displayCount,
    ],
    queryFn: () =>
      productsApi.getAll({
        search: debouncedSearchQuery,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating:
          selectedRatings.length > 0 ? Math.min(...selectedRatings) : 0,
        category: selectedCategories.join(","),
        sortBy,
        page: Math.ceil(displayCount / PRODUCTS_PER_PAGE),
        limit: PRODUCTS_PER_PAGE,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: true,
  });

  // Accumulate products from all pages as user scrolls
  useEffect(() => {
    if (response && typeof response === "object" && response?.products) {
      const newProducts = response.products;

      // If filters changed, reset accumulated products
      if (
        debouncedSearchQuery === "" &&
        priceRange[0] === 0 &&
        priceRange[1] === 100000 &&
        selectedRatings.length === 0 &&
        selectedCategories.length === 0 &&
        accumulatedProducts.length === 0
      ) {
        setAccumulatedProducts(newProducts);
      } else if (accumulatedProducts.length === 0) {
        // First page
        setAccumulatedProducts(newProducts);
      } else {
        // Append new products (avoid duplicates by checking IDs)
        const existingIds = new Set(accumulatedProducts.map((p) => p.id));
        const uniqueNewProducts = newProducts.filter(
          (p: any) => !existingIds.has(p.id),
        );
        if (uniqueNewProducts.length > 0) {
          setAccumulatedProducts((prev) => [...prev, ...uniqueNewProducts]);
        }
      }
    }
  }, [
    response,
    debouncedSearchQuery,
    priceRange,
    selectedRatings,
    selectedCategories,
  ]);

  // Reset accumulated products when filters change
  useEffect(() => {
    setAccumulatedProducts([]);
  }, [
    debouncedSearchQuery,
    priceRange,
    selectedRatings,
    selectedCategories,
    sortBy,
  ]);

  // Handle both array (old format) and object (new format) responses
  const currentPageProducts = Array.isArray(response)
    ? response
    : typeof response === "object" && response?.products
      ? response.products
      : [];
  const products =
    accumulatedProducts.length > 0 ? accumulatedProducts : currentPageProducts;
  const total =
    typeof response === "object" ? response?.total || 0 : products.length;

  // Get unique categories from products (for filter sidebar)
  // Use a separate unfiltered query so the category list stays complete
  const { data: allProductsForCategories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productsApi.getAll({ limit: 200 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  const categories = allProductsForCategories?.products
    ? [
        ...new Set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allProductsForCategories.products.map((p: any) => p.category),
        ),
      ].sort()
    : [];

  const handleClearFilters = useCallback(() => {
    setDisplayCount(PRODUCTS_PER_PAGE);
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setTempPriceRange([0, 100000]);
    setSelectedRatings([]);
    setSortBy("popularity");
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, [setSearchQuery]);

  // Check if any filters are active
  const isFiltersActive =
    debouncedSearchQuery !== "" ||
    selectedCategories.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 100000 ||
    selectedRatings.length > 0 ||
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

  const handlePriceCommit = useCallback((range: [number, number]) => {
    setPriceRange(range);
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleRatingsChange = useCallback((ratings: number[]) => {
    setSelectedRatings(ratings);
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, []);

  const handleCategoriesChange = useCallback((cats: string[]) => {
    setSelectedCategories(cats);
    setDisplayCount(PRODUCTS_PER_PAGE);
  }, []);

  const filterSidebar = (
    <FilterSidebar
      sortBy={sortBy}
      onSortChange={setSortBy}
      tempPriceRange={tempPriceRange}
      priceRange={priceRange}
      onTempPriceChange={setTempPriceRange}
      onPriceCommit={handlePriceCommit}
      selectedRatings={selectedRatings}
      onRatingsChange={handleRatingsChange}
      selectedCategories={selectedCategories}
      onCategoriesChange={handleCategoriesChange}
      categories={categories as string[]}
      isFiltersActive={isFiltersActive}
      onClearFilters={handleClearFilters}
      t={t}
    />
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Grid / List Toggle */}
            {!isMobile && (
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
                sx={{ mr: 1 }}
              >
                <ToggleButton value="grid" aria-label={t("common.gridView")}>
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list" aria-label={t("common.listView")}>
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            )}

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
        </Box>

        {/* Product count */}
        {!isLoading && products && products.length > 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            {t("common.showingXofY", { shown: products.length, total })}
          </Typography>
        )}

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
            {selectedCategories.map((cat) => (
              <Chip
                key={cat}
                label={`Category: ${cat}`}
                onDelete={() =>
                  setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                }
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            ))}
            {selectedRatings.map((r) => (
              <Chip
                key={r}
                label={`Rating: ${r}+`}
                onDelete={() =>
                  setSelectedRatings((prev) => prev.filter((x) => x !== r))
                }
                sx={{ backgroundColor: "#FFF3E0", color: tokens.accent }}
              />
            ))}
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
        /* ── First load only: full-page spinner ── */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: !isMobile ? "260px 1fr" : "1fr",
            },
            gap: 3,
          }}
        >
          {!isMobile && filterSidebar}

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="left"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            sx={{ "& .MuiDrawer-paper": { width: 280 } }}
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
                {t("common.filters") || "Filters"}
              </Typography>
              <IconButton
                onClick={() => setFilterDrawerOpen(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {filterSidebar}
          </Drawer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
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
        </Box>
      ) : (
        <>
          {/* Main Layout: Sidebar + Products Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: !isMobile ? "260px 1fr" : "1fr",
              },
              gap: 3,
            }}
          >
            {/* Desktop Filter Sidebar */}
            {!isMobile && filterSidebar}

            {/* Mobile Filter Drawer */}
            <Drawer
              anchor="left"
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              sx={{ "& .MuiDrawer-paper": { width: 280 } }}
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
                  {t("common.filters") || "Filters"}
                </Typography>
                <IconButton
                  onClick={() => setFilterDrawerOpen(false)}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {filterSidebar}
            </Drawer>

            {/* Products Grid */}
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    viewMode === "list"
                      ? "1fr"
                      : {
                          xs: "repeat(1, 1fr)",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(3, 1fr)",
                        },
                  gap: viewMode === "list" ? 2 : 5,
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
                      viewMode={viewMode}
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
