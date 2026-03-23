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

interface FilterSidebarProps {
  sortBy: "popularity" | "price-low" | "price-high" | "newest" | "rating";
  setSortBy: (
    value: "popularity" | "price-low" | "price-high" | "newest" | "rating",
  ) => void;
  tempPriceRange: [number, number];
  setTempPriceRange: (range: [number, number]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
  isFiltersActive: boolean;
  onClearFilters: () => void;
  setDisplayCount: (count: number) => void;
}

const PRODUCTS_PER_PAGE = 12;

export const FilterSidebar = ({
  sortBy,
  setSortBy,
  tempPriceRange,
  setTempPriceRange,
  setPriceRange,
  selectedRating,
  setSelectedRating,
  selectedCategory,
  setSelectedCategory,
  categories,
  isFiltersActive,
  onClearFilters,
  setDisplayCount,
}: FilterSidebarProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        p: 2.5,
        bgcolor: tokens.white,
        borderRadius: 3,
        border: `1px solid ${tokens.gray200}`,
        height: "fit-content",
        position: "sticky",
        top: 20,
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        zIndex: 10,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        fontSize="0.95rem"
        color={tokens.gray900}
      >
        Filters
      </Typography>

      {/* Sort Dropdown */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Sort By
        </Typography>
        <Select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as
                | "popularity"
                | "price-low"
                | "price-high"
                | "newest"
                | "rating",
            )
          }
          fullWidth
          size="small"
          sx={{
            borderRadius: 2,
            bgcolor: tokens.gray50,
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
            setDisplayCount(PRODUCTS_PER_PAGE);
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
            color: tokens.accent,
            "& .MuiSlider-thumb": {
              bgcolor: tokens.accent,
              "&:hover, &.Mui-focusVisible": {
                boxShadow: `0 0 0 6px ${tokens.accent}22`,
              },
            },
            "& .MuiSlider-track": {
              bgcolor: tokens.accent,
            },
            "& .MuiSlider-rail": {
              bgcolor: tokens.gray200,
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
          onClick={onClearFilters}
          sx={{
            borderColor: tokens.accent,
            color: tokens.accent,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: "none",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: `${tokens.accent}0A`,
              borderColor: tokens.accent,
            },
          }}
        >
          Clear All Filters
        </Button>
      )}
    </Box>
  );
};

export default FilterSidebar;
