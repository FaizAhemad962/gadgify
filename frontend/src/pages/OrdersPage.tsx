import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import { ShoppingBag } from '@mui/icons-material'
import { ordersApi } from '../api/orders'
import { formatDate } from '../utils/dateFormatter'

const OrdersPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('orders.pending'),
      PROCESSING: t('orders.processing'),
      SHIPPED: t('orders.shipped'),
      DELIVERED: t('orders.delivered'),
      CANCELLED: t('orders.cancelled'),
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

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('payment.pending'),
      COMPLETED: t('payment.completed'),
      FAILED: t('payment.failed'),
    }
    return statusMap[status] || status
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('errors.somethingWrong')}</Alert>
      </Container>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {t('admin.noOrders')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          {t('common.shopNow')}
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('orders.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {orders.map((order) => (
          <Card key={order.id} sx={{ borderTop: '4px solid #1976d2', '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('orders.orderNumber')}{order.id.slice(0, 8)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.date')}: {formatDate(order.createdAt, t)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ₹{order.total.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' }, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${t('orders.status')}: ${getStatusLabel(order.status)}`}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 140 }}
                      />
                      {order.paymentStatus && (
                        <Chip
                          label={`${t('payment.label')}: ${getPaymentStatusLabel(order.paymentStatus)}`}
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 140 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.items')}: {order.items.length}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {order.items.slice(0, 2).map((item) => (
                      <Typography key={item.id} variant="body2" sx={{ ml: 1 }}>
                        {item.product.name} × {item.quantity}
                      </Typography>
                    ))}
                    {order.items.length > 2 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        + {order.items.length - 2} {t('orders.moreItems')}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    {t('orders.viewDetails')}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  )
}

export default OrdersPage
