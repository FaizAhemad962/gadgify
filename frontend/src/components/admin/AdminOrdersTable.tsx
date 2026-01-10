import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Order } from '../../types'

interface AdminOrdersTableProps {
  orders: Order[]
  onStatusChange: (orderId: string, newStatus: Order['status']) => void
  isLoading?: boolean
  page: number
  rowsPerPage: number
  total: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

export const AdminOrdersTable = ({
  orders,
  onStatusChange,
  isLoading = false,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: AdminOrdersTableProps) => {
  const { t } = useTranslation()

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date)
    const monthIndex = dateObj.getMonth()
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ]
    const year = dateObj.getFullYear()
    const day = dateObj.getDate()
    const monthName = t(`months.${monthNames[monthIndex]}`)
    return `${day} ${monthName} ${year}`
  }

  const getPaymentStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
    }
    return colors[status] || 'default'
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('payment.pending'),
      COMPLETED: t('payment.completed'),
      FAILED: t('payment.failed'),
    }
    return statusMap[status] || status
  }

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
          maxHeight: '600px',
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
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.orderId')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.customer')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.date')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.items')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.total')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.payment')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700', bgcolor: '#1a1a1a' }}>{t('admin.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
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
                <TableCell sx={{ color: '#42a5f5', fontWeight: '600', py: 2 }}>
                  #{order.id.substring(0, 8)}
                </TableCell>
                <TableCell sx={{ color: '#e0e0e0', py: 2 }}>
                  {order.user.name}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0', py: 2 }}>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0', fontWeight: '500', py: 2 }}>
                  {order.items.length}
                </TableCell>
                <TableCell sx={{ color: '#ff9800', fontWeight: '700', py: 2 }}>
                  ₹{order.total.toLocaleString()}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={getPaymentStatusLabel(order.paymentStatus)}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                    sx={{ fontWeight: '600' }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
                    size="small"
                    sx={{
                      color: '#a0a0a0',
                      backgroundColor: '#1e1e1e',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3a3a3a',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#a0a0a0',
                      },
                    }}
                  >
                    <MenuItem value="PENDING" sx={{ color: '#333' }}>
                      {t('orders.pending')}
                    </MenuItem>
                    <MenuItem value="PROCESSING" sx={{ color: '#333' }}>
                      {t('orders.processing')}
                    </MenuItem>
                    <MenuItem value="SHIPPED" sx={{ color: '#333' }}>
                      {t('orders.shipped')}
                    </MenuItem>
                    <MenuItem value="DELIVERED" sx={{ color: '#333' }}>
                      {t('orders.delivered')}
                    </MenuItem>
                    <MenuItem value="CANCELLED" sx={{ color: '#333' }}>
                      {t('orders.cancelled')}
                    </MenuItem>
                  </Select>
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
          {total} orders
        </Box>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
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
