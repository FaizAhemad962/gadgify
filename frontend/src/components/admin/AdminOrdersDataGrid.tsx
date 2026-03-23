import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { Chip, Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppDataGrid } from "../ui/AppDataGrid";
import type { Order } from "../../types";
import { formatDate } from "../../utils/dateFormatter";
import { tokens } from "../../theme/theme";

interface AdminOrdersDataGridProps {
  orders: Order[];
  isLoading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void;
}

export const AdminOrdersDataGrid = ({
  orders,
  isLoading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onStatusChange,
}: AdminOrdersDataGridProps) => {
  const { t } = useTranslation();

  const getPaymentStatusColor = (
    status: string,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    const colors: Record<string, any> = {
      PENDING: "warning",
      COMPLETED: "success",
      FAILED: "error",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t("payment.pending"),
      COMPLETED: t("payment.completed"),
      FAILED: t("payment.failed"),
    };
    return statusMap[status] || status;
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: t("admin.orderId"),
      minWidth: 100,
      maxWidth: 120,
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.secondary, fontWeight: "600" }}>
          #{params.value?.substring(0, 8)}
        </span>
      ),
    },
    {
      field: "user",
      headerName: t("admin.customer"),
      minWidth: 140,
      maxWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.gray700 }}>
          {params.row.user?.name || "N/A"}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: t("admin.date"),
      minWidth: 100,
      maxWidth: 130,
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.gray500 }}>
          {formatDate(params.value, t)}
        </span>
      ),
    },
    {
      field: "items",
      headerName: t("admin.items"),
      minWidth: 70,
      maxWidth: 90,
      flex: 0.5,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.gray500, fontWeight: "500" }}>
          {params.row.items?.length || 0}
        </span>
      ),
    },
    {
      field: "total",
      headerName: t("admin.total"),
      minWidth: 100,
      maxWidth: 120,
      flex: 0.7,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.accent, fontWeight: "700" }}>
          ₹{params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: "hsn",
      headerName: "HSN",
      minWidth: 80,
      maxWidth: 100,
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.gray400 }}>{params.row.hsn || "N/A"}</span>
      ),
    },
    {
      field: "gst",
      headerName: "GST",
      minWidth: 70,
      maxWidth: 90,
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: tokens.gray400 }}>
          {params.row.gst ? `${params.row.gst}%` : "N/A"}
        </span>
      ),
    },
    {
      field: "paymentStatus",
      headerName: t("admin.payment"),
      minWidth: 120,
      maxWidth: 140,
      flex: 0.9,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getPaymentStatusLabel(params.value)}
          color={getPaymentStatusColor(params.value)}
          size="small"
          sx={{
            fontWeight: "600",
            minWidth: "100px",
            justifyContent: "center",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: t("admin.status"),
      minWidth: 140,
      maxWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Select
          value={params.row.status}
          onChange={(e) => onStatusChange(params.row.id, e.target.value as any)}
          size="small"
        >
          <MenuItem value="PENDING">{t("orders.pending")}</MenuItem>
          <MenuItem value="PROCESSING">{t("orders.processing")}</MenuItem>
          <MenuItem value="SHIPPED">{t("orders.shipped")}</MenuItem>
          <MenuItem value="DELIVERED">{t("orders.delivered")}</MenuItem>
          <MenuItem value="CANCELLED">{t("orders.cancelled")}</MenuItem>
        </Select>
      ),
    },
  ];

  return (
    <AppDataGrid
      rows={orders}
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
