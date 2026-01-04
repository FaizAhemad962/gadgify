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
  Card,
  CardMedia,
  CardContent,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { ordersApi } from '../api/orders'
import { format } from 'date-fns'

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
        {t('common.back')} to {t('orders.title')}
      </Button>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { md: 2 } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="600">
                  {t('orders.orderNumber')}{order.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('orders.date')}: {format(new Date(order.createdAt), 'PPP')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  label={order.status}
                  color={getStatusColor(order.status)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Payment: {order.paymentStatus}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {t('checkout.items')}
            </Typography>
            {order.items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
                    <CardMedia
                      component="img"
                      image={item.product.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.product.name}
                      sx={{ height: 120, objectFit: 'cover' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('cart.quantity')}: {item.quantity}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </CardContent>
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
                <Typography>{t('checkout.gst')} (18%)</Typography>
                <Typography>₹{order.gst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</Typography>
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
