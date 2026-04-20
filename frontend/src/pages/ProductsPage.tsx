/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  IconButton,
} from "@mui/material";
import { ViewModule, ViewList, Close as CloseIcon } from "@mui/icons-material";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearch } from "../context/SearchContext";
import { useCategories } from "@/hooks/useCategories";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";
import { FilterSidebar, type SortOption } from "../components/FilterSidebar";
import { tokens } from "@/theme/theme";

const PRODUCTS_PER_PAGE = 24;

// ✅ Memoized Products Grid Component - prevents re-render when sidebar/footer changes
const ProductsGrid = memo(
  ({
    products,
    viewMode,
    onAddToCart,
    onBuyNow,
    onNavigate,
    isInWishlist,
    toggleWishlist,
    isToggling,
    isAddingToCart,
    isFetching,
    hasMore,
    t,
    sentinelRef,
  }: any) => {
    return (
      <>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              viewMode === "list"
                ? "1fr"
                : {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
            gap: 2,
          }}
        >
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              isInWishlist={isInWishlist}
              toggleWishlist={toggleWishlist}
              isToggling={isToggling}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onNavigate={onNavigate}
              t={t}
              isAddingToCart={isAddingToCart(product.id)}
              viewMode={viewMode}
            />
          ))}
        </Box>

        {/* Sentinel element for infinite scroll - placed at end of grid */}
        <Box ref={sentinelRef} sx={{ height: 0, mt: 2 }} />

        {/* Loading indicator when fetching more products */}
        {isFetching && products.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 3,
              mt: 2,
            }}
          >
            <CircularProgress size={30} sx={{ color: tokens.accent }} />
          </Box>
        )}

        {/* End of results message */}
        {!hasMore && products.length > 0 && !isFetching && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("common.endOfResults")}
            </Typography>
          </Box>
        )}
      </>
    );
  },
);

ProductsGrid.displayName = "ProductsGrid";

