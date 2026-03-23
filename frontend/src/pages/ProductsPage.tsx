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
// FilterSidebar is defined inline below
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
    if (cat) setSelectedCategories([cat]);
    const sort = searchParams.get("sortBy");
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

  // Handle both array (old format) and object (new format) responses
  const products = Array.isArray(response)
    ? response
    : typeof response === "object" && response?.products
      ? response.products
      : [];
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

  // Debounced price commit — waits 400ms after the user stops dragging
  const priceCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePriceChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      setTempPriceRange(newValue as [number, number]);
    },
    [],
  );
  const handlePriceCommitted = useCallback(
    (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
      if (priceCommitTimer.current) clearTimeout(priceCommitTimer.current);
      priceCommitTimer.current = setTimeout(() => {
        setPriceRange(newValue as [number, number]);
        setDisplayCount(PRODUCTS_PER_PAGE);
      }, 300);
    },
    [],
  );

  // Filter sidebar as plain JSX (NOT a component function — avoids remount on every render)
  const filterSidebar = (
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
        position: "sticky",
        top: 20,
      }}
    >
      <Typography variant="h6" fontWeight={700} fontSize="16px">
        {t("common.filters") || "Filters"}
      </Typography>

      {/* Sort Dropdown */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          {t("common.sortBy") || "Sort By"}
        </Typography>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          fullWidth
          size="small"
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.gray200,
            },
          }}
        >
          <MenuItem value="popularity">
            {t("common.popularity") || "Popularity"}
          </MenuItem>
          <MenuItem value="price-low">
            {t("common.priceLowToHigh") || "Price: Low to High"}
          </MenuItem>
          <MenuItem value="price-high">
            {t("common.priceHighToLow") || "Price: High to Low"}
          </MenuItem>
          <MenuItem value="newest">
            {t("common.newestFirst") || "Newest First"}
          </MenuItem>
          <MenuItem value="rating">
            {t("common.bestRatings") || "Best Ratings"}
          </MenuItem>
        </Select>
      </Box>

      <Divider />

      {/* Price Range Filter */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
          {t("common.priceRange") || "Price Range"}
        </Typography>
        <Slider
          value={tempPriceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          marks={[
            { value: 0, label: "₹0" },
            { value: 10000, label: "₹10K" },
          ]}
          sx={{
            "& .MuiSlider-thumb": { backgroundColor: tokens.accent },
            "& .MuiSlider-track": { backgroundColor: tokens.accent },
            "& .MuiSlider-rail": { backgroundColor: tokens.gray200 },
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
          {t("common.rating") || "Rating"}
        </Typography>
        {[5, 4, 3, 2, 1].map((rating) => (
          <FormControlLabel
            key={rating}
            control={
              <Checkbox
                checked={selectedRatings.includes(rating)}
                onChange={(e) => {
                  setSelectedRatings((prev) =>
                    e.target.checked
                      ? [...prev, rating]
                      : prev.filter((r) => r !== rating),
                  );
                  setDisplayCount(PRODUCTS_PER_PAGE);
                }}
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
            {t("common.category") || "Category"}
          </Typography>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category as string)}
                  onChange={(e) => {
                    const cat = category as string;
                    setSelectedCategories((prev) =>
                      e.target.checked
                        ? [...prev, cat]
                        : prev.filter((c) => c !== cat),
                    );
                    setDisplayCount(PRODUCTS_PER_PAGE);
                  }}
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
          {t("common.clearAllFilters") || "Clear All Filters"}
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
