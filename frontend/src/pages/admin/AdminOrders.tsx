import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material'
import { ordersApi } from '../../api/orders'
import type { Order } from '../../types'
import { format } from 'date-fns'

const AdminOrders = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: ordersApi.getAllOrders,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  // const getStatusColor = (status: string) => {
  //   const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  //     PENDING: 'warning',
  //     PROCESSING: 'info',
  //     SHIPPED: 'primary',
  //     DELIVERED: 'success',
  //     CANCELLED: 'error',
  //   }
  //   return colors[status] || 'default'
  // }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ orderId, status: newStatus })
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('payment.pending'),
      COMPLETED: t('payment.completed'),
      FAILED: t('payment.failed'),
    }
    return statusMap[status] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
    }
    return colors[status] || 'default'
  }

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date)
    const monthIndex = dateObj.getMonth()
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const year = dateObj.getFullYear()
    const day = dateObj.getDate()
    const monthName = t(`months.${monthNames[monthIndex]}`)
    return `${day} ${monthName} ${year}`
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" sx={{ color: '#fff', mb: 3, background: 'linear-gradient(135deg, #1976d2, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {t('admin.orders')}
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: '#242628', color: '#a0a0a0', border: '1px solid #3a3a3a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1976d2', borderBottom: '2px solid #3a3a3a' }}>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.orderId')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.customer')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.date')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.items')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.total')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.payment')}</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: '700' }}>{t('admin.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id} sx={{ 
                borderBottom: '1px solid #3a3a3a',
                bgcolor: '#1e1e1e',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#2d3339',
                  boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
                }
              }}>
                <TableCell sx={{ color: '#b0b0b0', py: 2 }}>{order.id.slice(0, 8)}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: '500' }}>{order.user.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#707070' }}>
                    {order.user.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0', py: 2 }}>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0', py: 2, fontWeight: '500' }}>{order.items.length}</TableCell>
                <TableCell sx={{ color: '#ff9800', fontWeight: '700', py: 2 }}>₹{order.total.toLocaleString()}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={getPaymentStatusLabel(order.paymentStatus)}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                    sx={{
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      '&.MuiChip-colorWarning': { bgcolor: 'rgba(255, 152, 0, 0.15)', color: '#ffb74d' },
                      '&.MuiChip-colorSuccess': { bgcolor: 'rgba(76, 175, 80, 0.15)', color: '#81c784' },
                      '&.MuiChip-colorError': { bgcolor: 'rgba(244, 67, 54, 0.15)', color: '#ef5350' },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      sx={{
                        color: '#b0b0b0',
                        bgcolor: '#242628',
                        borderRadius: '6px',
                        border: '1px solid #3a3a3a',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '0.875rem',
                        '&:hover': { 
                          borderColor: '#1976d2',
                          color: '#fff',
                          bgcolor: '#2d3339',
                        },
                        '&.Mui-focused': {
                          borderColor: '#1976d2',
                          color: '#fff',
                          bgcolor: '#2d3339',
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.15)',
                        },
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#3a3a3a' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                        '.MuiSvgIcon-root': { color: '#b0b0b0' },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#1e1e1e',
                            border: '1px solid #3a3a3a',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                          }
                        }
                      }}
                    >
                      <MenuItem value="PENDING" sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#0d47a1', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>{t('orders.pending')}</MenuItem>
                      <MenuItem value="PROCESSING" sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#0d47a1', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>{t('orders.processing')}</MenuItem>
                      <MenuItem value="SHIPPED" sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#0d47a1', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>{t('orders.shipped')}</MenuItem>
                      <MenuItem value="DELIVERED" sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#0d47a1', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>{t('orders.delivered')}</MenuItem>
                      <MenuItem value="CANCELLED" sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0', fontSize: '0.875rem', py: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#0d47a1', color: '#fff' }, '&.Mui-selected': { bgcolor: '#1565c0', color: '#fff', fontWeight: '600', '&:hover': { bgcolor: '#0d47a1' } } }}>{t('orders.cancelled')}</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AdminOrders
