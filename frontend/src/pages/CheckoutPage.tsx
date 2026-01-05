import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api/orders'

const shippingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
})

type ShippingFormData = z.infer<typeof shippingSchema>

const CheckoutPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || 'Maharashtra',
      pincode: user?.pincode || '',
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: async (order) => {
      // Create Razorpay payment
      try {
        const paymentData = await ordersApi.createPaymentIntent(order.id)
        
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Gadgify',
          description: 'Order Payment',
          order_id: paymentData.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ordersApi.confirmPayment(order.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              navigate(`/orders/${order.id}`)
            } catch (err) {
              setError(t('errors.paymentVerificationFailed'))
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#1976d2',
          },
        }
        
        const razorpay = new (window as any).Razorpay(options)
        razorpay.on('payment.failed', function () {
          setError(t('errors.paymentFailed'))
        })
        razorpay.open()
      } catch (err) {
        setError(t('errors.failedToInitiatePayment'))
      }
    },
    onError: (error: Error) => {
      setError(t('errors.somethingWrong'))
      console.error('Order creation failed:', error)
    },
  })

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    // Fixed shipping rate of ₹50
    return 50
  }

  const onSubmit = async (data: ShippingFormData) => {
    // Check Maharashtra restriction
    if (data.state.toLowerCase() !== 'maharashtra') {
      setError(t('errors.maharashtraOnly'))
      return
    }

    if (!cart?.items || cart.items.length === 0) {
      setError('Cart is empty')
      return
    }

    const subtotal = calculateSubtotal()
    const shipping = calculateShipping()
    const total = subtotal + shipping

    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      shipping,
      total,
      shippingAddress: data,
    }

    createOrderMutation.mutate(orderData)
  }

  if (!cart?.items || cart.items.length === 0) {
    navigate('/cart')
    return null
  }

  const subtotal = calculateSubtotal()
  const shipping = calculateShipping()
  const total = subtotal + shipping

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="700" sx={{ mb: 4, color: 'text.primary' }}>
        {t('checkout.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Shipping Form */}
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 4, border: '1px solid #eee' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                📍 {t('checkout.shippingAddress')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.name')}
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={t('auth.address')}
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.city')}
                    {...register('city')}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.state')}
                    {...register('state')}
                    error={!!errors.state}
                    helperText={errors.state?.message || t('common.mustBeMaharashtra')}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.pincode')}
                    {...register('pincode')}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Order Summary & Payment */}
          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3.5, position: 'sticky', top: 20, border: '1px solid #eee' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
                📦 {t('checkout.orderSummary')}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              {/* Cart Items */}
              <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2.5 }}>
                {cart.items.map((item) => (
                  <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Qty: {item.quantity} × ₹{item.product.price.toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Price Details */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('cart.subtotal')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('checkout.shipping')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>₹{shipping.toLocaleString()}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3.5, alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{t('cart.total')}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary' }}>
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>

              {/* Payment Method Info */}
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f0f7ff', 
                borderLeft: '4px solid #1976d2', 
                borderRadius: 1, 
                mb: 3 
              }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block', mb: 0.5 }}>
                  💳 PAYMENT METHOD
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  You will be redirected to Razorpay for secure payment
                </Typography>
              </Box>

              {/* Place Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={createOrderMutation.isPending}
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  py: 1.5,
                  bgcolor: '#ff9800',
                  '&:hover': {
                    bgcolor: '#f57c00',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                  },
                }}
              >
                {createOrderMutation.isPending ? t('common.processingPayment') : `🔒 ${t('common.completeOrderAndPay')}`}
              </Button>

              {/* Security Info */}
              <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  ✓ {t('common.sslSecured')} • ✓ {t('common.encryptedPayment')}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </form>
    </Container>
  )
}

export default CheckoutPage