const ProductsPage = () => {
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for search only
  const { searchQuery = "" } = useSearch();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchQuery || "",
  );
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter state
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 10000,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Fetch categories from API (same as HomePage)
  const { data: categoriesData = [] } = useCategories();
  const categories = useMemo(
    () => categoriesData.map((c) => c.name),
    [categoriesData],
  );

  // Combine all products from paginated responses
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track if we should fetch more pages
  const shouldFetchMore = useRef(true);
  const currentPage = useRef(1);

  // Debounce search query and reset pagination only when query actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextQuery = searchQuery || "";

      setDebouncedSearchQuery((prev) => {
        if (prev === nextQuery) return prev;
        setPage(1);
        setAllProducts([]);
        return nextQuery;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    currentPage.current = 1;
    shouldFetchMore.current = true;
    setAllProducts([]);
  }, [priceRange, selectedRatings, selectedCategories, sortBy]);

  // Get cart context
  const { cart, addToCart, isAddingToCart } = useCart();

  // Fetch products for current page
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "products",
      debouncedSearchQuery,
      page,
      priceRange,
      selectedRatings,
      selectedCategories,
      sortBy,
    ],
    queryFn: () =>
      productsApi.getAll({
        search: debouncedSearchQuery,
        page,
        limit: PRODUCTS_PER_PAGE,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating:
          selectedRatings.length > 0 ? Math.max(...selectedRatings) : undefined,
        category:
          selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        sortBy: sortBy !== "popularity" ? sortBy : undefined,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Accumulate products from all pages as user scrolls
  useEffect(() => {
    if (!response) return;

    const products = response.products || [];
    const total = Number(response.total ?? products.length);
    setTotalProducts(total);

    if (page === 1) {
      // First page: replace all (including empty results)
      setAllProducts(products);
      // ✅ Only set hasMore = false if we got fewer products than requested
      // This means we're on the last page
      shouldFetchMore.current = products.length >= PRODUCTS_PER_PAGE;
    } else if (products.length > 0) {
      // Subsequent pages: append new products (avoid duplicates)
      setAllProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = products.filter((p: any) => !existingIds.has(p.id));
        // ✅ If we got fewer products than requested, we're on the last page
        shouldFetchMore.current = newProducts.length >= PRODUCTS_PER_PAGE;
        return [...prev, ...newProducts];
      });
    }
  }, [response, page]);

  // Update hasMore based on ref (one-way sync from ref to state)
  useEffect(() => {
    setHasMore(shouldFetchMore.current);
  }, [response]);

  // ✅ Keep page ref in sync with page state
  useEffect(() => {
    currentPage.current = page;
  }, [page]);

  // ✅ Use Intersection Observer for infinite scroll (stable dependencies)
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger once when sentinel becomes visible
        if (
          entries[0].isIntersecting &&
          shouldFetchMore.current &&
          !isFetching &&
          currentPage.current === page
        ) {
          currentPage.current = page + 1;
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before reaching the sentinel
        threshold: 0,
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, isFetching]);

  // Filter handlers with useCallback
  const isFiltersActive = useMemo(
    () =>
      priceRange[0] > 0 ||
      priceRange[1] < 10000 ||
      selectedRatings.length > 0 ||
      selectedCategories.length > 0 ||
      sortBy !== "popularity",
    [priceRange, selectedRatings, selectedCategories, sortBy],
  );

  const handleClearFilters = useCallback(() => {
    setPriceRange([0, 10000]);
    setTempPriceRange([0, 10000]);
    setSelectedRatings([]);
    setSelectedCategories([]);
    setSortBy("popularity");
  }, []);

  const handleBuyNow = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      const cartItem = cart?.items?.find(
        (item) => item.productId === productId,
      );
      if (!cartItem) {
        await addToCart({ productId, quantity: 1 });
      }
      navigate("/cart");
    },
    [isAuthenticated, cart, addToCart, navigate],
  );

  const handleAddToCart = useCallback(
    (productId: string) => {
      return addToCart({ productId, quantity: 1 });
    },
    [addToCart],
  );

  const handleNavigate = useCallback(
    (productId: string) => {
      navigate(`/products/${productId}`);
    },
    [navigate],
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
            flexWrap: "wrap",
            gap: 2,
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

          {/* Grid / List Toggle */}
          {!isMobile && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
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
            <Box sx={{ ml: "auto" }}>
              <IconButton
                onClick={() => setFilterDrawerOpen(true)}
                sx={{
                  border: `2px solid ${tokens.accent}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: tokens.accent,
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: tokens.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#FFF3E0",
                    boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
                  },
                }}
              >
                🔽 {t("common.filters")}
                {isFiltersActive && (
                  <Box
                    sx={{
                      ml: 1,
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: tokens.accent,
                    }}
                  />
                )}
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Product count */}
        {!isLoading && allProducts.length > 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            {t("common.showingXofY", {
              shown: allProducts.length,
              total: totalProducts,
            })}
          </Typography>
        )}
      </Box>

      {/* Loading Initial Products */}
      {isLoading && page === 1 ? (
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
          {/* Main Layout: Two-Section Flex for Desktop, Single Column for Mobile */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Desktop Filter Sidebar - Left Section */}
            {!isMobile && (
              <Box
                sx={{
                  width: { md: "280px", lg: "300px" },
                  flexShrink: 0,
                }}
              >
                <FilterSidebar
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  tempPriceRange={tempPriceRange}
                  priceRange={priceRange}
                  onTempPriceChange={setTempPriceRange}
                  onPriceCommit={setPriceRange}
                  selectedRatings={selectedRatings}
                  onRatingsChange={setSelectedRatings}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  categories={categories}
                  isFiltersActive={isFiltersActive}
                  onClearFilters={handleClearFilters}
                  t={t}
                />
              </Box>
            )}

            {/* Mobile Filter Drawer */}
            <Drawer
              anchor="left"
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              keepMounted
              disableEscapeKeyDown={false}
              sx={{
                "& .MuiDrawer-paper": {
                  width: { xs: "100%", sm: 320 },
                  backgroundColor: tokens.white,
                  zIndex: 1300,
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 20px",
                  borderBottom: `2px solid ${tokens.gray200}`,
                  backgroundColor: tokens.white,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Box>
                  <Typography
                    fontWeight={700}
                    fontSize="20px"
                    sx={{ color: "text.primary" }}
                  >
                    {t("common.filters")}
                  </Typography>
                  {isFiltersActive && (
                    <Typography variant="caption" sx={{ color: tokens.accent }}>
                      {t("common.filtersActive", "Filters Active")} ✓
                    </Typography>
                  )}
                </Box>
                <IconButton
                  onClick={() => setFilterDrawerOpen(false)}
                  sx={{
                    color: "text.primary",
                    "&:hover": {
                      backgroundColor: tokens.gray100,
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  padding: "20px",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <FilterSidebar
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  tempPriceRange={tempPriceRange}
                  priceRange={priceRange}
                  onTempPriceChange={setTempPriceRange}
                  onPriceCommit={setPriceRange}
                  selectedRatings={selectedRatings}
                  onRatingsChange={setSelectedRatings}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  categories={categories}
                  isFiltersActive={isFiltersActive}
                  onClearFilters={handleClearFilters}
                  t={t}
                  hideHeader={true}
                  sx={{
                    position: "static",
                    maxHeight: "none",
                    border: "none",
                    backgroundColor: "transparent",
                    padding: 0,
                    borderRadius: 0,
                    overflowY: "visible",
                  }}
                />
              </Box>
            </Drawer>

            {/* Products Section - Right Section */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              {allProducts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 12 }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {t("common.noProductsFound")}
                  </Typography>
                </Box>
              ) : (
                <ProductsGrid
                  products={allProducts}
                  viewMode={viewMode}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onNavigate={handleNavigate}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                  isToggling={isToggling}
                  isAddingToCart={isAddingToCart}
                  isFetching={isFetching}
                  hasMore={hasMore}
                  t={t}
                  sentinelRef={sentinelRef}
                />
              )}
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProductsPage;
