import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridFilterModel,
} from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useMemo } from 'react'

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
  // Handle pagination model change
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    if (newModel.pageSize !== rowsPerPage) {
      onRowsPerPageChange(newModel.pageSize)
    }
    if (newModel.page !== page) {
      onPageChange(newModel.page)
    }
  }

  // Memoize rows with index for DataGrid
  const rowsWithId = useMemo(() => {
    return rows.map((row, index) => ({
      ...row,
      id: row.id || `row-${index}`,
    }))
  }, [rows])

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 280px)',
        minHeight: '500px',
      }}
    >
      <DataGrid
      disableVirtualization
      disableColumnMenu
        rows={rowsWithId}
        columns={columns}
        loading={isLoading}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={{
          pageSize: rowsPerPage,
          page,
        }}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={onSortModelChange}
        onFilterModelChange={onFilterModelChange}
        rowCount={total}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        disableRowSelectionOnClick
      />
    </Box>
  )
}
