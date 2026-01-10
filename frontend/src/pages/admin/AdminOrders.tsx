import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { ordersApi } from '../../api/orders'
import { AdminOrdersDataGrid } from '../../components/admin/AdminOrdersDataGrid'
import type { Order } from '../../types'
import { useState } from 'react'

const AdminOrders = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', page, rowsPerPage, searchQuery],
    queryFn: () => ordersApi.getAllOrders(page + 1, rowsPerPage, searchQuery),
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage)
    setPage(0)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" sx={{ color: '#fff', mb: 3, background: 'linear-gradient(135deg, #1976d2, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {t('admin.orders')}
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder={t('admin.searchOrders')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(0) // Reset to first page on search
          }}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            backgroundColor: '#fff',
            borderRadius: 1.5,
            '& .MuiOutlinedInput-root': {
              color: '#333',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      <AdminOrdersDataGrid
        orders={ordersData?.orders || []}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={ordersData?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  )
}

export default AdminOrders
