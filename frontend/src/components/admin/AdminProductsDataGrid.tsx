import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Skeleton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { AppDataGrid } from "../ui/AppDataGrid";
import type { Product } from "../../types";
import { tokens } from "../../theme/theme";

interface AdminProductsDataGridProps {
  products: Product[];
  isLoading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AdminProductsDataGrid = ({
  products,
  isLoading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: AdminProductsDataGridProps) => {
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    {
      field: "mediaImagePreview",
      headerName: t("admin.image"),
      minWidth: 80,
      maxWidth: 100,
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        if (!params || !params.row)
          return <Skeleton variant="rectangular" width={50} height={50} />;
        const media = Array.isArray(params.row.media) ? params.row.media : [];
        const img =
          media.find(
            (m: { type: string; isPrimary?: boolean }) =>
              m.type === "image" && m.isPrimary,
          ) ||
          media.find(
            (m: { type: string; isPrimary?: boolean }) => m.type === "image",
          );
        if (!img || !img.url) {
          return <Skeleton variant="rectangular" width={50} height={50} />;
        }
        return (
          <Box
            component="img"
            src={img.url}
            alt={params.row?.name || ""}
            sx={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "6px",
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        );
      },
    },
    {
      field: "name",
      headerName: t("admin.name"),
      minWidth: 200,
      maxWidth: 300,
      flex: 1.5,
      editable: false,
    },
    {
      field: "category",
      headerName: t("admin.category"),
      minWidth: 120,
      maxWidth: 160,
      flex: 1,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <span>{t(`categories.${params.value}`)}</span>
      ),
    },
    {
      field: "price",
      headerName: t("admin.price"),
      minWidth: 100,
      maxWidth: 130,
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.accent, fontWeight: "700" }}>
          ₹{params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: "stock",
      headerName: t("admin.stock"),
      minWidth: 80,
      maxWidth: 110,
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (
        <span
          style={{
            color: params.value > 0 ? tokens.success : tokens.error,
            fontWeight: "600",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: t("admin.actions"),
      minWidth: 120,
      maxWidth: 140,
      flex: 0.8,
      sortable: false,
      filterable: false,
      align: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={() => onEdit(params.row)}
            sx={{
              width: "32px",
              height: "32px",
              color: tokens.secondary,
              "&:hover": {
                bgcolor: `${tokens.secondary}15`,
              },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(params.row.id);
            }}
            sx={{
              width: "32px",
              height: "32px",
              color: tokens.error,
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AppDataGrid
      rows={products as unknown as (Record<string, unknown> & { id: string })[]}
      columns={columns}
      isLoading={isLoading}
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};
