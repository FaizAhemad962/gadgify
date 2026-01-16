import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridFilterModel,
} from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface AdminDataGridProps {
  rows: any[]
  columns: GridColDef[]
  isLoading?: boolean
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onSortModelChange?: (sortModel: GridSortModel) => void
  onFilterModelChange?: (filterModel: GridFilterModel) => void
}

export const AdminDataGrid = ({
  rows,
  columns,
  isLoading = false,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSortModelChange,
  onFilterModelChange,
}: AdminDataGridProps) => {
  const { t } = useTranslation()

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    if (newModel.pageSize !== rowsPerPage) {
      onRowsPerPageChange(newModel.pageSize)
    }
    if (newModel.page !== page) {
      onPageChange(newModel.page)
    }
  }

  const rowsWithId = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        id: row.id || `row-${index}`,
      })),
    [rows]
  )

  const localeText = {
    MuiTablePagination: {
      labelRowsPerPage: t('admin.rowsPerPage'),
      labelDisplayedRows: ({ from, to, count }: any) =>
        `${t('admin.showing')} ${from}-${to} ${t('admin.of')} ${count}`,
    },
    noRowsLabel: t('common.noData'),
    noResultsOverlayLabel: t('common.noResults'),
    errorOverlayDefaultLabel: t('common.error'),
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 280px)',
        minHeight: 500,
        overflow: 'hidden', // ⬅️ IMPORTANT
      }}
    >
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={isLoading}
        disableColumnMenu
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={{ pageSize: rowsPerPage, page }}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={onSortModelChange}
        onFilterModelChange={onFilterModelChange}
        rowCount={total}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        disableRowSelectionOnClick
        localeText={localeText}
        sx={{
          width: '100%', // ✅ NOT minWidth
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto', // ✅ horizontal scroll lives here
          },
        }}
      />
    </Box>
  )
}

