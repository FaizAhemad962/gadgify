import { useTranslation } from "react-i18next";
import { Container, Box, Typography } from "@mui/material";
import { Business } from "@mui/icons-material";
import { tokens } from "../../theme/theme";

interface Brand {
  id: string;
  name: string;
  logo?: string;
  color?: string;
}

interface FeaturedBrandsProps {
  title?: string;
  description?: string;
  brands?: Brand[];
}

// Default brands - replace with API data when available
const DEFAULT_BRANDS: Brand[] = [
  { id: "1", name: "Samsung", color: tokens.primary },
  { id: "2", name: "Apple", color: tokens.gray800 },
  { id: "3", name: "Sony", color: tokens.accent },
  { id: "4", name: "LG", color: tokens.secondary },
  { id: "5", name: "Lenovo", color: tokens.primary },
  { id: "6", name: "Dell", color: tokens.primary },
  { id: "7", name: "HP", color: tokens.secondary },
  { id: "8", name: "realme", color: tokens.accent },
];

const FeaturedBrands: React.FC<FeaturedBrandsProps> = ({
  title = "common.featuredBrands",
  description = "common.featuredBrandsDesc",
  brands = DEFAULT_BRANDS,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ bgcolor: tokens.gray50, py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Business sx={{ color: tokens.primary, fontSize: 28 }} />
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              {t(title)}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
          >
            {t(description)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {brands.map((brand) => (
            <Box
              key={brand.id}
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: `2px solid ${tokens.gray200}`,
                transition: "all 0.25s",
                p: 3,
                borderRadius: 2,
                "&:hover": {
                  borderColor: brand.color || tokens.primary,
                  boxShadow: `0 8px 24px ${brand.color || tokens.primary}22`,
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Box sx={{ textAlign: "center", width: "100%" }}>
                {brand.logo ? (
                  <Box
                    component="img"
                    src={brand.logo}
                    alt={brand.name}
                    sx={{
                      maxWidth: "100%",
                      height: 80,
                      objectFit: "contain",
                      mb: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      bgcolor: `${brand.color || tokens.primary}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1,
                    }}
                  >
                    <Business
                      sx={{
                        color: brand.color || tokens.primary,
                        fontSize: 40,
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{ color: "text.primary" }}
                >
                  {brand.name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedBrands;
