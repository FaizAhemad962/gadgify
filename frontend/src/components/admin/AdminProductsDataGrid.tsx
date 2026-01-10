import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { Box, IconButton } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { AdminDataGrid } from './AdminDataGrid'
import type { Product } from '../../types'

interface AdminProductsDataGridProps {
  products: Product[]
  isLoading?: boolean
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
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
  const { t } = useTranslation()

  const columns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: t('admin.image'),
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          component="img"
          src={params.value || 'https://via.placeholder.com/50'}
          alt={params.row.name}
          sx={{
            width: 50,
            height: 50,
            objectFit: 'cover',
            borderRadius: '6px',
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: t('admin.name'),
      minWidth: 200,
      flex: 1,
      editable: false,
    },
    {
      field: 'category',
      headerName: t('admin.category'),
      minWidth: 150,
      flex: 1,
      editable: false,
    },
    {
      field: 'price',
      headerName: t('admin.price'),
      minWidth: 120,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#ff9800', fontWeight: '700' }}>
          ₹{params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'stock',
      headerName: t('admin.stock'),
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: params.value > 0 ? '#4caf50' : '#f44336', fontWeight: '600' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: t('admin.actions'),
      minWidth: 120,
      sortable: false,
      filterable: false,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onEdit(params.row)}
            sx={{
              width: '32px',
              height: '32px',
              color: '#42a5f5',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.1)',
              },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              if (window.confirm(t('admin.confirmDelete'))) {
                onDelete(params.row.id)
              }
            }}
            sx={{
              width: '32px',
              height: '32px',
              color: '#f44336',
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <AdminDataGrid
      rows={products}
      columns={columns}
      isLoading={isLoading}
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  )
}
