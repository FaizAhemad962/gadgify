import React from "react";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridFilterModel,
  type DataGridProps,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, type SxProps, type Theme } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { tokens } from "../../theme/theme";

interface AppDataGridProps {
  rows: (Record<string, unknown> & { id: string })[];
  columns: GridColDef[];
  isLoading?: boolean;
  /** Total row count — required for server-side pagination */
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSortModelChange?: (sortModel: GridSortModel) => void;
  onFilterModelChange?: (filterModel: GridFilterModel) => void;
  /** "server" (default) — pagination/sort/filter handled externally; "client" — handled by DataGrid */
  mode?: "server" | "client";
  /** Override the outer container height */
  height?: string | number;
  /** Extra sx merged into the DataGrid */
  sx?: SxProps<Theme>;
  /** Pass-through any extra MUI DataGrid props */
  slotProps?: DataGridProps["slotProps"];
  pageSizeOptions?: number[];
  getRowId?: DataGridProps["getRowId"];
  disableColumnMenu?: boolean;
}

export const AppDataGrid = ({
  rows,
  columns,
  isLoading = false,
  total,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onSortModelChange,
  onFilterModelChange,
  mode = "server",
  height = "calc(100vh - 280px)",
  sx: sxOverride,
  slotProps,
  pageSizeOptions = [10, 25, 50, 100],
  getRowId,
  disableColumnMenu = true,
}: AppDataGridProps) => {
  const { t } = useTranslation();

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    if (newModel.pageSize !== rowsPerPage) {
      onRowsPerPageChange?.(newModel.pageSize);
    }
    if (newModel.page !== page) {
      onPageChange?.(newModel.page);
    }
  };

  const rowsWithId = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        id: row.id || `row-${index}`,
      })),
    [rows],
  );

  const localeText = {
    MuiTablePagination: {
      labelRowsPerPage: t("admin.rowsPerPage"),
      labelDisplayedRows: ({
        from,
        to,
        count,
      }: {
        from: number;
        to: number;
        count: number;
      }) => `${t("admin.showing")} ${from}-${to} ${t("admin.of")} ${count}`,
    },
    noRowsLabel: t("common.noData"),
    noResultsOverlayLabel: t("common.noResults"),
    errorOverlayDefaultLabel: t("common.error"),
  };

  const isServer = mode === "server";

  return (
    <Box
      sx={{
        width: "100%",
        height,
        minHeight: 400,
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={isLoading}
        disableColumnMenu={disableColumnMenu}
        pageSizeOptions={pageSizeOptions}
        paginationModel={{ pageSize: rowsPerPage, page }}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={onSortModelChange}
        onFilterModelChange={onFilterModelChange}
        rowCount={isServer ? (total ?? 0) : undefined}
        paginationMode={isServer ? "server" : "client"}
        sortingMode={isServer ? "server" : "client"}
        filterMode={isServer ? "server" : "client"}
        disableRowSelectionOnClick
        localeText={localeText}
        getRowId={getRowId}
        slotProps={slotProps}
        sx={{
          width: "100%",
          border: `1px solid ${tokens.gray200}`,
          borderRadius: 2,
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: tokens.gray50,
            borderBottom: `1px solid ${tokens.gray200}`,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            color: tokens.gray700,
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: `${tokens.primary}08`,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${tokens.gray100}`,
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${tokens.gray200}`,
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowX: "auto",
          },
          ...(sxOverride as SxProps<Theme>),
        }}
      />
    </Box>
  );
};
