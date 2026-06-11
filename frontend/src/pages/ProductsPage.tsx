/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
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
} from "@/mui/material";
import {
  ViewModule,
  ViewList,
  Close as CloseIcon,
} from "@/mui/icons";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearch } from "../context/SearchContext";
import { useCategories } from "@/hooks/useCategories";
import { ErrorHandler } from "../utils/errorHandler";
import ProductCard from "../components/ProductCard";
import { FilterSidebar, type SortOption } from "../components/FilterSidebar";
import ProductGridSkeleton from "../components/products/ProductGridSkeleton";
import { productGridColumns, productGridGap } from "@/components/products/productLayout";
import { tokens } from "@/theme/theme";

const PRODUCTS_PER_PAGE = 24;
const PRODUCTS_SCROLL_OFFSET = tokens.navbarHeightDesktop + 16;

const ProductsGrid = memo(
  ({
    products,
    viewMode,
    columns,
    onAddToCart,
    onBuyNow,
    onNavigate,
    isInWishlist,
    toggleWishlist,
    isToggling,
    isAddingToCart,
    isFetching,
    hasMore,
    onEndReached,
    t,
  }: any) => {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!hasMore || isFetching) return;

      const sentinel = sentinelRef.current;
      if (!sentinel) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) onEndReached();
        },
        { rootMargin: "600px 0px" },
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [hasMore, isFetching, onEndReached]);

    return (
      <>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              viewMode === "list"
                ? "1fr"
                : `repeat(${columns}, minmax(0, 1fr))`,
            gap: productGridGap,
            alignItems: "stretch",
          }}
        >
          {products.map((product: any) => (
            <Box
              key={product.id}
              sx={{
                minWidth: 0,
              }}
            >
              <ProductCard
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
            </Box>
          ))}
        </Box>

        <Box ref={sentinelRef} sx={{ height: "1px" }} />

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
            <CircularProgress size={30} sx={{ color: tokens.primary }} />
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
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

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
    tokens.defaultMinPrice,
    tokens.defaultMaxPrice,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    tokens.defaultMinPrice,
    tokens.defaultMaxPrice,
  ]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const productsSectionRef = useRef<HTMLDivElement | null>(null);
  const filterSignatureRef = useRef("");
  const pendingFilterScrollRef = useRef(false);

  // Fetch categories from API (same as HomePage)
  const { data: categoriesData = [] } = useCategories();
  const categories = useMemo(
    () => categoriesData.map((c) => c.name),
    [categoriesData],
  );

  // Combine all products from paginated responses
  const [allProducts, setAllProducts] = useState<any[]>([]);

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
    setAllProducts([]);
    setTotalProducts(0);
    setHasMore(false);
    setPage(1);
  }, [priceRange, selectedRatings, selectedCategories, sortBy]);

  const scrollProductsSectionIntoView = useCallback(() => {
    const target = productsSectionRef.current;
    if (!target) return;

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - PRODUCTS_SCROLL_OFFSET,
    );

    window.scrollTo({ top, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const signature = JSON.stringify({
      search: debouncedSearchQuery,
      priceRange,
      selectedRatings,
      selectedCategories,
      sortBy,
      viewMode,
    });

    if (!filterSignatureRef.current) {
      filterSignatureRef.current = signature;
      return;
    }

    if (filterSignatureRef.current === signature) return;
    filterSignatureRef.current = signature;
    pendingFilterScrollRef.current = true;
  }, [
    debouncedSearchQuery,
    priceRange,
    selectedRatings,
    selectedCategories,
    sortBy,
    viewMode,
  ]);

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

    // Track if we have more products to fetch
    const hasMoreProducts = products.length >= PRODUCTS_PER_PAGE;

    if (page === 1) {
      // First page: replace all products
      setAllProducts(products);
      setHasMore(hasMoreProducts);
      if (pendingFilterScrollRef.current) {
        pendingFilterScrollRef.current = false;
        requestAnimationFrame(scrollProductsSectionIntoView);
      }
    } else if (products.length > 0) {
      // Subsequent pages: append new products, avoiding duplicates
      setAllProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = products.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
      setHasMore(hasMoreProducts);
    } else {
      // No products on this page = we've reached the end
      setHasMore(false);
    }
  }, [response, page, scrollProductsSectionIntoView]);

  const loadMoreLockRef = useRef(false);

  useEffect(() => {
    if (!isFetching) loadMoreLockRef.current = false;
  }, [isFetching]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isFetching || loadMoreLockRef.current) return;
    loadMoreLockRef.current = true;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  // Filter handlers with useCallback
  const isFiltersActive = useMemo(
    () =>
      priceRange[0] > 0 ||
      priceRange[1] < tokens.defaultMaxPrice ||
      selectedRatings.length > 0 ||
      selectedCategories.length > 0 ||
      sortBy !== "popularity",
    [priceRange, selectedRatings, selectedCategories, sortBy],
  );

  const handleClearFilters = useCallback(() => {
    setPriceRange([tokens.defaultMinPrice, tokens.defaultMaxPrice]);
    setTempPriceRange([tokens.defaultMinPrice, tokens.defaultMaxPrice]);
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
      navigate("/checkout");
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
    <Container
      maxWidth={false}
      sx={{
        py: { xs: 3, md: 5 },
        px: tokens.pagePaddingX,
        maxWidth: tokens.appMaxWidth,
      }}
    >
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
                  border: `2px solid ${tokens.primary}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: tokens.primary,
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: tokens.white,
                  transition:
                    "background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease",
                  "&:hover": {
                    backgroundColor: "#FFF3E0",
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
                      backgroundColor: tokens.primary,
                    }}
                  />
                )}
              </IconButton>
            </Box>
          )}
        </Box>
        {/* Product count */}
        {allProducts.length > 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            {t("common.showingXofY", {
              shown: allProducts.length,
              total: totalProducts,
            })}
          </Typography>
        )}
      </Box>

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
              width: { md: 260, lg: 280 },
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
                <Typography variant="caption" sx={{ color: tokens.primary }}>
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
          ref={productsSectionRef}
          sx={{
            flex: 1,
            minWidth: 0,
            overflowAnchor: "none",
            scrollMarginTop: `${PRODUCTS_SCROLL_OFFSET}px`,
          }}
        >
          {/* Show stable skeleton cards during the first product load */}
          {isLoading && page === 1 && allProducts.length === 0 ? (
            <ProductGridSkeleton
              count={viewMode === "list" ? 3 : isMdUp ? 6 : 4}
              columns={{
                xs: viewMode === "list" ? "1fr" : productGridColumns.xs,
                sm: viewMode === "list" ? "1fr" : productGridColumns.sm,
                md:
                  viewMode === "list"
                    ? "1fr"
                    : isLgUp
                      ? "repeat(4, 1fr)"
                      : "repeat(3, 1fr)",
              }}
            />
          ) : allProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 12 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {t("common.noProductsFound")}
              </Typography>
            </Box>
          ) : (
            <ProductsGrid
              products={allProducts}
              viewMode={viewMode}
              columns={viewMode === "list" ? 1 : isLgUp ? 4 : isMdUp ? 3 : 2}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onNavigate={handleNavigate}
              isInWishlist={isInWishlist}
              toggleWishlist={toggleWishlist}
              isToggling={isToggling}
              isAddingToCart={isAddingToCart}
              isFetching={isFetching}
              hasMore={hasMore}
              onEndReached={handleEndReached}
              t={t}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductsPage;
