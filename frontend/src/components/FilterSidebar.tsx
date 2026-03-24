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
} from "@mui/material";
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
          {label("common.filters", "Filters")}
        </Typography>

        {/* Sort Dropdown */}
        <Box>
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

        <Divider />

        {/* Price Range Filter */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
            {label("common.priceRange", "Price Range")}
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

        {/* Rating Filter (multi-select) */}
        <Box>
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

        <Divider />

        {/* Category Filter (multi-select) */}
        {categories.length > 0 && (
          <Box>
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

        <Divider />

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
