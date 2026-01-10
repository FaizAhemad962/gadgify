import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Card
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { ordersApi } from '../api/orders'
import { formatDate } from '../utils/dateFormatter'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
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

  if (error || !order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('errors.somethingWrong')}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3 }}
      >
        {t('common.back')} {t('orders.toMyOrders')}
      </Button>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { md: 2 } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="700" sx={{ color: 'text.primary' }}>
                  {t('orders.orderNumber')}{order.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('orders.date')}: {formatDate(order.createdAt, t)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  label={`${t('orders.status')}: ${getStatusLabel(order.status)}`}
                  color={getStatusColor(order.status)}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`${t('payment.label')}: ${getPaymentStatusLabel(order.paymentStatus)}`}
                  color={getPaymentStatusColor(order.paymentStatus)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {t('checkout.items')}
            </Typography>
            {order.items.map((item) => (
              <Card key={item.id} sx={{ mb: 2, '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ 
                    width: { xs: '100%', sm: '200px' }, 
                    flexShrink: 0, 
                  
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start',
                  }}>
                    <img 
                      src={item.product.imageUrl }
                      alt={item.product.name}
                      style={{ 
                        width: '130px',
                        height: '125px',
                        padding: '6px'
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('cart.quantity')}: {item.quantity}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 2 }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Paper>
        </Box>

        <Box sx={{ flex: { md: 1 } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('checkout.orderSummary')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('cart.subtotal')}</Typography>
                <Typography>₹{order.subtotal?.toLocaleString() || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('checkout.shipping')}</Typography>
                <Typography>
                  {order.shipping === 0 ? t('common.free') : `₹${order.shipping?.toLocaleString() || 0}`}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">{t('cart.total')}</Typography>
              <Typography variant="h6" color="primary">
                ₹{order.total.toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('checkout.shippingAddress')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" gutterBottom>
              {order.shippingAddress.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {order.shippingAddress.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.pincode}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default OrderDetailPage
