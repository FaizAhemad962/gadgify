import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  CircularProgress,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { Product } from '../../types'

interface AdminProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  page: number
  rowsPerPage: number
  total: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  isLoading?: boolean
}

export const AdminProductsTable = ({
  products,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  isLoading = false,
}: AdminProductsTableProps) => {
  const { t } = useTranslation()

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
  }

  return (
    <Box>
      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#242628',
          color: '#a0a0a0',
          border: '1px solid #3a3a3a',
          borderRadius: '12px',
          overflow: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          minHeight: '500px',
          maxHeight: 'calc(100vh - 280px)',
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(20, 20, 20, 0.7)',
              zIndex: 10,
              backdropFilter: 'blur(2px)',
            }}
          >
            <CircularProgress sx={{ color: '#1976d2' }} />
          </Box>
        )}
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1a1a1a', borderBottom: '2px solid #1976d2' }}>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.image')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.name')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.category')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.price')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.stock')}</TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>
                {t('admin.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  borderBottom: '1px solid #3a3a3a',
                  bgcolor: '#1e1e1e',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: '#2d3339',
                    boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
                  },
                }}
              >
                <TableCell sx={{ py: 1.5 }}>
                  {product.imageUrl ? (
                    <Box
                      component="img"
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 50, height: 50 }}>
                      <Skeleton variant="rectangular" width={50} height={50} />
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ color: '#e0e0e0', fontWeight: '500' }}>
                  {product.name}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0' }}>
                  {t(`categories.${product.category}`)}
                </TableCell>
                <TableCell sx={{ color: '#ff9800', fontWeight: '700' }}>
                  ₹{product.price.toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0', fontWeight: '500' }}>
                  {product.stock}
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(product)}
                    sx={{
                      color: '#1976d2',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        color: '#42a5f5',
                      },
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      if (window.confirm(t('admin.confirmDelete'))) {
                        onDelete(product.id)
                      }
                    }}
                    sx={{
                      color: '#ef5350',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(239, 83, 80, 0.1)',
                        color: '#f44336',
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <Box sx={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
          Showing {total > 0 ? page * rowsPerPage + 1 : 0} to{' '}
          {Math.min((page + 1) * rowsPerPage, total)} of{' '}
          {total} products
        </Box>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: '#a0a0a0',
            '& .MuiTablePagination-selectLabel': {
              color: '#a0a0a0',
            },
            '& .MuiTablePagination-displayedRows': {
              color: '#a0a0a0',
            },
            '& .MuiOutlinedInput-root': {
              color: '#a0a0a0',
              borderColor: '#3a3a3a',
            },
            '& .MuiSvgIcon-root': {
              color: '#a0a0a0',
            },
          }}
        />
      </Box>
    </Box>
  )
}
