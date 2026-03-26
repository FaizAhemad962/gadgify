import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Avatar,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../api/products";
import { useSearch } from "../../context/SearchContext";
import { tokens } from "@/theme/theme";

interface Suggestion {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
}

const SearchAutocomplete = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSearchQuery } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(inputValue, 300);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["product-suggestions", debouncedQuery],
    queryFn: () => productsApi.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const handleSelect = useCallback(
    (_: unknown, value: Suggestion | string | null) => {
      if (!value) return;
      if (typeof value === "string") {
        // User pressed Enter with free text
        setSearchQuery(value);
        navigate("/products");
      } else {
        // User selected a suggestion — go to product detail
        navigate(`/products/${value.id}`);
      }
      setInputValue("");
      setOpen(false);
    },
    [navigate, setSearchQuery],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && suggestions.length === 0) {
      setSearchQuery(inputValue.trim());
      navigate("/products");
      setInputValue("");
      setOpen(false);
    }
  };

  return (
    <Autocomplete<Suggestion, false, false, true>
      freeSolo
      open={open && inputValue.length >= 2}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={suggestions}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.name
      }
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={handleSelect}
      onKeyDown={handleKeyDown}
      filterOptions={(x) => x} // Server-side filtering
      noOptionsText={
        inputValue.length >= 2
          ? t("search.noResults")
          : t("search.typeToSearch")
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1,
              px: 1.5,
              "&:hover": { bgcolor: `${tokens.primary}08` },
            }}
          >
            <Avatar
              src={option.image || undefined}
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: tokens.gray100,
                fontSize: "0.75rem",
              }}
            >
              {option.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ color: tokens.gray900 }}
              >
                {option.name}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.gray500 }}>
                {option.category}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: tokens.accent, whiteSpace: "nowrap" }}
            >
              ₹{option.price.toLocaleString()}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t("search.placeholder")}
          size="small"
          sx={{
            width: { xs: 200, sm: 280, md: 360, lg: 420 },
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 2,
              color: "#fff",
              height: 40,
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(255,255,255,0.6)",
              },
              "& input::placeholder": {
                color: "rgba(255,255,255,0.6)",
                opacity: 1,
              },
            },
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: `1px solid ${tokens.gray200}`,
            mt: 1,
          },
        },
      }}
    />
  );
};

// Simple debounce hook
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default SearchAutocomplete;
