/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Skeleton,
} from "@mui/material";
import { VerifiedUser, Favorite } from "@mui/icons-material";
import { productsApi } from "../../api/products";
import { tokens } from "../../theme/theme";

interface CustomerHighlight {
  id: string;
  name: string;
  city: string;
  avatar: string;
  rating: number;
  review: string;
  purchase: string;
  verified: boolean;
}

interface CustomerHighlightsProps {
  title?: string;
  description?: string;
  limit?: number;
}

const CustomerHighlights: React.FC<CustomerHighlightsProps> = ({
  title = "common.topCustomerStories",
  description = "common.topCustomerStoriesDesc",
  limit = 3,
}) => {
  const { t } = useTranslation();

  // Fetch products with ratings to get top customer reviews
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["top-rated-products"],
    queryFn: () => productsApi.getAll({ limit: 10 }),
    staleTime: 15 * 60 * 1000,
  });

  const products = productsData?.products || [];

  // Transform product ratings into customer highlights - get top 3 rated products with reviews
  const highlights: CustomerHighlight[] = products
    .slice(0, limit)
    .filter((p: any) => p && p.topRating)
    .map((product, idx) => {
      const topRating = product?.topRating;
      if (!topRating) return null;

      const userName = topRating.user?.name || `Customer ${idx + 1}`;
      const userCity = topRating.user?.city || "Maharashtra";
      const initials = userName
        .split(" ")
        .map((n: any) => n[0])
        .join("");

      return {
        id: topRating.id || `${idx}-rating`,
        name: userName,
        city: userCity,
        avatar: initials || "C",
        rating: topRating.rating || 5,
        review: topRating.comment || "Amazing product!",
        purchase: product.name,
        verified: true,
      };
    })
    .filter(Boolean) as CustomerHighlight[];

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: tokens.gray50, py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Skeleton
              variant="text"
              width={300}
              height={40}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width={500}
              height={20}
              sx={{ mx: "auto" }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            // eslint-disable-next-line @typescript-eslint/no-explicit-any,
            @typescript-eslint/no-explicit-any
            {[0, 1, 2].map((_: any, i: number) => (
              <Box key={i}>
                <Skeleton variant="rounded" height={300} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

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
            <Favorite sx={{ color: tokens.error, fontSize: 28 }} />
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
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {highlights.length > 0 ? (
            highlights.map((highlight) => (
              <Box key={highlight.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                    border: `2px solid ${tokens.gray200}`,
                    transition: "all 0.25s",
                    position: "relative",
                    "&:hover": {
                      borderColor: tokens.accent,
                      boxShadow: `0 12px 32px ${tokens.accent}20`,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  {/* Verified Badge */}
                  {highlight.verified && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: tokens.success,
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      <VerifiedUser sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight="700">
                        {t("common.verified")}
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ p: 0, mb: 2 }}>
                    {/* Header with Avatar */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: tokens.primary,
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          width: 48,
                          height: 48,
                        }}
                      >
                        {highlight.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="700"
                          sx={{ color: "text.primary" }}
                        >
                          {highlight.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {highlight.city}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating */}
                    <Rating
                      value={highlight.rating}
                      readOnly
                      size="small"
                      sx={{ mb: 1.5 }}
                    />

                    {/* Review Text */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                        mb: 2,
                        fontStyle: "italic",
                        minHeight: 80,
                      }}
                    >
                      "{highlight.review}"
                    </Typography>

                    {/* Purchase Info */}
                    {highlight.purchase && (
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: tokens.gray50,
                          borderRadius: 1,
                          borderLeft: `3px solid ${tokens.primary}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontWeight: 600 }}
                        >
                          {t("common.purchasedItem")}:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: tokens.primary, fontWeight: 700 }}
                        >
                          {highlight.purchase}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))
          ) : (
            <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                {t("common.noReviewsYet")}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CustomerHighlights;
