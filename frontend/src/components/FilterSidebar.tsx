import { memo, useCallback, useRef } from "react";
import type { FC, SyntheticEvent } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
  TextField,
  IconButton,
  type SxProps,
  type Theme,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { tokens } from "@/theme/theme";

export type SortOption =
  | "popularity"
  | "price-low"
  | "price-high"
  | "newest"
  | "rating";

export interface FilterSidebarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  tempPriceRange: [number, number];
  priceRange: [number, number];
  onTempPriceChange: (range: [number, number]) => void;
  onPriceCommit: (range: [number, number]) => void;
  selectedRatings: number[];
  onRatingsChange: (ratings: number[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  categories: string[];
  isFiltersActive: boolean;
  onClearFilters: () => void;
  /** Optional translation function — falls back to English labels */
  t?: (key: string) => string;
  /** Optional custom styles to override default */
  sx?: SxProps<Theme>;
  /** Hide the header - useful when used in drawer */
  hideHeader?: boolean;
}

export const FilterSidebar: FC<FilterSidebarProps> = memo(
  ({
    sortBy,
    onSortChange,
    tempPriceRange,
    onTempPriceChange,
    onPriceCommit,
    selectedRatings,
    onRatingsChange,
    selectedCategories,
    onCategoriesChange,
    categories,
    isFiltersActive,
    onClearFilters,
    t,
    sx,
    hideHeader = false,
  }) => {
    const label = (key: string, fallback: string) =>
      t ? t(key) || fallback : fallback;

    /* ── Price slider handlers ── */
    const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePriceChange = useCallback(
      (_: Event, newValue: number | number[]) => {
        onTempPriceChange(newValue as [number, number]);
      },
      [onTempPriceChange],
    );

    const handlePriceCommitted = useCallback(
      (_: Event | SyntheticEvent, newValue: number | number[]) => {
        if (priceTimer.current) clearTimeout(priceTimer.current);
        priceTimer.current = setTimeout(() => {
          onPriceCommit(newValue as [number, number]);
        }, 300);
      },
      [onPriceCommit],
    );

    /* ── Manual price input handlers ── */
    const handleMinPriceChange = useCallback(
      (value: string) => {
        const num = parseInt(value, 10) || 0;
        const clipped = Math.max(0, Math.min(num, tempPriceRange[1]));
        onTempPriceChange([clipped, tempPriceRange[1]]);
      },
      [tempPriceRange, onTempPriceChange],
    );

    const handleMaxPriceChange = useCallback(
      (value: string) => {
        const num = parseInt(value, 10) || 10000;
        const clipped = Math.min(10000, Math.max(num, tempPriceRange[0]));
        onTempPriceChange([tempPriceRange[0], clipped]);
      },
      [tempPriceRange, onTempPriceChange],
    );

    const handleMinIncrement = useCallback(() => {
      const newMin = Math.min(tempPriceRange[0] + 100, tempPriceRange[1]);
      onTempPriceChange([newMin, tempPriceRange[1]]);
      onPriceCommit([newMin, tempPriceRange[1]]);
    }, [tempPriceRange, onTempPriceChange, onPriceCommit]);

    const handleMinDecrement = useCallback(() => {
      const newMin = Math.max(0, tempPriceRange[0] - 100);
      onTempPriceChange([newMin, tempPriceRange[1]]);
      onPriceCommit([newMin, tempPriceRange[1]]);
    }, [tempPriceRange, onTempPriceChange, onPriceCommit]);

    const handleMaxIncrement = useCallback(() => {
      const newMax = Math.min(10000, tempPriceRange[1] + 100);
      onTempPriceChange([tempPriceRange[0], newMax]);
      onPriceCommit([tempPriceRange[0], newMax]);
    }, [tempPriceRange, onTempPriceChange, onPriceCommit]);

    const handleMaxDecrement = useCallback(() => {
      const newMax = Math.max(tempPriceRange[0], tempPriceRange[1] - 100);
      onTempPriceChange([tempPriceRange[0], newMax]);
      onPriceCommit([tempPriceRange[0], newMax]);
    }, [tempPriceRange, onTempPriceChange, onPriceCommit]);

    /* ── Rating toggle ── */
    const handleRatingToggle = useCallback(
      (rating: number, checked: boolean) => {
        onRatingsChange(
          checked
            ? [...selectedRatings, rating]
            : selectedRatings.filter((r) => r !== rating),
        );
      },
      [selectedRatings, onRatingsChange],
    );

    /* ── Category toggle ── */
    const handleCategoryToggle = useCallback(
      (category: string, checked: boolean) => {
        onCategoriesChange(
          checked
            ? [...selectedCategories, category]
            : selectedCategories.filter((c) => c !== category),
        );
      },
      [selectedCategories, onCategoriesChange],
    );

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "20px",
          backgroundColor: tokens.white,
          borderRadius: "8px",
          border: `1px solid ${tokens.gray200}`,
          position: "sticky",
          top: 80,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": hideHeader
            ? { display: "none" }
            : { width: "6px" },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: tokens.gray200,
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: tokens.gray300,
            },
          },
          ...sx,
        }}
      >
        {!hideHeader && (
          <Typography
            variant="h6"
            fontWeight={700}
            fontSize="16px"
            sx={{ mb: 2 }}
          >
            {label("common.filters", "Filters")}
          </Typography>
        )}

        {/* Sort Dropdown Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {label("common.sortBy", "Sort By")}
          </Typography>
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
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
              {label("common.popularity", "Popularity")}
            </MenuItem>
            <MenuItem value="price-low">
              {label("common.priceLowToHigh", "Price: Low to High")}
            </MenuItem>
            <MenuItem value="price-high">
              {label("common.priceHighToLow", "Price: High to Low")}
            </MenuItem>
            <MenuItem value="newest">
              {label("common.newestFirst", "Newest First")}
            </MenuItem>
            <MenuItem value="rating">
              {label("common.bestRatings", "Best Ratings")}
            </MenuItem>
          </Select>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Price Range Filter Section */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {label("common.priceRange", "Price Range")}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: tokens.accent }}
            >
              ₹{tempPriceRange[0].toLocaleString()} - ₹
              {tempPriceRange[1].toLocaleString()}
            </Typography>
          </Box>
          <Slider
            value={tempPriceRange}
            onChange={handlePriceChange}
            onChangeCommitted={handlePriceCommitted}
            valueLabelDisplay="off"
            min={0}
            max={5000}
            step={100}
            sx={{
              width: "90%",
              marginLeft: 1,
              "& .MuiSlider-thumb": {
                width: 20,
                height: 20,
                backgroundColor: tokens.accent,
                border: `2px solid white`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15)`,
                transition: "all 0.2s ease",
                "&:hover": {
                  width: 24,
                  height: 24,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.25)`,
                },
                "&.Mui-active": {
                  width: 26,
                  height: 26,
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3)`,
                },
              },
              "& .MuiSlider-track": {
                height: 6,
                backgroundColor: tokens.accent,
                border: "none",
              },
              "& .MuiSlider-rail": {
                height: 6,
                backgroundColor: tokens.gray200,
                opacity: 1,
              },
              "& .MuiSlider-mark": {
                display: "none",
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              color: tokens.gray400,
              fontStyle: "italic",
            }}
          >
            {label(
              "common.dragToFilter",
              "Drag the sliders to filter by price",
            )}
          </Typography>

          {/* Manual Price Input Fields */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "column" },
              gap: 1.5,
              mt: 2,
              alignItems: { xs: "flex-end", sm: "stretch" },
            }}
          >
            {/* Min Price Input */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontSize: "11px" }}>
                {label("common.minPrice", "Min")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={handleMinDecrement}
                  sx={{
                    padding: "4px",
                    color: tokens.accent,
                    border: `1px solid ${tokens.gray200}`,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#FFF3E0",
                    },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  type="number"
                  value={tempPriceRange[0]}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  onBlur={() => onPriceCommit(tempPriceRange)}
                  size="small"
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 10000,
                    step: 100,
                    style: { textAlign: "center" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "12px",
                      padding: "2px 4px",
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleMinIncrement}
                  sx={{
                    padding: "4px",
                    color: tokens.accent,
                    border: `1px solid ${tokens.gray200}`,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#FFF3E0",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Max Price Input */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontSize: "11px" }}>
                {label("common.maxPrice", "Max")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={handleMaxDecrement}
                  sx={{
                    padding: "4px",
                    color: tokens.accent,
                    border: `1px solid ${tokens.gray200}`,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#FFF3E0",
                    },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  type="number"
                  value={tempPriceRange[1]}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  onBlur={() => onPriceCommit(tempPriceRange)}
                  size="small"
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 10000,
                    step: 100,
                    style: { textAlign: "center" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "12px",
                      padding: "2px 4px",
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleMaxIncrement}
                  sx={{
                    padding: "4px",
                    color: tokens.accent,
                    border: `1px solid ${tokens.gray200}`,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#FFF3E0",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Rating Filter Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
            {label("common.rating", "Rating")}
          </Typography>
          {[5, 4, 3, 2, 1].map((rating) => (
            <FormControlLabel
              key={rating}
              control={
                <Checkbox
                  checked={selectedRatings.includes(rating)}
                  onChange={(e) => handleRatingToggle(rating, e.target.checked)}
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

        {categories.length > 0 && <Divider sx={{ my: 2 }} />}

        {/* Category Filter Section */}
        {categories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
              {label("common.category", "Category")}
            </Typography>
            {categories.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryToggle(category, e.target.checked)
                    }
                    size="small"
                  />
                }
                label={<Typography variant="body2">{category}</Typography>}
              />
            ))}
          </Box>
        )}

        {isFiltersActive && <Divider sx={{ my: 2 }} />}

        {/* Clear Filters Button */}
        {isFiltersActive && (
          <Button
            variant="outlined"
            fullWidth
            onClick={onClearFilters}
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
            {label("common.clearAllFilters", "Clear All Filters")}
          </Button>
        )}
      </Box>
    );
  },
);

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;
