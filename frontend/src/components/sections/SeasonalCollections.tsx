import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Box, Typography, Button, Skeleton } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { productsApi } from "../../api/products";
import { tokens } from "../../theme/theme";

interface SeasonalCollection {
  id: string;
  name: string;
  description: string;
  image?: string;
  color: string;
  query: string;
}

interface SeasonalCollectionsProps {
  title?: string;
  description?: string;
  collections?: SeasonalCollection[];
}

const DEFAULT_COLLECTIONS: SeasonalCollection[] = [
  {
    id: "1",
    name: "common.seasonal.summer",
    description: "common.seasonal.summerDesc",
    color: tokens.accent,
    query: "summer",
  },
  {
    id: "2",
    name: "common.seasonal.monsoon",
    description: "common.seasonal.monsoonDesc",
    color: tokens.info,
    query: "monsoon",
  },
  {
    id: "3",
    name: "common.seasonal.winter",
    description: "common.seasonal.winterDesc",
    color: tokens.primary,
    query: "winter",
  },
  {
    id: "4",
    name: "common.seasonal.diwali",
    description: "common.seasonal.diwaliDesc",
    color: tokens.secondary,
    query: "diwali",
  },
];

const SeasonalCollections: React.FC<SeasonalCollectionsProps> = ({
  title = "common.seasonal.title",
  description = "common.seasonal.description",
  collections = DEFAULT_COLLECTIONS,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: collectionData, isLoading } = useQuery({
    queryKey: ["seasonal-collections"],
    queryFn: () => productsApi.getAll({ limit: 4 }),
    staleTime: 10 * 60 * 1000,
  });

  const products = collectionData?.products || [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{ color: "text.primary", mb: 1 }}
        >
          🎄 {t(title)}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
        >
          {t(description)}
        </Typography>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {[...Array(4)].map((_: any, i: number) => (
            <Box key={i}>
              <Skeleton variant="rounded" height={300} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {collections.map((collection, index) => {
            const product = products[index];
            return (
              <Box
                key={collection.id}
                onClick={() =>
                  navigate(
                    `/products?search=${encodeURIComponent(collection.query)}`,
                  )
                }
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s",
                  border: `2px solid ${collection.color}30`,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: collection.color,
                    transform: "translateY(-6px)",
                    boxShadow: `0 12px 32px ${collection.color}30`,
                  },
                }}
              >
                {/* Background Image or Gradient */}
                {product?.media?.[0]?.url ? (
                  <Box
                    component="img"
                    src={product.media[0].url}
                    alt={collection.name}
                    sx={{ height: 200, width: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      background: `linear-gradient(135deg, ${collection.color}40 0%, ${collection.color}10 100%)`,
                    }}
                  />
                )}

                {/* Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)`,
                  }}
                />

                {/* Content */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    color: "white",
                    background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)`,
                    pb: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    {t(collection.name)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 1, opacity: 0.9 }}
                  >
                    {t(collection.description)}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                    sx={{
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    {t("common.explore")}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default SeasonalCollections;
