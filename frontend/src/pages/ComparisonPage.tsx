import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";
import { ArrowBack, Close } from "@mui/icons-material";
import { productsApi } from "../api/products";
import { useCompare } from "../context/CompareContext";
import { tokens } from "@/theme/theme";

import type { Product } from "../types";

const ComparisonPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const productQueries = useQueries({
    queries: compareIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productsApi.getById(id),
    })),
  });

  const isLoading = productQueries.some((q) => q.isLoading);
  const products = productQueries.filter((q) => q.data).map((q) => q.data!);

  if (compareIds.length < 2) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          {t("compare.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t("compare.needAtLeast")}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/products")}>
          {t("compare.browseProducts")}
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const rows: {
    label: string;
    key: string;
    render?: (p: Product) => React.ReactNode;
  }[] = [
    {
      label: t("compare.image"),
      key: "image",
      render: (p) => {
        const img =
          p.media?.find(
            (m: { isPrimary?: boolean; url?: string }) => m.isPrimary,
          )?.url ||
          p.media?.[0]?.url ||
          "";
        return (
          <Box
            component="img"
            src={img}
            alt={p.name}
            sx={{ width: 120, height: 120, objectFit: "contain" }}
          />
        );
      },
    },
    { label: t("compare.name"), key: "name" },
    {
      label: t("compare.price"),
      key: "price",
      render: (p) => (
        <Typography fontWeight={700} color="primary">
          ₹{p.price.toLocaleString()}
        </Typography>
      ),
    },
    { label: t("compare.category"), key: "category" },
    {
      label: t("compare.rating"),
      key: "rating",
      render: (p) =>
        `${p.averageRating?.toFixed(1) || "—"} ★ (${p.totalRatings || 0})`,
    },
    {
      label: t("compare.stock"),
      key: "stock",
      render: (p) =>
        p.stock > 0 ? (
          <Chip
            label={`${p.stock} ${t("compare.available")}`}
            size="small"
            sx={{ bgcolor: tokens.successLight, color: tokens.success }}
          />
        ) : (
          <Chip
            label={t("products.outOfStock")}
            size="small"
            sx={{ bgcolor: tokens.errorLight, color: tokens.error }}
          />
        ),
    },
    {
      label: t("compare.colors"),
      key: "colors",
      render: (p) => p.colors || "—",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            {t("common.back")}
          </Button>
          <Typography variant="h5" fontWeight={700}>
            {t("compare.title")}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => {
            clearCompare();
            navigate("/products");
          }}
        >
          {t("compare.clearAll")}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                {t("compare.feature")}
              </TableCell>
              {products.map((p) => (
                <TableCell key={p.id} align="center" sx={{ minWidth: 180 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => removeFromCompare(p.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key} hover>
                <TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }}>
                  {row.label}
                </TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} align="center">
                    {row.render ? row.render(p) : (p as never)[row.key] || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ComparisonPage;
