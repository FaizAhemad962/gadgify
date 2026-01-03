import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
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
        Back to Orders
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="600">
                  {t('orders.orderNumber')}{order.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {format(new Date(order.createdAt), 'PPP')}
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
              Order Items
            </Typography>
            {order.items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      image={item.product.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.product.name}
                      sx={{ height: 120, objectFit: 'cover' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ₹{order.total.toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
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
        </Grid>
      </Grid>
    </Container>
  )
}

export default OrderDetailPage
