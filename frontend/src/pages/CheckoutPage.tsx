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
import { calculateOrderGST, getGSTBreakdown } from '../utils/gstRates'

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

  const calculateGST = () => {
    if (!cart?.items) return 0
    
    // Calculate GST based on product categories and HSN codes
    const itemsWithCategory = cart.items.map(item => ({
      price: item.product.price,
      quantity: item.quantity,
      category: item.product.category
    }))
    
    return calculateOrderGST(itemsWithCategory)
  }

  const calculateShipping = (subtotal: number) => {
    return subtotal >= 5000 ? 0 : 100
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
    const gst = calculateGST()
    const shipping = calculateShipping(subtotal)
    const total = subtotal + gst + shipping

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
  const gst = calculateGST()
  const shipping = calculateShipping(subtotal)
  const total = subtotal + gst + shipping

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('checkout.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('checkout.shippingAddress')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.name')}
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
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
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.city')}
                    {...register('city')}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.state')}
                    {...register('state')}
                    error={!!errors.state}
                    helperText={errors.state?.message || t('common.mustBeMaharashtra')}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    label={t('auth.pincode')}
                    {...register('pincode')}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                {t('checkout.orderSummary')}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {cart.items.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" noWrap sx={{ flex: 1, mr: 2 }}>
                      {item.product.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{t('cart.subtotal')}</Typography>
                  <Typography>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                
                {/* GST Breakdown */}
                {(() => {
                  const itemsWithCategory = cart.items.map(item => ({
                    price: item.product.price,
                    quantity: item.quantity,
                    category: item.product.category
                  }))
                  const gstBreakdown = getGSTBreakdown(itemsWithCategory)
                  
                  return Object.entries(gstBreakdown).map(([rate, info]) => (
                    <Box key={rate} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, ml: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('checkout.gst')} @ {rate}% (HSN: {info.hsn})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{info.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  ))
                })()}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight={500}>{t('checkout.totalGst')}</Typography>
                  <Typography fontWeight={500}>₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{t('checkout.shipping')}</Typography>
                  <Typography>
                    {shipping === 0 ? t('common.free') : `₹${shipping}`}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">{t('cart.total')}</Typography>
                <Typography variant="h6" color="primary">
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Processing...' : t('checkout.placeOrder')}
              </Button>
            </Paper>
          </Box>
        </Box>
      </form>
    </Container>
  )
}

export default CheckoutPage
